# POLISH-FIX-CHECK — the fresh check of the code review's fix round, before the freeze

POLISH-FIX-CHECK (successor 2; Sonnet 5.5, max; the fixer was Opus), 2026-11-20, for polymarket-follow's supervisor. Stamps are from `date -u`; I worked 10:40Z to 13:00Z. The first POLISH-FIX-CHECK read the fix round's diff from 10:32Z and stopped at about 10:40Z when the app restarted; its notes were my start. Save as `docs/reviews/polish-fix-check-2026-11-20.md`.

**Under review.**
- POLISH-FIX's eight commits `31bab2e`..`6a8e541` (12 source files, 6 test files, rules.md, architecture, CLAUDE.md) and the docs after them (`80cca21`, `34e5c01`, `04b6b13`).
- The owner's last two options, added at the supervisor's word of about 11:40Z: `bd92571` (rules.md and `polish-rules.test.ts`) and `0f42405` (the draft list, 125 files, `750b5c64…6a8a`).
- HEAD is `0f42405`. Since `c7e95a5` (POLISH-FIX's draft list), `apps/` and `tools/` changed only in those three files. No source of the collector, paper, MARKET-1, WAVE-H, `schedule` or `log` changed in the fix round; the three freeze lists equal their tags.

**The limits held.**
- Nothing of FRESH, the real `ANALYZER\FRESH`, `ANALYZER\POLISH-RULES\repro*`, the collector's data, the paper or MARKET-1 data was opened. No network, no deploy, no Task Scheduler, no agents; polymarket-lab untouched.
- I edited nothing in the repository (its tree is clean at `0f42405`). In the supervisor's folder I read `workers\POLISH-FIX\`, the code review's scratch folder and, for L5, `workers\POLISH-RULES\progress.md`, and wrote only `workers\POLISH-FIX-CHECK\progress.md`.
- I started no test, build or break before the supervisor's word. After it: scratch copies only (`git archive`, `node_modules` as junctions, no pnpm), one run at a time, below-normal priority, vitest at 2 workers. Machine memory stayed above 11 GB free. Nothing failed at random, so nothing was run twice.

## For the owner, in one page

*Words.*
- The **freeze** is a list of every file the exam runs with its fingerprint. FRESH opens only when the list matches the files and a git tag holds the same list.
- A **rehearsal** is a dry run of the whole program on a tiny made-up world. It proves the wiring, not the numbers.
- A **break** is a one-line change I make in a scratch copy to see whether a test notices. A **survivor** is a break nobody notices.

**Verdict: ready to freeze.**

**Where it stands.** Every fix from the code review closes the finding it was written for, and I found nothing new that stops the freeze. Your two answers (B, BASE) are in the rules, and the code already holds them.

**What I saw with my own runs** (scratch copies; nothing of FRESH opened):
- The fixed program ran start to finish on a made-up world under a made-up freeze: reproduce, step 1 and step 2 all pass. The same dry run on the code before the fixes stops at the first step with "FRESH is sealed", exactly what the review predicted for look 1. So the biggest finding is closed, and shown to be closed.
- I did the freeze for real, in a scratch copy, with the real tool. The list it wrote equals the draft (125 of 125 files). The gate says no before the commit and tag, and yes after. The whole test suite stays green on the frozen copy, which closes the review's third finding (the test that went red after the tag).
- The draft list equals a clean build of the final commit, 125 of 125. The three live programs' lists are untouched.
- I broke the code 112 ways on purpose: 106 were noticed. The 6 that were not are explained below; none could change a verdict.

**Next.**
1. Two optional text fixes may ride along first (Q1 below): a stale comment in `design.ts` and one rules sentence. Not conditions.
2. The freeze: `node tools/polish-freeze.cjs --final --tag 1` on a clean tree, the commit, the tag `polish-freeze-1`; you push.
3. Look 1: the reproduction, step 1, the books, step 2.

**When.** Look 1 is about half a day of runs after the tag is pushed. Plan more if step 1 stops at the pairing check, which the code review put at about 3 chances in 4; the path is a decisions entry, `fresh-unpaired.json`, a re-freeze (tag 2) and step 1 again. The reproduction stays valid across that re-freeze, because its fingerprint covers only `dist/polish*`.

## The findings, one by one

All "closed" below means: I read the fix, a test pins it, a break of it is killed, and a run shows it work.

- **M1, the reproduction refused by the program's own seal: closed.**
  - The fix (`31bab2e`): `seal` is required in `ReproInput`; `main.ts` passes it; (a) is pulled into `reproExtraction(o, explored, range)`, which gives `extract` and `openStore` the seal. WAVE-H's own books are still read under the closed seal.
  - The test, on a root named `…\ANALYZER\FRESH`: the closed seal throws `SealedError` with the exact message and makes nothing; the open seal makes the store again and it matches (equal, no problems).
  - Breaks m1a and m1b (the seal dropped from `extract`, from `openStore`) are killed by that test.
  - The rehearsal: reproduce exits 0 at HEAD; on `99dd76c` it exits 5 with "…\ANALYZER\FRESH\repro: FRESH is sealed…" while the log says the seal is open.
  - Not pinned by any unit test: `main.ts` and `reproduceStep` handing the seal on (my breaks c12 and c13 survive the tests). The rehearsal kills the same mutant (see below).
- **M2, no denominator for P15's 5% rule: closed.**
  - The fix (`742b4de`): `counts.onDeciding` by line, and `counts.tripwire` = `{of, leftOut, fundingWithoutPrice, share}` for the deciding line. `share` = (leftOut + fundingWithoutPrice) ÷ of, and null with no position. That is P15's sentence (left out or funding without a price, over the deciding line's positions on the deciding days). `positions` stays over all slices.
  - The look test asserts both for N (3, 1, 1, 2/3) and for the 715 line (1, 0, 0, 0). Breaks m2a, m2b and my c1 to c4 (denominator over all slices, left-out count inverted, funding count dropped) are killed. The rehearsal prints 3 / 1 / 1 / 0.667 and `onDeciding` {715: 1, N: 3, 1391: 0, B0: 3}.
  - Unpinned: `share` null with no position (c15; unreachable on real data).
