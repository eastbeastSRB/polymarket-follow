# MARKET-FIX-CHECK — the fresh check of MARKET-1's fix batch, before its freeze

MARKET-FIX-CHECK (Sonnet 5.5, max, fresh; the fixer, MARKET-FIX, was Opus), 2026-11-13
13:27Z – 14:11Z (UTC; every stamp from `date -u`), for polymarket-follow's supervisor.
Under check: the diff `3821416..4ea4b41` (16 commits, `20ec89c` … `4ea4b41`), the ruling's
calls 1–12 (decisions 2026-11-13, "MARKET-1's two fresh reviews — the owner's ruling on the
fixes"), MARKET-FIX's own calls and its two questions, both reports
(`market-rules-review-2026-11-13.md`, findings 1–11; `market-code-review-2026-11-13.md`,
M1–M5 and L1–L11), `apps/poller/market1/rules.md`, the code and the tests. **A review
decides nothing:** the supervisor and the owner answer. Evidence: the supervisor folder
`workers/MARKET-FIX-CHECK/` (`progress.md`, `scripts/`) and my scratchpad (paths at the end).

**The limits held, with one slip of mine, repaired.** I opened no recording, no database,
no run folder and none of the paper experiment's new data, took no count from them, made no
API call, started no agent, deployed and registered nothing, and did not touch polymarket-lab.
No MARKET-1, paper or poller command ran against a real path (the built program ran only
inside the tests and on made-up folders). Every build, test and deliberate break ran in a
scratch copy (`git archive` of `4ea4b41`); the repository was clean when I started and is clean
but for this report. **The slip:** I ran `pnpm verify` in a scratch copy whose `node_modules`
were junctions to the real ones. pnpm 11 ran an install there and wrote *through two
scoped-package junctions* into the real repository's `node_modules`: `node_modules\@eslint\js`
and `apps\poller\node_modules\@types\node` were re-pointed into my scratch copy. Nothing
tracked changed (the folder is git-ignored), but the real eslint config and `@types/node`
would have broken once the scratch copy went. I saw it in the next listing and repaired it at
13:32Z: I removed only those two junctions (a non-recursive delete of the link itself) and
recreated them as junctions to their original targets in the real `.pnpm` store (both
exist, `package.json` readable); every other link in both folders was checked (none points
into a scratchpad, mtimes unchanged). From then on no pnpm ran in a scratch copy; `tsc`,
`eslint`, `vitest` and `prettier` were called by node.

## For the owner, in one page

*Words.* The **freeze** locks the program and the rules by a fingerprint; after it, a mistake
can only be put right by a recorded "defect fix" and a new fingerprint. A **look** is one of
the three dates (19 December, 6 February, 8 May) on which the test gives its verdict. A
**deliberate break** is a small wrong change I make on purpose in a scratch copy to see
whether a test notices; a break nothing notices is a *survivor*.

**Verdict: ready to freeze after M0's wording.** The 16 fix commits do what you ruled, and I
found no fault in the program. The part that turns the figures into the verdict gives the same
word, sentence and numbers as before the fix; I checked it against the old code and against
my own code on 33,000 made-up looks. The settings now refuse a MARKET-1 folder placed inside
the paper experiment's or the recordings' folder, and your real `tools/poller.env` passes. The
draft freeze list equals a fresh build, file for file (64 of 64), the paper experiment's own
freeze still verifies (61 of 61), and `pnpm verify` is green. I re-ran all 249 of the fixer's
deliberate breaks (and 12 of my own): 240 killed, 3 broke code that was deleted, and 6 survive
as the fixer said — I judged all six harmless.

**What must change first (one thing).** One sentence of the rules is no longer true: M0 says
that *every* reader of the sealed data "takes the gate and refuses first". After the clean-up
the look's first two reads of the paper experiment's files (`state.json` and the list of the
market-day folders) take no gate. They are still safe — they come after the freeze check
and after the wait for the paper run, so a look that fails the check stops before them — but
the rule must say so. The exact words are in the next section; it changes `rules.md`, so the
freeze list is written again by `--final` anyway.

**What I recommend, but does not block (tests only, no hash changes).** Nothing in the test
suite would notice if someone moved those two reads in front of the freeze check or the paper
wait, or if the program stopped passing its exit code on or releasing its lock; and two printed
details that the new rule words describe (a competition window's end, a basket of exactly 0)
have no test. I wrote two test sketches that close the first four gaps (they pass on the code
as it is and fail on each of my breaks) and describe the last two as small cases; the sketches
are in my folder for a worker to bring into the repository's style. Do this before the first
look (2026-12-21), or sooner.

**What you decide** (each with my recommendation, at the end): apply M0's wording (yes); add the
tests (yes, with it); leave one frozen comment in `gate.ts` as it is (yes); keep the rehearsal
hook (yes).

## Verdict

**READY TO FREEZE AFTER M0'S WORDING** (and, recommended, tests-only pins). No high or
medium finding; nothing the fixes broke. **Findings: 23 distinct findings in the two reports
(11 + 16, four of them the same as another): 17 fixed (each pinned by a test, but for the
small gaps of N2 and N3), 4 accepted and sound (rules 8, 9, L9, L10), 1 answered without code
(rules 10, confirmed by the first run's data), 1 process item done (L11); none open.** Calls 1–12: all made as ruled. New
findings of mine: N1 (must be done before `--final`: M0's words), N2–N5 (tests, comments;
none blocks).

## M0's replacement wording (exact)

Replace `rules.md` lines 37–42, the bullet "**The sealed-data gate:**", with:

```
- **The sealed-data gate:** no file of the collector's recordings, no
  document of its database (the rule book) and no file the paper experiment
  wrote after the cut (`state.json`, `fills\`, `panel\`) is opened for a
  window that reaches the cut unless that check passed: it is the first read
  of `daily` and of `look`, and the gate is open only from it (`gateOf`).
  Each function of `inputs.ts` and `recordings.ts` that opens such a file
  takes the gate and refuses first (`checkSealed`); with the gate closed it
  also refuses any datum at or after the cut. The look's two readiness reads
  (`state.json` and the listing of each market's `panel\` folder) take no
  gate: they come after that check and after the wait for the paper run (M2).
```

Why this is exactly the code: `daily` (`daily.ts:223` freeze check, `:236` date, `:237` gate,
`:238–239` kit, `:241` wait, `:252` `assemble`, whose six readers take the gate) and `look`
(`look.ts:70–78` freeze check, `:95` not due, `:96` already run, `:97–98` wait, `:99` gate,
`:103` `readState()` and `:113` `marketDays()` with no gate); a failed check returns 4 before
any of them. The six readers that take the gate: `readPool`, `ruleBookDocs`, `marketsThrough`
(`inputs.ts:82,115,132`) and `recordingDays`, `checkDay`, `booksAt` (`recordings.ts:55,155,296`).

*Optional, same edit, same file (a pre-existing nit, not a fix's fault):* the next bullet
(lines 32–36) says the kit's `checkKit()` and lib-exits' hash are part of the check that ends
in "exit 4". They are checked in `loadResearch` (`paper/research.ts:349–366`) after it, and a
difference there would be a thrown error (exit 1); a verified list rules it out. Exact words,
replacing lines 32–36:

```
- **Every run starts by checking them** (`gate.ts`): the list exists, names
  every file of what runs, and each has its hash. Otherwise the run writes one
  line, "frozen files differ", and stops (exit 4): nothing sealed opened, no
  page. Loading the kit then checks its fingerprint (`checkKit()`) and
  lib-exits' hash, before anything sealed is opened; a difference there,
  which a verified list rules out, is a crash (exit 1).
```

Applying either edit changes the hash of `market1/rules.md`, so the draft list's hash
(`3073e097…ed27`) is stale at once (the file count stays 64, the eleven paper files do not
move); `--final` writes the list afresh, and the sweep must update the draft hash where
current-task and architecture quote it. **Is the order safe? Yes.** I traced both functions
statement by statement (table above); the freeze check is the first read of each; nothing
sealed is opened before it; the paper run's wait comes before the first read of the paper
store in both. **Is it tested? Partly:** the exit 4 and exit 5 paths are tested (nothing but
the log is written), but the repository's tests cannot see the *order* (N2).

## New findings, by severity

None is high or medium. File:line at `4ea4b41`.

| # | Sev. | Where | Finding | Fix |
|---|---|---|---|---|
| N1 | low, a wording that must be fixed before `--final` | `rules.md:37–42` (M0) | "every reader of them takes the gate" is no longer true of `look()`'s two readiness reads, `look.ts:103` (`new PaperStore(…).readState()`) and `:113` (`store.marketDays(iid)`), which the ruling's call 8 left without a gate (the deleted `checkSealed` could not fire). They are safe by statement order. MARKET-FIX's Q2. | The wording above. |
| N2 | low, tests only | `look.ts:70–103`, `daily.ts:223–252`, `market1.ts:62–63` | The order and the program's way out are not pinned. My breaks k01 (`readState()` before the freeze check) and k02 (before the paper wait) survive every repository test: `PaperStore.readState()` returns an empty state for a missing file, and the unfrozen-look test uses folders that do not exist, so an early read leaves no trace. k11 (`process.exit(0)` for `process.exit(exit)`, losing exits 4 and 5) and k12 (`run.close()` removed, the lock never released at the end of a normal run) survive too; exits 4 and 5 are tested only through `daily()` and `look()`. | Two sketches, outside the freeze list: `scripts/market1-order.test.ts` (`state.json` a *folder*, the recordings root a *file*, so any early read throws; unfrozen → exit 4, live paper run → exit 5, for `daily` and `look`) kills k01 and k02; `scripts/market1-exit.test.ts` (the built program, `look 3` on made-up folders: exit 4 or 5, never 0 or 1, and the lock gone) kills k11 and k12, and gives the same answer before and after `--final`. |
| N3 | low, tests or words | `compute.ts:78`, `compute.ts:106`; `rules.md:7` | Two of call 9's new words are unpinned: M12 C's window "[start, end)" (k06: end included, survives) and S's "a basket of exactly 0 is 'unknown'" (k07, survives). A parent of a sealed store is allowed by `outsideSealed` (documented in the fixer's self-review, not pinned: k09). So the header's "a test pins each rule" is not literally true, as in rules review finding 2. | Three small cases in `market1-rules.test.ts` / `market1-gate.test.ts` (a competition ending exactly at a position's `t`; `basket: 0`; the parent folder accepted), or soften the header when `rules.md` is edited for M0. Recommended: the cases. |
| N4 | nit | `gate.ts:6–10` | The header comment says "every reader of the recordings, the collector's rule book and the paper experiment's files … takes a `Gate`": the same inexactness as N1. It is frozen code; the comment's bytes are in `dist/market1/gate.js`. | Leave it (no code change after this check; M0 and the architecture are the governing text), or reword it in the M0 commit; a comment-only change. |
| N5 | nit, pre-existing | `rules.md:32–36` | See "Optional" above. | The optional wording. |

*Noted, no action.* (a) `summary.ts:40–44` `statOf` uses the by-day error for a set in a single market, so at look 3 the sentence "No mean result as large as X …" could print where M10's two-way error does not exist; markets under 10 give TOO FEW anyway, so it needs a WAVE set in one market for six months. (b) call 5 does not refuse `STATE_DIR` inside a sealed store, or the two own folders inside each other; the real values are on other drives (`E:\polymarket-follow-run\var`, `E:\backups\…`) and nothing MARKET-1 writes can loop or collide (the backup copies a fixed list of names and deletes nothing).

## Every finding of both reports

Reports: RR = the rules review (findings 1–11), the code review's M1–M5 and L1–L11. A row names
the call, the commit(s), the test that pins it and what I did. "Breaks" are the ids of the
fixer's and the reviews' lists (re-run by me; the full count is below).

| Finding | Sev. | Call | Commit | Pinned by | My check | Status |
|---|---|---|---|---|---|---|
| RR1 = M1: the page's "frozen on unknown" | medium | 1 | `20ec89c` | `market1-daily`: "the freeze's date" (the date, and the error's words); the end-to-end page asserts the whole line "Frozen <hash>, 2026-11-20. The rules were frozen on 2026-11-20 …"; a list without its head line makes `daily` reject, nothing written | `\S+` read back in `dist/market1/daily.js:386`; f01, f03, r112, s26, x11 killed; f02 equivalent; k10 (date read late) survives, harmless | fixed |
| RR2 = M3 + M4: the look's assembly and gates untested | medium | 6, 7 | `8dceb89`, `3df3a1b` | `market1-look` (nine made-up looks through the real `computeAll`, nets recomputed from formulas: KEEP; F1; DROP by a 2% fee; days ×2; markets; noise with look 2's z and look 3's sentence; forced leg; WITHHELD; no BASE); `market1-look-run` (a small world ready for look 1: exit 4 and exit 5 after 6 h, readiness ×3 to the millisecond, forced leg, after-the-verdict ×4, Monday edge, next look's z, holes, the page's band) | `lookVerdict` equals the old assembly and my own M10/M11 code on 33,000 looks; r60, r61, m11, m13–m14, m57, m80–m85, m87, m88, r62, r64, r65 all killed | fixed (order: N2) |
| RR3: M11's order unsaid | medium | 3 | `79312a8`, `29e0ab3` | `market1-rules`: WITHHELD with `se: null, days: 1, markets: 1, mean: −100`; F5 guards DROP too | k03 (the swap) killed; text = `stats.ts:90–98` | fixed |
| RR4 = L7: the box after a verdict | low | 4 | `848dacf` | `market1-daily` `verdictBox`, seven cases (KEEP; DROP then WITHHELD; KEEP, TOO FEW, DROP; WITHHELD then DROP); look-run: `afterTheVerdict` ×4 | f11, f12, f13, k08 killed; M14's new sentence = code | fixed |
| RR5: M1 "nothing at or after END" | low | 9 | `79312a8` | words | the code reads every closed day's check and coverage, also past END, and the hour after a leg (frame `ts` ≤ x < END) and nothing else: the new text says exactly that | fixed |
| RR6: OWN's "dir ×", the brackets' ± | low | 9 | `79312a8` | `market1-rules`: "OWN is … dir × …", forced sell and forced buy | k05 killed; the four exceeding errors (37.7, 42.3, 100.3, 49.9) are the builder's list | fixed |
| RR7: builder's calls a2, d, e and the trailing gaps untested | low | 7 | `e4dca4a`, `3df3a1b` | recordings by hand (coverage differs / missing / unlisted / unparsed → whole day; unreadable; changed after its check; missing day; newest `ts`); book: refused channel, never-reopened connection and a second stop; `dayAlarm(999/1000, 10)`; look-run: forced leg "recording not final at the look", open position at END − 1 ms (arithmetic apart), coverage alarm with its reason | m54, m24b, r21–r25, m72 killed; y03 equivalent | fixed |
| RR8: six files outside the list | low | 10 | — | — | closure of `dist/market1.js` re-run: 31 files, the same six outside (`schedule`, `lock`, `log`, `store/db`, `store/universe`, `api/schemas`); four are hashed in each day's log | accepted, sound |
| RR9 = a malformed manifest | low | 10 | — | — | `checkDay`, `booksAt` still throw (loud stop, exit 1); the collector writes the manifest by rename; if it ever fires: a defect fix and a new list | accepted, sound |
| RR10: the book level's unit | low | 11 | no code | — | `M7`'s sentence unchanged; the first run's data confirm | answered; confirmed at the first run, as ruled |
| RR11: small words | low | 9 | `79312a8` | quartile index (k04 killed), Student band with t computed apart (m10), `noBase`, the alarms list; **not pinned: C's end, S's zero (N3)** | text = code for every item | fixed in words |
| M2: the book lookup's JSON spacing | medium | 2 | `9f697d3` | `market1-recordings`: a frame spaced on both sides of every colon is found by the day check and `booksAt`, with its book, receive time, file and text | f04, f05, f06 killed | fixed |
| M5: the recordings' integrity branches | medium | 7 | `e4dca4a` | five tests (above) | all eight breaks killed | fixed |
| L1: names, limits, heartbeat catch | low | 7 | `a44d8ae` | `market1-gate`: the paper pair equals `paper/run.ts`'s and the four names differ; `openRun` beat, stage and release under fake time; the catch; EPERM (ran here: the platform refuses a signal to pid 4); 6 h and 1 min; rename tries | m60–m64, m74, m20, m21, r90 killed | fixed |
| L2: the recorded fee and its alarm | low | 7 | `3df3a1b` | a recorded 8 bps schedule: each leg's fee and the alarm line on the page and in the log | r40, m44 killed | fixed |
| L3: printed numbers | low | 7 | `29e0ab3`, `3df3a1b` | Student band; win share, quartiles, costliest third, busiest days, worst 5%; OWN and S at 5 coins; the 500 rows; the band's z; coins left out; the frozen line | m10, m40, m48, r44, r51, r77–r80, r106, r107, r112 killed | fixed |
| L4: the backup | low | 7 | `29e0ab3` | seven folders, a same-size change, nothing deleted; the look's result and the manifest in the copy | m22a, m22b, m23, r53 killed | fixed |
| L5: dead and test-only code | low | 8 | `74ccacf` | the empty list now has a test | see the next section; r30, m69, m73 broke code that is gone; rehearsal hook kept (Q1) | fixed |
| L6: copies | low | 8 | `74ccacf` | — | the one-liners (`DAY_MS`, `dayOf`, `DayCheck` by `z.infer`, `RunRecord` exported and used by the look); the `lock.ts` helper and the shared preamble stay, as ruled | fixed as ruled |
| L8: the entry point, the sealed folders | low | 5, 7, 10 | `3e901bb`, `916e23b`, `a44d8ae` | `market1-entry` (the built program): exit 2 four ways and the sealed-folder refusal, one line, nothing created; exit 3; exit 1; `market1-gate`: six refusals, siblings allowed, the real `poller.env` | f07–f10 killed (f09 only after `ab19562`), f19 killed; **the final `process.exit(exit)` and `run.close()` not pinned (N2)** | fixed |
| L9, L10: names, shape, test shape | low | 10 | — | — | unchanged; for the second arm | accepted, sound |
| L11: breaks edit the real tree | low | 12 | `3821416` (code-rules) | — | MARKET-FIX's harness refuses a root outside its scratch; the tree was clean at my start | done |

**Calls 1–12:** 1 `20ec89c`; 2 `9f697d3`; 3 `79312a8` and `29e0ab3`; 4 `848dacf`; 5 `3e901bb`;
6 `8dceb89`; 7 `e4dca4a`, `a44d8ae`, `29e0ab3`, `3df3a1b`, `da21622` (time limits) and `ab19562`
(two gaps its own breaks found); 8 `74ccacf`; 9 `79312a8`; 10 accepted as ruled, with its one
line change `916e23b`; 11 no code (the book unit: the first run confirms); 12 no commit
touched the paper experiment's scope (`git log paper-freeze-1..HEAD` over `src/paper`,
`src/paper.ts`, `research/`, `experiment/`: 0 commits), the collector, the shared files, the
lockfile or the tsconfigs, and the 16 commits changed nothing but MARKET-1's own files, one
reproduction script and docs. All made as ruled.

## The brief's checks, one by one

**1. `lookVerdict` against the old assembly.** The refactor moves ten lines and changes none: the
old `look.ts` took `summarize` at the look's z, fed `verdict` seven values and called
`sentence`; `lookVerdict(kit, wave, k)` does the same and returns `{z, summary, verdict,
sentence}`. I ran both (the old code verbatim from `3821416`) and my own code from M10/M11 (own
CR1, own order) on 33,000 made-up looks (three seeds; 0–140 positions on 1–40 days in 1–14
markets, means −300 to +400, with pending, unpriced, mark-priced and depth-short positions,
exact boundaries: 2 or 3 of 20 not at the book, 19 or 20 days, 9 or 10 markets, excess null,
0 or positive): the whole summary object, the verdict, the sentence and `z` are deep-equal to
the old assembly's in all 33,000, and the verdict, the sentence, the mean, the days, the
markets and the share equal mine, the error to 8.5e-14 bps (KEEP 424, DROP 839, WITHHELD and
TOO FEW the rest; `scripts/check-lookverdict.mjs`).

**2. The verdict box after a first KEEP or DROP (call 4).** `daily.ts:163–189`: the first look
that said KEEP or DROP stays on show with its sentence, no next look is named, and each later
look run adds one line "After the verdict: Look j (<END_j>): WAVE V." — M14's new sentence and
M11's "later looks … marked 'after the verdict'", word for word; before any verdict the latest
look, its sentence and "Next look <date>." as before (the old condition on the verdict word is
always true there). `result.json`'s `afterTheVerdict` and the page agree for every state
(`look.ts:153–155` marks look j after a KEEP or DROP at an earlier look). The page escapes
and prints one `<p>` a line, and the banned-word scan finds none in the new words.

**3. The deleted code (call 8): no guard lost.**

| Deleted | Why nothing ran on it | |
|---|---|---|
| `gate.ts` empty-list guard | with an empty list every one of the 11 `PAPER_FILES` is "not in the freeze": the problems are never empty; the case now has a test | safe |
| `gate.ts` `CLOSED` | tests only | safe |
| `look.ts` `checkSealed(gate, end, …)` | the gate was `{open: true}` by hand: it could not fire; now `gateOf(freeze)` after the return 4 | safe; its readers are the two ungated reads (N1) |
| `look.ts` `legFinal(days, end − 1)` | `legFinal(days, x)` ⇔ some closed day ≥ the day after x's; END's day ≤ END's next day, so it is implied (checked: 11,264 subset and END pairs, none to the contrary; s11, its weaker form, is killed) | safe |
| `recordings.ts` `frame.ch !== book::iid` | the pre-filter's id is the first `"ch"` in the text; a frame the server sends has one; now a duplicate `ch` key or `book::08` would be taken for the market of the first match: the server sends neither, and the day check parses every line by the same schema | safe, a small trust (the fixer's self-review) |
| `assemble.ts` `days`, `checks`, `checkedNow` | no caller read them (the build is green) | safe |
| `summary.ts` `LineSummary`; `daily.ts` `?? runDate` | unused; every WAVE row's key was added to `seen` at `daily.ts:266` before `pageData` | safe |
| `look.ts` own `logLine` and manifest append | `RunRecord.logLine` and `write` + `flushManifest` write the same file, bytes and line (`${sha256} *${rel}\n`); the look test asserts the manifest line | safe |

