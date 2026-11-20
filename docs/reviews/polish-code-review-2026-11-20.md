# POLISH-CODE-REVIEW — the Final review of the exam's code, before its freeze

POLISH-CODE-REVIEW (Sonnet 5.5, max; the builders were Opus), 2026-11-20, for polymarket-follow's supervisor. Stamps are from `date -u`; I worked 05:43Z to 08:35Z. Save as `docs/reviews/polish-code-review-2026-11-20.md`.

**Under review.** Commits `614262e`..`5e5619f` (17 commits touching `apps/poller` and `tools`, plus the docs commit):
- `src/polish/exam/` (10 files, 3,155 lines);
- the 18 analyzer modules the exam changed (845 lines);
- `apps/poller/polish/` (rules.md P0–P17, 625 lines; fresh.sha256; fresh-unpaired.json; the draft list);
- `tools/polish-freeze.cjs` (326 lines);
- the tests (12 files, 5,540 lines).

HEAD moved to `985c6ff` while I worked. Those commits are docs only; `apps/` and `tools/` are identical to `5e5619f`. I read the last three commits (`ecca416`, `510c05b`, `5e5619f`) line by line. **A review decides nothing.** My evidence is in `workers/POLISH-CODE-REVIEW/progress.md` and in my scratch folder.