- **M3, a test pinned the pre-freeze state: closed.**
  - The fix (`742b4de`): the sealed-root case runs only while the gate says not ok; `examSealOpen` is expected equal to the gate.
  - In the frozen scratch (gate ok, seal open) the 12 exam files pass: 116 passed + 1 skipped of 117 (the review saw 108 of 109 with one failure). The whole suite passes there too: 89 files + 1 skipped, 821 passed + 6 skipped, exit 0, 474 s.
  - So the first `pnpm verify` after the tag should read 821 passed + 6 skipped, not 822 + 5. That is the one case skipping, not a lost test.
- **L1, step 2's wiring (w1, w14, w17): closed.**
  - The fix (`21f270b`): `ExamDesign.safetyNet` (EXAM_DESIGN's is SAFETY_NET) and three tests: the 715 line deciding through step 1 and step 2; `placebo.json` missing or not the design's; `step1.json` missing.
  - The review's three survivors are now killed by exactly those tests. Also killed: l1s (the net ignored) and w14b.
- **L2, `matchLook` one-sided: closed.**
  - The fix (`0837596`): (c) counts the look's lines with `set === "WAVE-H"` and requires equality with our positions; SIZING's lines follow and count for nothing.
  - Breaks l2 (`<`) and c14 (`>`) are killed.
  - On real data: the look's 1,589 lines are 1,299 WAVE-H + 290 SIZING (decisions G3), and the reproduction priced 1,299 positions, so the equality holds. I did not open the file.
- **L3, step 2 holds step 1's program and freeze: closed.**
  - The fix (`21f270b`): step 2 refuses a `step1.json` of another code or another freeze (exit 5), and holds `builds.json` and `integrity.json` to the SHA-256s step 1 wrote. The reason is stated, not dropped.
  - Breaks l3a to l3d are killed (3 or 4 tests each). The rehearsal's step 2 passes the holds on a genuine step 1.
  - Plan for it: after a re-freeze, a completed step 1 must run again. The likely exit-6 path is unaffected, because step 1 writes `step1.json` last.
- **L4, one date for the no-book listing: closed as ruled.**
  - The fix (`edf9ce5`): `NO_BOOK_LISTING = "2026-11-13"` in `design.ts`, printed by F7's text; P2 and P16 name the 2026-11-20 refresh.
  - Breaks c6 (the text hard-wired to another date) and c7 (the constant changed) are killed by the look test's F7 print.
  - `LOOK1`, `BARS[0]` and look 2's store stay for freeze 2, as ruled.
- **L5, THE PLAN saved: closed.**
  - I hashed it myself. The saved body (lines 4 to 731 of `docs/reviews/polish-rules-plan-2026-11-19.md`) has SHA-256 `75823228…9100`, identical to lines 35 to 765 of `workers\POLISH-RULES\progress.md` (the "## THE PLAN" section up to the line before "## STATE AT 2026-11-19T21:58Z").
  - It is indexed in `docs/reviews/README.md`. Pointers sit in `design.ts`, rules.md's head, architecture and current-task. No stale pointer to the old place remains in apps, tools or the docs I searched. T10 to T12 are in decisions, as rules.md's head says.
- **L6, no git on the PATH: closed.**
  - The fix (`0837596`): git's own refusal (a numeric exit status) says "the tag … does not hold …"; a git that never ran or timed out (no status) says "git could not show the tag's list (…)".
  - Shown with real git on this machine: no tag, and a tag without the file, give "does not hold"; an emptied PATH gives "git could not show the tag's list (spawnSync git ENOENT)"; a timeout also has no status. The seal stays closed. Breaks l6 and c11 are killed.
- **L7, duplicates: closed.**
  - `itemsOf` is exported once (placebo.ts imports it; no import cycle). `fresh.ts` uses `isoDay`, which has the same body as the old `dayOf`. One `json()`; `countedFrom` runs once in step 1.
  - `whereOf` old against new: 80,000 calls, 0 differences. `safetyNet` old against new: 20,000 inputs, 0 differences.
- **L10, one verdict sentence built: closed.**
  - A `switch` with `bounds!` where the old code said `?? 0`. That is safe, because past TOO FEW TO TELL every verdict has its bounds.
  - 30,000 sets × both z bars × BASE and OWN = 120,000 calls through the build of `99dd76c` and HEAD, the whole result as JSON: 0 differences, all six verdicts seen.
- **L11, stale text: closed.** `polish.ts`'s usage lists `exam --step`; `steps.ts`'s header names step 2; CLAUDE.md's stack line names the exam; P15's and P2's fetch commands carry `--store` and `--heartbeat`, as `tools/waveh-fetch.cjs`'s usage text says (read, never run).
- **L8, L9: left as ruled** (the `key` alias and the `json` shadow are gone; no file renamed). **L12: closed by `bd92571`** (below).
- **Nothing new is wrong.** I read every changed line of the 12 source files, the 6 test files, rules.md, the architecture and CLAUDE.md diffs, and found no defect. The small points are in "New and small".

## What I re-ran (killed / survived)

**Builds and tests** (clean copies of HEAD):
- A clean `tsc` build (140 files, 3 s): the draft list equals it, **125 of 125**. The three freezes (74, 64, 61 lines) equal it, 0 differences. The lock hash and toolchain (node 24.13.0, typescript 6.0.3, zod 4.6.7, pino 10.4.0, lz4js 0.2.0) equal the draft's head. The draft file's SHA-256 is `750b5c64…6a8a`, as the supervisor said.
- `EXAM_CLOSURE` is 31 files; each equals its own freeze, because the freeze tool checks them before it writes, and it wrote.
- `tsc -p tsconfig.json` (src, scripts, tests): exit 0.
- The 12 exam test files, unfrozen: 12 of 12 passed, 117 tests, 29 s.
- The freeze rehearsal (a scratch git repo, the real `tools/polish-freeze.cjs --final --tag 1`):
  - before the list, the gate says "no polish/FROZEN.sha256";
  - with the list written and not committed, it says "the tag polish-freeze-1 does not hold polish/FROZEN.sha256";
  - committed and tagged, it says ok: 125 files, tag `polish-freeze-1`, seal open;
  - the final list's 125 hash lines equal the draft's, and the tag holds the same list.
- The frozen copy: the 12 exam files 116 + 1 skipped of 117; the whole suite 821 + 6 skipped.

**Differentials:**
- P11 grid: `verdictOf` against the code review's own P11, 30,000 sets, 0 differences.
- The old/new `verdictOf` (L10): 120,000 calls, 0 differences.
- `safetyNet` and `whereOf`: 0 differences (L7).
- The five test files POLISH-FIX changed, in their 99dd76c versions, run on HEAD's source: 5 failed of 64, each a deliberate change (days ×2: `safetyNet` takes the net; look ×1: `step1.json`'s inputs name `safetyNet`; placebo ×1: `EXAM_DESIGN` has `safetyNet`; repro ×1: `matchLook`'s message). The old gate test passes. The other 59 pass, so no other print changed.

**Breaks** (the code review's runner; each break rebuilds, then runs the 12 exam files, 2 workers, 31 s each; every run saw 12 of 12 files, one try, nothing inconclusive):

| Group | Count | Killed | Survived |
|---|---|---|---|
| The code review's 77 at HEAD (72 unchanged; n1, n3, d1, sv2, w2 re-aimed to `isoDay` and `safetyNet(onDays, net)`) | 77 | 75 | sv9, w19 |
| POLISH-FIX's 15 | 15 | **15** | 0 |
| Mine at the new code | 15 | 11 | c10, c12, c13, c15 |
| Mine at the options commit (r1 to r5) | 5 | 5 | 0 |
| All | 112 | 106 | 6 |

- w1, w14, w17 (L1) are killed now. All five re-aimed breaks are killed.
- **sv9 and w19** are equivalent, as the review said. sv9: step 2 hands `pr = null` for a left-out position, and `verdictOf` ignores a left-out position's net. w19: the books-needed hash regex is redundant, because a bad hash fails `heldFile` anyway.
- **c10** (DOES NOT HOLD's sentence prints m − z·SE instead of m + z·SE): the only test of that sentence uses a constant world where SE is 0, so both bounds read 20.0. This gap predates the fix round. The L10 rewrite is shown unchanged by the 120,000-call comparison.
- **c12, c13** (`main.ts` or `reproduceStep` hands the reproduction the closed seal): no unit test calls them. The rehearsal catches the mutant (below).
- **c15** (`share` 0 instead of null with no position): unpinned.
- None of the six can change a verdict. c12 and c13 would stop look 1 loudly at the reproduction (exit 5).
- The options commit's test: r1 to r3 (a marker back to the unfilled form, or without ", decisions") are each killed by "every option filled"; r4 and r5 (`OPTIONS` flipped to OWN, or to kept) by the look tests and P17's row.

## The rehearsal: what it proves and what it does not

I re-ran POLISH-FIX's scripts (copied) on HEAD and on `99dd76c`. The setup is a scratch `git archive` with junctions, a synthetic world (WAVE-H's "ten months" as nine days, eight waves, FRESH as the look test's world), the design and ranges patched to it, a build, a synthetic freeze list and tag. Then `node dist\polish.js exam --step reproduce | 1 | 2` with `EXAM_ROOT` named `…\ANALYZER\FRESH`.

| Run | reproduce | step 1 | step 2 |
|---|---|---|---|
| HEAD | exit 0 | exit 5 (books needed) | exit 0 |
| `99dd76c` (the control) | exit 5, "…\ANALYZER\FRESH\repro: FRESH is sealed…" | exit 5, no `repro.json` | exit 5 |
| HEAD with c12 (`main.ts` hands the closed seal) | exit 5, the same message | exit 5 | exit 5 |

At HEAD:
- `repro.json` passed ((a) equal, (b) 0 differences, (c) equal on 0 lines).
- Step 1: the two builds equal (1,123 files), integrity pass, N deciding by the net, the tripwire as above, 4 books.
- Step 2: WITHHELD, as the look test. The log says `examSealOpen` true at every start.

**It proves:**
- `main.ts`'s hand-over works (the gate and tag, the seal into every step, the exit codes), and M1's defect is real and fixed.
- Step 2's new holds pass on a real step 1.
- The rehearsal catches the wiring mutants that no unit test sees.

**It does not prove:**
- The frozen bytes: the design numbers and ranges are patched, and the list is synthetic. The real `--final` path is my freeze rehearsal.
- (c) on data: the world has no WAVE-H position, so the equality ran on 0 lines (the unit test holds it).
- Real scale, time or memory; the pairing check (exit 6); the books fetch; the real verdict.

## The options commits

- **`bd92571`** touches rules.md (63 lines) and `polish-rules.test.ts` (20 lines); no code value changed.
  - Rules text against the owner's entry (`04b6b13`): [OPTION E] is B, cut, in P11 and P16 (a deciding position with x_in or x_out on a day of `NO_BOOK_DAYS` is cut and printed apart); [OPTION D, Q4] is BASE in P7 and P16; [OPTION A] is in the same form in P4 and P16 (`710338f`). All seven markers read "filled by the owner, decisions …", the chosen branch and the one not chosen one line each, every number as it was.
  - The code holds the same: `OPTIONS = { noBookDays: "cut", excess: "BASE" }`, and P17's row reads "cut BASE". The commit references in the text exist and match.
  - The test requires A, D (Q4) and E filled and every lettered marker in that form, so a later unfilled marker fails it.
- **`0f42405`**: the draft list, 125 files. Against `b47e9ac3…` only `polish/rules.md`'s line and the head's time and commit differ. It equals a clean build of HEAD (125 of 125), and the real tool's final list equals it.
- Wording only, no conflict: the owner's entry says B costs "about 10% of the line's positions" and moves look 1's P(HOLDS) from 4.3% to 3.9%. Rules.md P11 says "about 9 of the 100 entry days", and P16's look table shows 4.3% (before the cut) without saying so. Leave it.

## Rules and code agree

- **P2:** `NO_BOOK_LISTING` and the days (2026-07-08, 2026-07-12 to 17) agree with `design.ts`; the listing command carries `--store` and `--heartbeat`, as the tool's usage says.
- **P14:** the prints are `onDeciding`, `left`, `fundingWithoutPrice` and `tripwire` with `of`, `leftOut`, `fundingWithoutPrice`, `share`, as the code writes them.
- **P15:** "again at look 1 by the frozen program, into `ANALYZER\FRESH`" is now true (M1); the 5% sentence equals the tripwire's formula; the fetch command is right. One omission: step 5 does not say that step 2 now also refuses another program's or freeze's `step1.json` and holds `builds.json` and `integrity.json` (architecture and decisions do).
- **P16:** the placeholder row reads "not needed: the listing of 2026-11-20 found 11-13 → 15 with books"; the options are marked filled.

## New and small (none blocks the freeze)

1. **A stale comment in a frozen file.** `src/polish/exam/design.ts` lines 181 to 185 still say "The owner's options still open (rules.md P16), set at the talk before the freeze … (B, the recommended default …)". Comment only, but it is in the compiled `design.js`, so it is in the list.
2. **P15 step 5's omission** (above).
3. **Test gaps** (c10, c15, c12/c13). Tests are not in the freeze list, so a test-only commit changes no hash.
4. **Docs sweep leftovers** (none frozen):
   - architecture lines 759 to 761 ("final but the owner's two marked options … which the talk before the freeze fills in") and 797 ("OPTIONS (the owner's two, at their defaults)");
   - current-task lines 64 to 65 and 122 (the draft list is now `750b5c64…6a8a`, `0f42405`; they still name `b47e9ac3…b8c9`, `c7e95a5`) and lines 76 to 80 (the owner's talk is done).
5. **For look 2's builder** (POLISH-FIX noted it): step 2's check of `step1.json` against the running program must not be applied to look 1's `step1.json` when look 2 reads it (rules P1, 5.).

## Questions, each with a recommendation

1. **Bundle items 1 and 2 (the `design.ts` comment and P15 step 5's sentence) before the freeze?** Yes: one small commit, `pnpm verify`, the draft list again. The check is then small: the compiled `design.js` of that commit differs from `0f42405`'s only in that comment, and rules.md differs only by the sentence. My scratch scripts (`checkdraft-copy.cjs`, `freeze-rehearsal.ps1`) redo the 125-of-125 and the freeze rehearsal in a minute. If you would rather not touch frozen files again, freeze as is: nothing correct depends on them.
2. **Add two test-only assertions now?** Yes if cheap: DOES NOT HOLD's sentence in a world with SE above 0 (c10, the more valuable), and `tripwire.share` null with no position (c15). No hash changes. Otherwise leave them for look 2's build.
3. **Keep the rehearsal scripts outside the repository** (as ruled)? Yes. They are the only guard of `main.ts`'s seal hand-over. Re-run them at look 2's build, and then consider a built-program test.
4. **Write "821 passed, 6 skipped" into the freeze day's decisions entry?** Yes, so the first `pnpm verify` after the tag is not mistaken for a lost test.
5. **Add to the look-1 runbook:** after any re-freeze, a completed step 1 runs again (step 2 refuses another freeze's `step1.json`). The likely exit-6 path is unaffected.
6. **Fix the docs sweep leftovers (item 4) in the freeze day's docs commit?** Yes.

## What I could not check

- FRESH's data (sealed), so no real counts, prices or timings; the machine's memory under the look's load.
- The real WAVE-H look file's line counts (I rely on decisions G3 and the second reproduction).
- eslint and prettier on the two options commits (I ran `tsc` on src and tests; the supervisor's `pnpm verify` was green twice).
- `tools/waveh-fetch.cjs` beyond its usage text.
- The whole suite in the unfrozen state (the supervisor's verify covers it; I ran it frozen).

## Scratch

Everything is in `C:\Users\grozd\AppData\Local\Temp\claude\2256ffbe4c0a36f2\9ae2cc3d-0e52-45ea-b789-e2b44c23fa51\scratchpad\POLISH-FIX-CHECK\`:
- copies `fcA`, `fcB`, `fcF`, `fcOld`, `fcX`, `rh\repo`, `rh0\repo`, `rh2\repo`;
- the break lists (`review77.json`, `fix15.json`, `mine.json`, `rules-breaks.json`) and their `out-*.json`;
- the scripts (`breaks-run.cjs`, `p11grid.mjs`, `olddiff.mjs`, `mkcopy.ps1`, `freeze-rehearsal.ps1`, `rehearsal\`).

Each copy holds 7 junctions into the repository's `node_modules`. Never delete a copy recursively; remove each junction first (`rehearsal\unlink.mjs <copy>`). My running notes are in `workers\POLISH-FIX-CHECK\progress.md`.