**The seal, in `daily()` and `look()`.** Traced statement by statement (see above): nothing
sealed is opened before the freeze check in either; the first read of each is the check. In
`daily` the first sealed reader is `assemble`'s `readPool`, which takes the gate; in `look` the
order is check, not due, already run, wait, gate, kit, then the two ungated reads, then the
gated ones. The tests: exit 4 writes only `log\`, exit 5 after 6 h writes nothing; r60 and r61
(the check or the wait deleted) die; **a move of the reads is not seen (k01, k02: N2).**

**4. The settings' refusals (call 5).** `run.ts:51–62,80–87`: `path.relative(sealed, own)`;
refused when it is empty or inside (`..m1` is inside: `f09` died only after `ab19562` added
the case); allowed when it is `..`, begins `..\` or is absolute (another drive). I ran 16
combinations on the built parser (`scripts/check-settings.mjs`): the real `tools/poller.env`
values are accepted; equal, inside, upper case, trailing backslash, forward slashes and a path
that goes back in through `..` are refused with one line naming the setting; a sibling
(`paper-market1`, `..recordings`), `..\market1`, the parent of the stores and another drive are
accepted; a relative path says "must be an absolute path"; a missing setting gives only its
own message and no throw. **What it does not refuse, and the real file:** the two own folders
against each other and `STATE_DIR` inside a store, and the parent of a store; the real values
are `F:\polymarket-follow\market1` and `E:\backups\polymarket-follow\market1` against
`F:\polymarket-follow\paper` and `F:\polymarket-follow\recordings`, `STATE_DIR`
`E:\polymarket-follow-run\var`: none of the unrefused cases occurs, and none could lead MARKET-1
to write into a store (it writes a fixed list of names under its root, copies and deletes
nothing in the backup). It does not matter.

**5. `freezeDate` (call 1).** `daily.ts:498–505`: `\S+` (read back in `dist`), `FROZEN_FILE`
(the same path the gate reads), a missing head line throws. It is read in `daily` right after
the freeze check (`:236`), before the kit, the wait and every sealed read, so a list without
its head line (which still verifies: the gate reads hash lines only) ends the run with a thrown
error, exit 1, nothing read, nothing written (the end-to-end step 11 asserts the log and the
`books` folder unchanged). `look` does not read the date: it writes no page. The freeze tool
always writes the line (`market1-freeze.cjs`: line 2), and the rehearsal's list carries one.

**6. The book-line filter (call 2).** `recordings.ts:337–339`: `/"ch"\s*:\s*"book::(\d+)"/`, read
back in `dist`. The test's frame is spaced before and after every colon, after commas, and
with the day check, `booksAt` and the found line's book, receive time, file and text all
asserted; f04, f05, f06 die. What it now trusts: the market number of the first `"ch"` match
(above); everything else is still parsed by the Zod schema (`parseBookText`), so a line that
fails it is skipped here and counted at the day check.

## The rules text against the code, for the rules the fixes touched

| Rule | Touched by | Text against code |
|---|---|---|
| M0 | none (the gap) | the sealed-data sentence: N1; the kit bullet: N5; the rest as before (list, scope, eleven files, `gateOf`) |
| M1 | call 9 | exact (item 1 of RR5 above) |
| M7 | call 9 (M1's cross-reference) | unchanged; the text of M1 points at it correctly |
| M11 | calls 3, 9 | the order is `stats.ts:90–98`; "priced positions that have one" is `summary.ts:116–119`; "no BASE cell or no marks" is `noBase`; the sentence is `sentence()` |
| M12 | call 9 | OWN `dir ×` = `compute.ts:52`; the ± note = the builder's list; C "[start, end)" = `compute.ts:78` (unpinned); S "exactly 0 or fewer than 5 coins is unknown" = `compute.ts:106` and `lines.ts:179` (the 0 unpinned) |
| M13 | call 9 | quartile ⌊q·n⌋ = `summary.ts:25`; "no marks for the gross on marks" = `noBase`; 0.8416212 = the paper's `Z_POWER` |
| M14 | calls 1, 4, 9 | the alarms list = `daily.ts:420–436` and the fee and backup lines; the box = `verdictBox`; the frozen line = `page.ts` and `freezeDate` |
| M15 | none | the look's reads and the wait as `look.ts:95–134` (F11 is `legFinal(days, end)`, which implies END's day) |

## MARKET-FIX's questions

**Q1, the rehearsal hook kept (`DailyIo.rehearsal`, `readPool`'s `from`): agree, keep it.** Production
never passes an `io` (`market1.ts:59`); the hook can only lower the cut and only for a run whose
END is not after the cut (`daily.ts:220`, pinned by the end-to-end step 10), so it can reach
nothing sealed; the bridge rehearsal (F7) runs through the real `daily()`, with its record,
second run and page, which is what it is evidence of; removing it would redesign the rehearsal
and void its evidence. The comments say who passes it.

**Q2, M0's "every reader": do not leave the rule as it is; apply the exact words above** (the
supervisor's call, and the code's order is safe and now stated).

## The draft freeze list, the paper freeze, `pnpm verify`

- `market1/FROZEN.draft.sha256`: 64 files, SHA-256
  `3073e0971016893f47d603f92f3b2844c777c3afabf28e4d3492e5d91b31ed27`. A fresh scratch build of
  `4ea4b41`: 64 of 64 hashes equal (`sha256sum -c`), and MARKET-1's own built gate accepts the
  list as a freeze (ok, 64 files, the same SHA-256) and scopes exactly 64 files: it covers what
  runs. The import closure of `dist/market1.js` is 31 files, 25 in the list, six outside (the
  six shared files, as accepted); the three listed files outside the closure are the paper's
  `loop`, `reader`, `reparse` ("reads with"). The head line is the second line.
- The paper experiment's eleven files in the list equal the paper freeze's lines (11 of 11); the
  paper freeze (`experiment/FROZEN.sha256`, 61 files, `d04d3cd8…f31c`) verifies 61 of 61 on that
  build, and its own built gate says ok; `git diff paper-freeze-1 HEAD` over its scope is empty.
- `pnpm verify` in a scratch copy of `4ea4b41`: green — build, `eslint .`, 45 test files and 1
  skipped, 376 tests passed and 3 skipped (the old weeks' real-data tests, which wait for
  `MARKET1_PRECUT`), `prettier --check .`. The MARKET-1 tests alone (11 files, 10 run): 94 passed
  and 3 skipped, twice, 6.7 s and 6.9 s. 47 more tests than before the fixes (329).

## The break spot-check

I re-ran every break, not ten: the fixer's 249 (MARKET-BUILD's 75, the rules review's 41, the
code review's 77 and the first session's 37 rebuilt, 19 of the fixer's own, with its harness
copied into my folder and its path guard tightened to my scratch) and 12 of my own (k01–k10 in
the same pass, k11 and k12 after it), in scratch copies of `4ea4b41` (baselines pass; every find
text occurs once; 3 "code deleted" as the fixer said). **The fixer's 249: 240 killed, 6 survive, 3 broke deleted code (m69, m73, r30) — exactly its
claim; none was killed by a time limit alone.** The six: **y03** (an open position at END − 2 ms:
the same minute, session and funding as END − 1 ms), **r42** (a forced look prices legs past END
at the mark: those positions are in no set), **r100** (an account whose P is the cut: the window
[CUT, CUT) holds no row), **m70** and **m71** (legs at or past END, or P's, are decided and
recorded: record lines only, the price is the same), **f02** (the throw above guards the line):
equivalent in value, as it says. **Survived before the fixes and killed now** (the brief's
three, and the rest of the lists): r60, r61, r112, r40, m44, m22a, m22b, m23, r53, m24b, m54,
r21–r25, m72, m60–m64, m74, m20, m21, r90, m10, m40, m48, r44, r51, r77–r80, r106, r107, m11,
m13–m14, m57, m80–m85, m87, m88, r62, r64, r65. **My twelve:** killed k03 (M11's order), k04
(quartile index), k05 (OWN's `dir ×`), k08 (the box's later lines); survive k01, k02, k11, k12
(N2), k06, k07, k09 (N3), k10 (the date read late: harmless). My sketches kill k01, k02, k11, k12.

## What I did not check

The real recordings, the rule book and the paper store (sealed), the real frame text, the real
size of a day; the book level's unit (the first run); the old weeks' reproduction and the
bridge rehearsal (optional; MARKET-FIX ran both before and after, equal; the pure files they
exercise — `book`, `compute`, `fills`, `lines`, `price`, `waves`, `page`, `inputs` — are
byte-identical to `3821416`, and `stats` and `summary` differ only by an import (and, in
`summary`, an unused type)); the deploy and
task scripts (unchanged since MARKET-CODE-REVIEW's read); Task Scheduler's behaviour; F19 (the
recordings' disk), Q4 of the code review (the rule book's size).

## Questions, each with my recommendation

1. **Apply M0's wording above before `--final`?** Yes, with the optional kit-bullet wording; one
   commit; `pnpm verify`; then `--final`. A short read of the changed lines is enough.
2. **Bring in the tests** (the two sketches `market1-order.test.ts` and `market1-exit.test.ts`,
   and three small cases for C's end, the zero basket and the parent folder)? Yes, in the same
   commit (tests are outside the list: no hash changes); at the latest before look 1
   (2026-12-21).
3. **`gate.ts:6–10`'s comment?** Leave it: no code change after this check; M0 and the architecture
   (already exact) govern.
4. **The rehearsal hook?** Keep (Q1).
5. **For code-rules** (the supervisor's file): (a) a test that pins an *order* makes the early read
   throw — a folder where a file is read, a file where a folder is listed — because a missing
   path reads as empty; (b) never run `pnpm` in a scratch copy whose `node_modules` are
   junctions: pnpm re-links through the junctions of scoped packages into the real
   `node_modules` (found 2026-11-13, MARKET-FIX-CHECK); call `tsc`, `eslint`, `vitest` and
   `prettier` by node, or make the copy a real install.

## Slips, all of them

(1) The `pnpm verify` write-through (above, repaired, nothing tracked touched). (2) Twice a Bash
heredoc halved a `\n` in my own break list (a syntax error, found at once and mended with the
Edit tool; no break ran on a broken list). (3) My first recomputation script held an assertion
with a precedence slip that tested nothing; I fixed it, re-ran all three seeds and quote the
re-run's counts. (4) The tool refused a first draft file named like a report in my own folder; I
did not work around it by shell, and wrote the report once, at the path the brief names.

## Evidence

`workers/MARKET-FIX-CHECK/`: `progress.md` (the log with times), `scripts/` — `mkscratch.mjs`,
`import-closure.mjs`, `implied.mjs`, `check-lookverdict.mjs`, `check-settings.mjs`,
`gate-check.mjs`, `breaks/` (the fixer's harness and lists copied, `mine.mjs` with k01–k12,
`summarize.mjs`), `run-one.mjs`, `market1-order.test.ts`, `market1-exit.test.ts`. MARKET-FIX's
hand-back (its self-review) was read from its transcript, read only. My scratchpad
`…\scratchpad\MARKET-FIX-CHECK\`: `verify-head.txt`, `draft-check.txt`, `paper-check.txt`,
`import-closure.txt`, `implied.txt`, `check-lookverdict-{1,2,3}.txt`, `check-settings.txt`,
`gate-check.txt`, `breaks-full-{0,1}.json` and `.log`, `breaks-k11.json`,
`market1-tests-{1,2}.txt`, `fixer-handback.txt`; the scratch copies `repo-head`, `repo-b1`,
`repo-b2`, `repo-b3` (junctions inside: never delete them recursively).