**The limits held.**
- Nothing of FRESH was opened. I listed `F:\polymarket-follow-research\` top-level folders and read `ANALYZER\POLISH-RULES\placebo.json` and the ten months' store manifest. I did not open `ANALYZER\FRESH` or any `repro*` file.
- One light script (`reproseal.mjs`) calls `extract()` with a root named `…\ANALYZER\FRESH\repro`. The seal answers by name before any file call.
- No network, no deploy, no Task Scheduler, no agents; polymarket-lab untouched.
- I edited nothing in the repository, and its tree is clean.
- Until the word (07:39Z) I ran only light scripts on the compiled `dist` and on repository files.
- After the word, builds, tests and breaks ran only in scratch copies (`git archive` of HEAD, `node_modules` as junctions into the repository's; no pnpm; nothing deleted). Runs were one at a time, below-normal priority, 2 vitest workers.

## For the owner, in one page

*Words.*
- The **freeze** is a list of every file the program runs with its fingerprint. FRESH opens only if the list matches the files and a git tag holds the same list.
- The **seal** refuses every FRESH file until then.
- The **twin build** is FRESH's extraction done twice and compared byte for byte.
- The **safety net** hands the exam to N when the 715 line spans under 20 days or 10 coins.
- A **break** is a one-line change I make in a scratch copy to see whether some test notices. A **survivor** is a break nobody notices.

**Verdict: after these fixes.** It is not a rework. I found no way for the exam to give a wrong verdict silently, and nothing that opens FRESH early or touches the live programs.

**What I think of it.**
- The code is precise and plain. Every number has one home (`design.ts`) and a test holds it to the rules table. Every outside file is held to a SHA-256 or parsed, and an unknown input stops the run (exit 4 to 7) instead of being guessed.
- The tests are the strongest part. The price is WAVE-H's own pricing, line for line, and a test compares every field to the bit. Independent recomputations pin the verdict, BASE and the placebo.
- Structure fits: `src/polish/exam/` beside `tries/`, one module a concern, tests named for them, the live programs untouched.
- No filler. The comments mostly say why. The surplus is small: about 115 comment citations (D/T/Q numbers) point to a plan that lives outside the repository, two identical helpers, a few stale headers, three constants no program reads.

**What is in order** (details below):
- No source of WAVE-H, MARKET-1, the paper experiment, `schedule` or `log` changed.
- The three freezes (74, 64 and 61 files) equal the disk.
- The draft list equals a fresh build in another folder, 125 of 125.
- The freeze tool runs end to end in a scratch repo (a rehearsal below).
- The bars equal `placebo.json` to the double.
- The verdict function equals my own implementation on 30,000 random sets.
- The whole suite passes in a clean scratch copy: 89 files + 1 skipped, 814 tests + 5 skipped, 473 s.
- The breaks: 72 of 77 killed, and the 5 survivors are explained below.

**What must change before the freeze** (three, each small):
1. **Look 1's reproduction cannot run.** `reproduce` into `ANALYZER\FRESH`, as P15 says, is refused by the program's own seal, because that step is not given the seal. The fix is four lines.
2. **Step 1 does not print the denominator of your 5% rule** (P15). The numerators are there. The natural quotient comes out about 7 times too small, which would hide a real defect.
3. **One test pins the state before the freeze.** The first `pnpm verify` after the tag goes red on it (shown below).

Each of these changes the code's fingerprint. So the draft list is written again and the reproduction is run by the frozen program at look 1, as the plan already says.

**What will probably happen at look 1.**
- **Step 1 will likely stop once at the pairing check (exit 6), after both builds.** The ten months hold 3 one-sided trades in 8,846 files. FRESH has 4,102 files, so about 1.4 are expected; the chance of at least one is about 75%.
  - The path: a decisions entry, then `fresh-unpaired.json`, then a re-freeze (tag 2), then step 1 again.
  - A re-freeze that touches only that file leaves `dist/polish` unchanged, so `repro.json` stays valid and the parts are reused.
  - Plan half a day. Moving the integrity check before the twin build would save about an hour on that path. I would not change the rules for it.
- **The twin build may differ (exit 7).** Run 1's one-off misread and the collector's crash point to the PC's memory under load. The memory test you were asked for should come first.
- **HOLDS is unlikely by design** (4 to 5% at look 1 by the placebo's own power numbers). WITHHELD is unlikely under option B (1.8%).
- **Step 2's verdict is one-shot and computed in memory.** P15.6's independent final review is the safeguard against a memory fault there.

**Fit with look 2 and what follows** (notes, no code):
- `look.ts:121` prints "the archive's listing of 2026-11-13" as hard text. `look.js` is not in `LOOK2_ALLOWED`, so FRESH-2's no-book days would carry the wrong date. Put the date in one `design.ts` constant now.
- `run.ts` `FreshSettings` requires `…\FRESH\store`, and `run.js` is not in the allow-list. FRESH-2 must therefore be fetched into that same folder, or `run.js` joins the allow-list now.
- `steps.ts` hard-codes `LOOK1` and `BARS[0]`. That file may change at freeze 2, so make them parameters then.
- The allow-list is file-level only. At freeze 2 someone must read the diff of the six compiled files; `main.js` holds the gate call and `seal.js` the seal.
- The path from `main.ts` through steps 1 and 2 has never run end to end before the real look. The seal opens only on a tagged freeze, and `FRESH_RANGE` is fixed. A rehearsal on a FRESH-sized synthetic world, in a scratch repo with a synthetic tag, would have caught finding M1. It is worth a builder's half day, for look 1 and again for look 2.
- For the second arm, the recipe numbers will need a shared home, or a test that holds the copies equal.

**What I could not check.** FRESH's data (sealed), so no real counts, prices or timings; the machine's memory; `tools/waveh-fetch.cjs` beyond its usage text; the real `--books` run.

## Findings

Line numbers are at HEAD (`apps/` as of `5e5619f`).

### High
None.

### Medium

**M1 — `reproduce` is refused by the program's own seal at look 1.**
- `exam/steps.ts:255-263` (`ReproInput` has no seal), `:421-441` (`extract({…})` and `openStore(path.join(root, STORE))` take no seal), `main.ts:252-263` (hands none).
- P15.2 says the reproduction runs again at look 1 "into `ANALYZER\FRESH`", so its root is `…\ANALYZER\FRESH\repro`, sealed by name. The frozen program would exit 5 ("FRESH is sealed") although the freeze verifies.
- Shown with `reproseal.mjs` on the compiled modules: `extract` with no seal throws `SealedError`; with the seal open it passes the seal check. No test calls `reproduceStep`: its built-program test covers only the exit-2 settings cases (`polish-exam-repro.test.ts:444-479`). Both real runs used `ANALYZER\POLISH-RULES`.
- Fix:
  - `seal: Seal` required in `ReproInput`;
  - `main.ts` passes `seal` in `repro: {…}`;
  - `extract({…, seal: o.seal})` and `openStore(…, o.seal)`.
- A regression test needs the extraction part pulled into a small exported function (with `range` as a parameter, default `WAVEH_RANGE`), run on a root named `…\ANALYZER\FRESH\repro`, open and closed.
- Without a code fix, the workaround is to run the final program's `reproduce` in another EXAM_ROOT and copy `repro.json` into `ANALYZER\FRESH`; `lookGate` reads only `passed` and `identity.code`. That contradicts P15's words.

**M2 — Step 1 prints the numerators of P15's 5% rule, not the denominator.**
- `exam/look.ts:207-214` (`countsOf`): `positions` is by `where` over all 147 slices (`p.slice < K` is not applied), while `left` and `fundingWithoutPrice` are over the deciding days. The look test's own world shows it: `counts.positions.N` has 4 in segment 1, of which 3 are on the deciding days (`polish-exam-look.test.ts:228-232`).
- The right denominator, `lines[n].filter(onDeciding).length`, appears only in step 2's `result.json`. P15 asks the supervisor to read the share before the books are fetched.
- Fix: print `onDeciding` counts by line and, for the deciding line, `{of, leftOut, fundingWithoutPrice, share}` in `counts` (one field, one assertion).

**M3 — A built-program test pins the state before the freeze.**
- `test/polish-exam-placebo.test.ts:794-811` expects `FRESH is sealed` on an `ANALYZER\FRESH`-named root and `"examSealOpen":false`. After the list is committed and tagged, `verifyExamFreeze(PACKAGE_ROOT)` is ok and the seal is open.
- Shown in the rehearsal: on the frozen scratch repo, 108 of 109 exam tests pass; the failure is `polish-exam-placebo.test.ts:799`, "expected '' to contain 'FRESH is sealed'". Line 811 would fail next.
- The successor saw the same trap for exit 4 (`mn01`) but not here.
- Fix: expect `examSealOpen` to equal `verifyExamFreeze(PACKAGE_ROOT).ok`, and run the sealed-root case only while it is false.

### Low

**L1 — Step 2's wiring is partly unpinned.** Three of my breaks survived:
- **w1:** step 2 decides on N whatever step 1 named (`steps.ts:854`). No test runs `stepTwo` with the 715 line deciding; the test world has the net fire. The 715 line is the likely real path.
- **w14:** step 2 never holds `placebo.json` to its SHA-256 (`steps.ts:803-811`). Only `heldFile` itself is unit-tested.
- **w17:** step 2 does not need `step1.json` (`steps.ts:776-777`).
- Fix: three tests. For w1, give `ExamDesign` a `safetyNet` field as it has `recipe`, so a small world can have the 715 line decide.
- `reproduceStep`'s wiring has no direct test (M1).

**L2 — `matchLook`'s length check is one-sided** (`exam/repro.ts:171`, `lines.length < spots.length`). The look file has 1,589 lines (1,299 WAVE-H plus 290 SIZING), so `<` is the loosest correct test, but a dropped tail of our positions would pass.
- Fix: count the look's lines with `set === "WAVE-H"` and require equality with `spots.length`.

**L3 — Step 2 does not hold step 1's program or freeze.**
- `Step1File` (`steps.ts:739-749`) reads only `freshStore`, the positions SHA-256 and the books hash. A re-freeze between steps 1 and 2 could mix programs. `result.json` shows both, so it is visible but not refused.
- `step1.json` writes `builds` and `integrity` SHA-256s (`steps.ts:710-711`) that nothing reads back.
- Fix: refuse when `step1.identity.code` or `step1.identity.exam.sha256` differs from the running program's, and hold the two files, or drop the two fields.

**L4 — Look-2 fit.** See the notes above: `look.ts:121` and `design.ts:49` (date text), `run.ts` `FreshSettings`, `LOOK1` and `BARS[0]`.

**L5 — THE PLAN is outside the repository.** About 86 D-numbers and 29 T/Q numbers in `src/polish/exam` cite `workers/POLISH-RULES/progress.md`. Code-rules want a pointer to an anchor in the docs.
- Fix: save THE PLAN as `docs/reviews/polish-rules-plan-2026-11-19.md` and index it. That is docs only.

**L6 — No git on the PATH is refused but unexplained.** `exam/gate.ts:104-114` swallows every error, so the message says "the tag … does not hold polish/FROZEN.sha256".
- Shown on a synthetic repo: `ok:false`, seal closed. This is the rules review's finding 12, handled by checking git from the launcher.
- Fix: say "git could not show the tag's list" for a missing git or a timeout, and add a test with the PATH emptied.

**L7 — Duplicates.**
- `itemsOf` is byte-identical in `exam/lines.ts:44` and `exam/placebo.ts:313` (a third variant at `tries/beside.ts:76`).
- `exam/fresh.ts:71` `dayOf` is `isoDay` (`waveh/instants.ts:18`), already imported by `look.ts`.
- `exam/price.ts:293` `baseOver` repeats `tries/prices.ts:68` `baseOf`. This is documented and test-held, so I leave it.
- `steps.ts:249` re-spells `json()` (`:86`).
- `countedFrom` runs twice in step 1 (`steps.ts:686` and via `dataFrom`).

**L8 — Names.**
- `linesOf` ×2 (`exam/look.ts:56`, `tries/beside.ts:46`).
- `partOf` ×2 (`exam/repro.ts:87`, `part.ts:101`).
- `dayOf` with three meanings (`fresh.ts:71`, `paper/stats`, `range.ts:93`).
- `exam/lines.ts` holds the prints beside the verdict.
- `steps.ts:824` `const key = keyOf`.
- `steps.ts:339` local `json` shadows the module's `json`.
- `tries/beside.ts:437` `examZ` is stale beside `BARS`.
- The step functions mix order (`placeboStep`, `stepOne`).
- The test constants `D17`–`D19` clash with the plan's D-numbers.

**L9 — Read by no program code.**
- `design.ts:137,142,154` `DISCOVERY`, `LOOK2_END`, `PLACEBO.windows` (read by `polish-rules.test.ts` only; the rules review knows about `LOOK2_END`).
- `placebo.ts:202` `LOOKS.oneLook`, kept so the code can regenerate `placebo.json`.
- `checkBeside`'s `draws` parameter is used by tests only.
- The test constant `D18` is unused.

**L10 — Eager sentences.** `exam/verdict.ts:155-165` builds six sentences with `?? 0` fallbacks. A `switch` builds the one chosen.

**L11 — Stale text.**
- `src/polish.ts:1-17` usage block lacks `exam --step`.
- `exam/steps.ts:1-16` header lacks step 2.
- The CLAUDE.md stack line lacks the exam.
- P15.4's `waveh-fetch.cjs --fresh --books <file>` omits the required `--store` and `--heartbeat` (the 2026-11-20 listing shows the full command).

**L12 — Procedure traps.**
- `polish-rules.test.ts:114-115` requires the markers `[OPTION A`, `[OPTION D, Q4]` and `[OPTION E]`. Filling the options in at the owner's talk must change that test in the same commit.
- The P17 `options` row is pinned to `OPTIONS`.

## The breaks, the grid, the rehearsal

**Breaks at HEAD** (scratch copy; the 12 exam test files; `--maxWorkers=2`; `breaks-all.json`; no retries; every run saw all 12 files).

| Group | Count | Killed | Survived |
|---|---|---|---|
| POLISH-RULES-REVIEW's 47, re-aimed at HEAD (v, n, d, h, g, s, z, p, m, c, x ids) | 47 | **47** | 0 |
| My wiring breaks w1–w19 | 19 | 15 | w1, w14, w17, w19 |
| Successor 5's survivors re-broken, sv1–sv11 | 11 | 10 | sv9 |
| **All** | **77** | **72** | **5** |

- The rules review's 7 survivors (v1, v2, p2, n2, m3, d3b, h3) are all killed now.
- w1, w14, w17 are L1.
- sv9 and w19 are equivalent: `decidedOf` gets `pr = null` for a left-out position, and the books-hash regex is redundant, since a bad hash fails `heldFile` anyway.
- **Seven of successor 5's survivor tests spot-checked** (I re-broke each one): sv1 the seal at DATA END, sv2 days counted as instants, sv3 the hour before when the file is listed missing, sv4 BASE's empty block, sv5 G0's line count, sv6 `Store.bytes`'s own seal check, sv7 `repro.json`'s `passed`, sv8, sv10, sv11. Each fails with the stated test, except sv9.
- After the round copyB's 395 files equal copyA's.

**P11 grid on HEAD** (`r6-head.mjs` on a fresh scratch build and on the repository's `dist`): `verdictOf` against my own P11, 30,000 random sets including the 10% and 20-day edges, **0 differences**.

**My other differentials on the compiled HEAD:**

| Function | Cases | Differences |
|---|---|---|
| `holesOf` against brute force | 4,000 | 0 |
| `leftOutOf` against a linear scan | 20,000 | 0 |
| `fundingBetween` against brute force | 3,000 | 0 |
| `baseOver` (two segments pooled, 24 h) against brute force | 300 | 0 |

**Tests.**
- The 12 exam files in a clean build: 109 of 109 pass (17 s).
- The whole suite in copyA: 89 files + 1 skipped, 814 tests + 5 skipped, exit 0, 473 s.

**Freeze rehearsal** (copyF; `git init`, build, `node tools/polish-freeze.cjs --final --tag 1`, commit, tag):
- The tool wrote 125 files; its hash lines equal the draft's 125 of 125, so the build is reproducible in another folder.
- The program's own gate answered "no polish/FROZEN.sha256" before the list, "the tag polish-freeze-1 does not hold polish/FROZEN.sha256" with the list uncommitted, and `ok:true` (125 files, tag `polish-freeze-1`, seal open) once committed and tagged.
- On that frozen tree, 108 of 109 exam tests pass; the failure is M3.

**Other checks that held.**
- `polish/fresh.sha256` equals `FRESH_RANGE` key for key: 4,614 keys, SHA `17de22e5…2273`, none dated at or after FRESH_END.
- `BARS` equal `placebo.json` to the double (2.8466835996608553 / 2.3599581301310213; 2.81 / 2.4374684250380376).
- `PLACEBO_JSON` equals its hash, `EXPLORED` equals its inputs (10 of 10), and M = 147, N's cut 336, seed, draws and cuts agree.
- P16's projection numbers equal `placebo.json`.
- The price is WAVE-H's `priceSpot` and `pricePosition` line for line. The real reproduction held (b) exact and (c) to 1e-9 on 1,299 positions; its second run passed every part.
- Iron Rules: the only process call is `git show`; no network module; no key, order or endpoint word; no project or owner name.
- No lint disable, TODO or `console` in the exam code.
- Step 2 writes `result.json` before anything about an outcome is logged (a test checks which files exist at each log event). H15's recovery and a refused second run are tested.
- Measured on the ten months' manifest: pass 3,106 s, merge 1,112 s, main thread peak 3.0 GB RSS, worker peak 2.9 GB. The 20 GB and 4 GB ceilings are wide; F: has 1.0 TB free.
- The one hour [2026-05-29 01:00, 02:00) is in neither WAVE-H's nor FRESH's data. It can matter only for blocking in the first two hours of 2026-05-30 (decided in P1).

## Questions, each with a recommendation

1. **Fix M1–M3 and L1–L3 in one commit before the freeze?** Yes; they are small. Then `pnpm verify`, the draft list again, and a fix-check. The reproduction by the frozen program runs at look 1 anyway.
2. **Clean up the duplicates, names and stale headers in the same commit?** Yes for L7, L10, L11, the `key` alias and the `json` shadow. Leave file renames (`lines.ts`) alone.
3. **Where does FRESH-2 live: `…\FRESH\store`, or does `run.js` join the allow-list?** Recommend the same store and the allow-list unchanged.
4. **Save THE PLAN into `docs/reviews/`?** Yes (L5).
5. **A rehearsal harness for steps 1–2 through `main.ts`?** Yes, if a builder can spare half a day before the freeze; otherwise before look 2.
6. **Reorder step 1 so the integrity check runs before the twin build?** No. Plan for the likely exit 6 instead.
7. **The owner's options (B or A, BASE or OWN) remain the owner's.** My recommendation is unchanged: B and BASE.

## The verdict, the findings, the breaks, in short

**Verdict: after these fixes.**

**Findings, one line each:**
- M1: `reproduceStep` is given no seal, so look 1's reproduction into `ANALYZER\FRESH` is refused (`steps.ts:255-263, 421-441`, `main.ts:252-263`).
- M2: step 1 prints no denominator for P15's 5% rule (`look.ts:207-214`).
- M3: `polish-exam-placebo.test.ts:794-811` pins the pre-freeze state; the first `pnpm verify` after the tag goes red.
- L1: step 2's 715-deciding path, the `placebo.json` hold and the missing-`step1.json` refusal are unpinned (w1, w14, w17).
- L2: `matchLook` is one-sided (`repro.ts:171`).
- L3: step 2 does not hold step 1's program or freeze; the `builds` and `integrity` hashes are never read back.
- L4: look-2 fit (`look.ts:121`, `design.ts:49`, `run.ts`, `LOOK1`, `BARS[0]`).
- L5: THE PLAN lives outside the repository.
- L6: no git on the PATH is refused with a misleading message and no test.
- L7: duplicates (`itemsOf` ×2, `dayOf` vs `isoDay`, `json` re-spelled, `countedFrom` twice).
- L8: names (`linesOf` ×2, `partOf` ×2, `dayOf`, `lines.ts`, `key`, `json`, `examZ`, `D17`).
- L9: read by no program code (`DISCOVERY`, `LOOK2_END`, `PLACEBO.windows`, `oneLook`, `D18`).
- L10: eager sentences with `?? 0`.
- L11: stale headers and an incomplete fetch command.
- L12: the option markers are test-pinned.

**Breaks re-run:** 47 of the rules review's 47 killed at HEAD; 77 in all, 72 killed, 5 survived (w1, w14, w17 are L1; sv9 and w19 are equivalent).

**Questions:** 1 to 7 above, each with its recommendation.

Scratch copies `copyA`, `copyB` and `copyF` in my scratch folder each hold 7 junctions into the repository's `node_modules`. Never delete them recursively; remove each junction with `rmdir` first.
