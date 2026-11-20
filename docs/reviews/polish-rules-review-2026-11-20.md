# POLISH-RULES-REVIEW — the fresh rules review of the exam, before its freeze

POLISH-RULES-REVIEW (Sonnet 5.5, max, a different model from the builder's Opus), 2026-11-20 02:53Z – 04:25Z (UTC; every stamp from `date -u`), for polymarket-follow's supervisor. Under review: `apps/poller/polish/rules.md` (P0–P17); the code that runs it (`apps/poller/src/polish/exam/` and the modules it changes; the commands `exam --step placebo | reproduce | 1 | 2` of `dist/polish.js`); the tests `test/polish-exam-*.ts`, `polish-rules.test.ts`, `polish-freeze.test.ts`; `tools/polish-freeze.cjs`; the draft list `polish/FROZEN.draft.sha256` (125 files, `da50d93b…2f93`) and `polish/fresh.sha256` (4,614 files); at HEAD `09eaf57` (code and rules) and the decisions entry `5f01f05` (two looks). Models: `docs/reviews/wave-h-rules-review-2026-11-16.md` and `market-rules-review-2026-11-13.md`. **A review decides nothing:** the supervisor and the owner answer. The builder (POLISH-RULES, successor 5) kept working during the review; its uncommitted tree at 04:20Z (rules.md, design.ts, verdict.ts, fresh.ts, look.ts, price.ts, steps.ts and tests) was read, not reviewed, and where it already answers a finding I say so. I edited nothing in the repository: the harness does not let a subagent write a report file, so this text is my final message and the coordinator saves it as `docs/reviews/polish-rules-review-2026-11-20.md`.

**FRESH stayed closed.** I opened repository files and docs; the supervisor folder's `workers\POLISH-RULES\` (read only: `progress.md`, `brief.md`, `withheld\withheld.mjs`) and POLISH-EXPLORE-REVIEW's scripts (read only, as a model); and on F: only what the brief and the supervisor's two rulings of 04:09Z and 04:15Z allow: FRESH's `manifest.jsonl` and WAVE-H's raw `manifest.jsonl` (names, bytes, SHA-256), `ANALYZER\POLISH-RULES\placebo.json` and `withheld\withheld.json`, `ANALYZER\WAVE-H\explore\e-positions.jsonl.gz` (E's lines only, 183 MB) and the trusted store's manifest and minute `last` columns of E's months (June–December 2025; no month of C). Never FRESH's data, `ANALYZER\FRESH`, `repro*`, or the 715 line on C. All real-data reads ran at below-normal priority, one at a time, between 04:11Z and 04:20Z (before 05:50Z, none in a window). No network, no fetch, no `dist/polish.js` against real paths, no `--final`, no deploy, no Task Scheduler, no agent started; polymarket-lab not touched. Every build, test and deliberate break ran in scratch copies of `git archive 09eaf57` (a real `node_modules` folder of per-package junctions; vitest and tsc run directly, never pnpm), one run at a time.

## For the owner, in one page

*Words.* A **look** is one run of the finished program on FRESH's months (2026-05-29 → 11-15, never opened). **Look 1** runs on the 100 clean days as soon as the rules are frozen; **look 2** about 2027-02-08 on those days plus the months after. The **freeze** locks the rules and the program by a fingerprint and a git tag; only a freeze that verifies opens FRESH. The **715 line** is the wave entered only when at least 715 accounts were liquidated in the hour; the **safety net** hands the exam to the 336 line (N) if the 715 line spans fewer than 20 days or 10 coins. **WITHHELD** is the verdict word for "more than a tenth of the positions could not be priced"; **LIKELY** is a named 95% reading that decides nothing HOLDS decides.

**Verdict: the rules may be frozen after the fixes below.** The rules are what you decided: every ruling since 2026-11-17 is in them as decided, and nothing is added but the builder's own small calls, which I judged one by one (all sound). The program does what the rules say. I rebuilt with code of my own the verdict (30,000 made-up cases, every boundary), the three bars, the projection table, the freeze list (a clean build of the commit equals it, 125 of 125), FRESH's file list against its manifest (4,614 of 4,614, names and hashes), and on the ten months' data the 715 line's placebo (with the exploration's draw order to the digit; with my own random draws within 0.013), W4's three cuts (336 / 715 / 1,391) and the funding-gap share (2.41%). No difference that matters. Then I broke the rules' code on purpose 47 times in a scratch copy: 40 breaks were caught, 7 were not, all of them wiring or edges that no test of the repository pins (finding 3).

**What must change first** (each small; none changes the design, the statistic or the bars):
1. **Look 2's freeze must be written into the rules now** (finding 1). You ruled two looks (decisions `5f01f05`), and `rules.md` cannot be edited at look 2's freeze, so every term of that freeze (which files may change, what they may change, who checks, how look 2 reads look 1) has to be in P1/P12 before this one. The contents are listed below. The builder's tree already removes the one-later-look branch and names six files.
2. **Option B's list of days without books must be refreshed** from the archive's listing before the freeze (finding 2). It now rests on a listing that stopped at 2026-11-12; 2026-11-13 → 15 are unknown. It costs 3 × 24 list requests and no data.
3. **Step 2's last hand-off into the verdict has no test** (finding 3). The code is right (I read it and rebuilt the verdict). The builder's tree already extracts it so it can be tested.
4. Seven small texts and two small prints (findings 4–13).

**What you decide at the talk.** The looks are ruled (two). Still yours: **WITHHELD's days without books**, cut (B) or kept (A): my recommendation **B**, after the refresh. On E's own rates it cuts the chance of a WITHHELD from about 12% to about 2% and costs about 0.4 points of P(HOLDS) (4.3% → 3.9%); the safety net then fires in about 7% of windows. And **Q4**, whether HOLDS's second condition is the excess over BASE (the coin's typical day) or OWN (the move net of the other small coins): my recommendation **BASE, no change**; as a sign-only condition OWN costs little, but it answers a different question ("beat its own typical day" against "beat the other small coins").

**What to expect.** On the conservative projection look 1 reads HOLDS about 4% of the time, LIKELY about 7%, and otherwise NOT SETTLED; look 2 raises HOLDS to about 10%. A NOT SETTLED at look 1 is the expected case, not a fault, and the rules let look 2 run after it. While look 1 runs (about half a day with the pauses) no build, test or other heavy job may run on this PC.

**The one thing to watch at look 1:** step 1's counts of positions without a price (holes, thin files). The model says the 59 thin files add 0.01 point and my own count says at most 0.04, but only step 1 shows the real files.

## Verdict

**MAY FREEZE AFTER THESE FIXES.** Three medium findings (1–3) and ten low (4–13); no high. Findings 1, 2, 5, 6, 7, 8 change frozen text or code (the draft list is then written again); 3, 10 and the re-run of my breaks are tests, outside the list; 4 and 11 are text; 12 and 13 are procedure and docs. None changes the design, the statistic, the bars or the data.

## Findings by severity

| # | Sev. | Where | Finding | Fix |
|---|---|---|---|---|
| 1 | medium | P0, P1, P12, T2; `design.ts` `LOOK2_END` (defined, used nowhere in `src`), `seal.ts`, `range.ts`, `exam/fresh.ts`, `steps.ts`, `main.ts` | **Look 2's freeze is not yet in the rules.** P1/P12 said look 2's program is "a later build, every file of look 1's list byte-identical and this file unchanged": it cannot be (FRESH_END is in `seal.ts`; the range, the days, the data list, the look's folder and the reading of look 1 are in five more compiled files). And `rules.md` stays unchanged at freeze 2, so everything look 2 needs must be written in it now. (The one-later-look branch was not one line either: `OPTIONS.looks` swapped only the bars, the days, range and look gate stayed look 1's, so that freeze would have run look 1's 100 days at the 182-day bars and ended the exam at once; ruled out in `5f01f05`.) | The contents of "What the P1/P12 rewording must contain" below, and the removal of the branch everywhere (code, P10, P12, P16, P17, tests). The builder's tree at 04:20Z removes the branch and names the six files and the list; it lacks items 2–9 of that section. |
| 2 | medium | P2 F7's list, P11 [OPTION E], P16, `design.ts` `NO_BOOK_DAYS` | **Option B's days without books rest on the archive's listing of 2026-11-13, which reached 2026-11-12.** 2026-11-13 → 15 are unknown. If they lack books and are not cut (the ruling: "a day the fetch later finds without books is not cut"), the chance of a WITHHELD lies between P16's rows (A with them: mean 6.40%, P(>10%) 19.6%; B with them cut: 2.34%, 4.5%); that case is not printed. | A metadata-only listing at the freeze (`waveh-fetch.cjs --fresh --books <one always-listed coin's 24 keys of a day> --plan`: "not in their hour folder's listing 24" = no books; 3 × 24 requests, no data). Update `NO_BOOK_DAYS`, P2, P16, P17; print the "B as ruled, 11-13 → 15 without books, not cut" row (the builder's script `withheld.mjs` can). The builder's tree rewrites P2 for it. Look 2 repeats it at its freeze (item 6 below). |
| 3 | medium (tests are outside the freeze: not blocking) | `steps.ts` `decided`, `baseAt`; `stepOne`'s net | **Step 2's hand-off into the verdict is not pinned.** Of my 47 breaks, `v1` (`bookBoth: true`), `v2` (the net in place of the excess over BASE), `p2` (BASE pooled over segment 1 only), `n2` (step 1's net counting left-out positions) and `m3` (FRESH store's identity unchecked) survive all 11 exam test files. The one end-to-end step-2 test ends WITHHELD and asserts neither `excess` nor `atTheBook`; the world lies in segment 1, so pooling both segments cannot show. | Assert `excess` and `atTheBook` in that test; test the BASE pooling and the net's filter directly; a test that the store's identity is held. The builder's tree has `decidedOf`, `examBase` and `safetyNet`'s left-out filter; re-run my 47 breaks on its commit (the harness is in my scratch folder). |
| 4 | low | P16 | The WITHHELD table omits `withheld.json`'s thin-day row ("A, the thin days also without marks"): **5.15% mean, P(>10%) 11.6%, against A's 5.14% / 11.6%**; the 59 thin days (17 of 100 entry days touch one) add 0.01 point. My count agrees: only 129 of the 715 line's 5,067 E positions (2.5%) have a settlement hour without a taker trade in the 5 minutes before even with no mark at all, 116 of them on 2025-07-18; 14 of 9,898 N positions (0.14%) apart from that day. | Show the row (the builder's tree does). |
| 5 | low | P4, P13; `steps.ts` `report` | P4 says the 1,391 cut and N are "labelled 'seeded, decides nothing'"; `report.json` carries no such label (only `placebo.ts` says "seeded"). | Name the keys or the `print` text. |
| 6 | low | P15 | Silent on two things the code needs or the supervisor does: `placebo.json` (`c25345f7…`) must be copied into EXAM_ROOT before the reproduction and step 2 (else exit 5); and what the supervisor reads at step 1 and when it stops. | Two sentences. For the second, a tripwire without a new rule: the deciding line's left-out plus funding-without-price share above 5% is a data defect to rule on by H0's route before the books are fetched (the share cannot fall later). |
| 7 | low | `tools/polish-freeze.cjs --final` | Writes `# tag polish-freeze-1` only; P0 promises `polish-freeze-<n + 1>` for a re-freeze (and look 2 needs 2). | A `--tag <n>` argument (the tool is outside the freeze). |
| 8 | low | P14, `look.ts` `countsOf` | WAVE-H's H15 step 1 printed the counted fills and own legs by month and method; the exam's step 1 does not. It is the one print that shows a drift of the `liquidation` object before the positions do. | Print `countedFrom().legs` (already computed for G1). |
| 9 | low | `steps.ts` step 1 | `books-needed.txt` is named in `step1.json` by count only; step 2 trusts the file for its up-front check (a missing key still fails at read time, so fail-safe). | Its SHA-256 in `step1.json`. |
| 10 | low | tests | Two boundaries survive: `onDeciding` at slice K itself (`d3b`) and a hole of exactly 60 s (`h3`); both are on the builder's own break list. | Tests. |
| 11 | low | P2 | "under half the median bytes of WAVE-H's 370 days (11,181,121.5 B)": 11,181,121.5 B is the median; half is 5,590,560.75 B. The 59-day list does not depend on the line: no FRESH day lies between 5,467,409 B (the largest thin) and 7,250,154 B (the smallest not thin). | One parenthesis. |
| 12 | low | `exam/gate.ts` `taggedList` | The tag check runs `git` (30 s, error swallowed): a detached launcher without git on its PATH fails with "the tag does not hold the list" (exit 4), fail-safe but misleading. | Run the gate once from the launcher's environment before look 1. |
| 13 | low | docs, P2 | Architecture still says "not run" for the analyzer and exploration and has no exam section (the builder's commit 11). P2 should say why F9's tape-completeness gates (G1, G6) are the ten months' only: for FRESH the double build, G0, G5 and step 1's counts stand in. | The builder's docs commit; one sentence in P2. |

## What I recomputed against the rules' numbers

| What | The rules / the source | Mine | Difference |
|---|---|---|---|
| The 715 line's E-only placebo, day flips, 100 days (97.5th / 98.75th / 99.5th / 99.75th; median window error) | P10: 2.133 / 2.360 / 2.613 / 2.847; 109.6 | with the exploration's draw order and seed 20,261,118: 2.133 / 2.360 / 2.613 / 2.847; 109.6. My own stream (200,000 draws, uniform whole-day starts): 2.120 / 2.359 / 2.625 / 2.839 | 0; largest **0.013** (97.5th), the deciding 99.75th 0.008 (sampling noise) |
| The same, 182 days (30 starts) | 2.213 / 2.437 / 2.653 / 2.788; 81.0 | to the digit: same; own stream 2.206 / 2.431 / 2.657 / 2.785 | 0; largest 0.007 |
| The 715 line on E, slices 0–19 | P16: 5,067 positions, 4,310 priced, m 203.4, SE 79.1, 51 days, 33 coins; placebo.json 203.3589718434901 / 79.08321017007256 | 5,067, 4,310 (no trade at the exit 602, at the entry 39, funding without a price 116), 203.35897184349 / 79.08321017007262, 51, 33 | 6e−14 on SE |
| W4's type-7 quantiles 0.5 / 0.75 / 0.9 over B0's 148,154 E entries | 336 / 715 / 1,391 | 336 / 715 / 1,391 (shares kept 0.5002 / 0.2504 / 0.1003) | 0 |
| One WITHHELD part: the ten months' funding gaps, the 715 line's 112 windows of 100 days | P16: 2.41% | mean 2.41% (median 0.00%, max 7.76%; the 116 positions are all of 2025-07-18) | 0 |
| Settlements without a taker trade in the 5 minutes before (the thin-day worst case), from the store's minute `last` | withheld.json: 129 (715 line), 201 (N) | 129 of 5,067 positions (121,608 settlements, 0.11%); 201 of 10,108 | 0 |
| P16's projection table from its inputs (m_proj 124.28 / 89.13; SE 109.6 / 77.0 and 81.0 / 63.9; the bars) | 4.3 / 11.0 / 4.6 / 11.5; 10.1 / 18.3 / 7.9 / 14.9 (and the removed one-look row 13.2 / 24.9 / 10.4 / 20.7) | the same to the printed decimal | 0 |
| The three bars from the percentile table by T10 (the larger of the floor and both lines' both flips) | 2.847 / 2.360; 2.81 / 2.437; (2.653 / 2.213, removed) | the same; placebo.json's doubles equal `BARS` to the digit | 0 |
| placebo.json, withheld.json | SHA-256 `c25345f7…9575`, `8e8249d7…3048` | equal; every row of P10, P16 and the "shares" line equal | 0 |
| `verdictOf` against my own P11 (order, boundaries, m, SE, share) | — | 30,000 made-up sets (10% exactly, 20 days, 10 coins included): **0 differences**; the six sentences print as P11 words them; `examVerdict` as M11 | 0 |
| `polish/fresh.sha256` against FRESH's `manifest.jsonl` | 4,614 lines, SHA-256 `17de22e5…2273` | 0 hashes differing, 0 missing, 0 extra; FRESH's range built from P1's text (4,102 fills + 170 `asset_ctxs` days but 07-08 + 38 coins × 9 funding windows = 342) equals the manifest's keys | 0 |
| F7's 59 thin days | median 11,181,121.5 B of WAVE-H's 370 days | the same median, 59 days, equal to `THIN_CTXS_DAYS` | 0 |
| `waveh/data.sha256` against WAVE-H's raw manifest | 9,975 lines | 0 differing | 0 |
| The draft list against a clean build of `09eaf57` | 125 files | 125 of 125 equal; every closure file equal to its own freeze (WAVE-H 72 lines, MARKET-1 45, paper 38); no scope file missing | 0 |
| The repository's tests in my scratch copy | 88 + 1 files, 795 + 5 tests | the same, green (11 minutes); the 11 exam files 90 tests | 0 |

**The largest difference between my numbers and the rules' is 0.013**, a percentile of an independent random stream; every deterministic check is exact.

## The options: what each branch freezes

| Option | Branch | One line in `design.ts` (and P17's `options` row) | What it freezes | Flip tested in a scratch copy |
|---|---|---|---|---|
| Looks (C) | **ruled: two** (`5f01f05`) | the branch is removed (`OPTIONS.looks`, `BARS.oneLook`) | look 1 on the 100 deciding days at z 2.847 / z_L 2.360 now; look 2 (z 2.81 / 2.437) a later build under its own freeze, as finding 1 | — (the one-later-look flip failed 2 default-pinning tests; the run of look 1's days at the 182-day bars is why it was removed) |
| WITHHELD's days (E) | **B, cut (recommended default)** | `noBookDays: "cut"` | the days of `NO_BOOK_DAYS` (7 now, to be refreshed: finding 2): a deciding position with x_in or x_out on one is cut and printed apart, in step 1 (the net's count) and step 2; a day the fetch finds without books later is not cut; about 9 of 100 entry days | default |
| | A, kept | `noBookDays: "kept"` | no day cut; those legs go to the tape; on E's rates P(WITHHELD) 11.6% against 1.8%; the net never fires | passes but 7 default-pinning assertions (step 1 lists 6 book files for 4 on the test world, …) |
| HOLDS's second condition (D, Q4) | **BASE (default)** | `excess: "BASE"` | the mean excess over BASE above 0 | default |
| | OWN | `excess: "OWN"` | the mean of OWN above 0 (at least 5 other small coins); the HOLDS and LIKELY sentences name OWN | passes but 2 pins (`OPTIONS` in the verdict test, `options` in the step-2 test); `ownOf` is unit-tested, its step-2 path is not |

Each branch is one line plus P17's row; the tests that pin the default change with it (outside the freeze).

## The brief's checks, one by one

**1. Every decision since 2026-11-17 is in the rules as decided, and nothing is added.** Yes.

| Decision | Where in the rules | OK? |
|---|---|---|
| F1 placebo gate, z never below the floor, both flips, 100,000 draws | P10, P15.1, P17 | Yes |
| F3 20 GB heap, idle priority | P15 | Yes |
| F7 07-08 and the thin days listed, the WITHHELD budget | P2, P16 (07-08: 0.07%) | Yes |
| F8 book-priced mean above 0; each segment apart | P11.4, P13 | Yes |
| F12 beta months stay; segments apart | P1, P13 | Yes |
| F13 projection from C minus one error | P16 | Yes |
| F14 read as MARKET-1's M11 (Q2): only HOLDS or DOES NOT HOLD end it | P12 | Yes |
| F17 event-level mean, OWN; F18 one sweep | P13; code | Yes |
| F19 K = 20 (owner, 2026-11-19) | P5 | Yes |
| HOLDS at 99% and LIKELY at 95%, DOES NOT HOLD keeps HOLDS's z (Q3), LIKELY counts as NOT SETTLED for F14 (Q4) | P10, P11, P12 | Yes |
| The plan's Q1 (tagged freeze), Q5–Q8 | P0, P11 [E], P2, P2, P7 | Yes |
| The two stricter cuts beside, "seeded, decides nothing" | P4, P13 | Yes; the label is not in `report.json` (finding 5) |
| The 715 cut decides, with the safety net; read once (T12) | P4, P12 | Yes |
| The placebo's z, B recommended, M11, T12 (`e217fa9`) | P10, P11, P12, P16 | Yes |
| The reproduction's first run: FRESH built twice, equal byte for byte (exit 7); no heavy run beside the look | P2, P15 | Yes |
| Two looks (`5f01f05`) | P12; the builder's tree | In progress (finding 1) |

**2. The builder's technical calls, one by one.**

| Call | Judgement |
|---|---|
| T1 lines beside at the tape, the deciding line also at the book; T11 books for N's slices 0–19 legs (a superset of the 715 line's) | Sound: the fetch does not depend on the safety net. |
| T2 look 2 a later build, byte-identical | Needs the rewording (finding 1). |
| T3 `fresh.sha256` and F7's list from FRESH's manifest | Sound; recomputed exactly. |
| T4 the reproduction once detached, again at look 1 | Sound; its first run's one-off fault led to the double build. |
| T5 the projection a scratch script, its numbers dated with the file's SHA-256 | Sound; its source is in the supervisor folder, not frozen; I recomputed one part and the thin-day count. |
| T6 every option branch built and tested | Mostly: built, flips pass; the non-default step-2 paths are untested end to end (finding 3). |
| T7 EXAM_ROOT `ANALYZER\FRESH` at look 1 | Sound; `placebo.json` must be copied there (finding 6). |
| T8 `dist/schedule.js`, `dist/log.js` shared, unfrozen, hashes logged | Sound, as WAVE-H's H0. |
| T9 the 715 line's numbers from E alone, labelled seeded | Sound; C is never read for it (checked in code and in my run). |
| T10 one z for the exam whichever line decides | Sound and conservative: the max of four percentile estimates and the floor; recomputed. |
| T12 the net read once at look 1, deciding every later look | Sound; look 2 must read look 1's `step1.json` (rewording item 5). |
| The successors' calls (funding through the minute price; BASE's minutes the whole segments under either option; the reproduction holds the 715 placement to placebo.json; placebo.json held by SHA-256 in EXAM_ROOT; option B by a leg's UTC day; the net counts positions not left out after B's cut; step 1 extracts every time; integrity and builds in their own files before `step1.json`; the lines' hash covers all four; exit codes 4 / 5 / 6 / 7; the report computed before `result.json` and written after; the freeze tool's `--data` exactness) | All sound. The holes by record time (the union of every file's times, 60 s or more) read plan 3.4's "missing block numbers of 60 s or more" and agree with the per-file hole the scan records. |

**3. The marked options** are complete and freezable as one line each; see the table above. Each branch is built; the flips fail only default-pinning tests.

**4. The numbers come from their sources**: see "What I recomputed". z and LIKELY's z, the projections and the WITHHELD rows equal `placebo.json` and `withheld.json`; the file hashes equal the rules and the design.

**5. The verdict.** The order WITHHELD, TOO FEW, DOES NOT HOLD (at HOLDS's z), HOLDS (m − z·SE > 0, the mean excess over BASE > 0, the book-priced mean > 0), LIKELY, NOT SETTLED is what `verdictOf` does (R6, and 14 breaks of it killed: the order, each condition, z against z_L, each boundary, the sentences). Each of the six sentences prints as P11 words it. The looks are M11: only HOLDS or DOES NOT HOLD end the exam early (break `v8`, LIKELY ending it, is killed). The net is read once, by counts, at look 1's step 1 and held by step 2 (killed: `s2`, `s3`; `n1`, `n3`, `m14`; `n2` survives, finding 3).

**6. FRESH's data.** The range is 4,102 / 170 / 342, equal to the manifest. `fresh.sha256` equals the manifest line for line. F7's list and its 59 thin days are exact; the threshold is not borderline. Option B's days are metadata (the listing of 2026-11-13) and need the refresh (finding 2). The holes are by record time and join across files. The thin days' minute-price fallback (the builder's Q1: no rule change, counts at step 1): sound. The model says it adds 0.01 point to WITHHELD and my count says at most 0.04 (finding 4); step 1 prints the minutes by the trade fallback and the positions without a funding price by coin and day; adding the tripwire sentence (finding 6) makes the step-1 read mechanical.

**7. The steps and the gates.** The seal opens only on a verified, tagged freeze (breaks `g1`–`g4` killed: the list, the tag, one tag line, the list held by the tag); the reproduction passed by this very program precedes step 1 (`g1`, `g2`); FRESH is built twice and held equal, exit 7, before the integrity (`s4`, `m8`, `m10`); step 1 counts only and stops for the books; step 2 asks every needed book of `books.jsonl` before any store file (`m2`), holds step 1's positions (`s2`), writes `result.json` before anything about an outcome is logged (`m6`), refuses a second run (`s1`). Nothing heavy beside the look is a rule (P15), not a mechanism.

**8. What could still go wrong at the look, and whether a rule catches it.**

| Risk | Caught by | Gap or cost |
|---|---|---|
| A FRESH file missing or differing | hash against `fresh.sha256`, exit 5, before any is read | a download |
| A one-sided trade beyond FRESH's two edges | G5's pairing, exit 6; H0's route (`fresh-unpaired.json`) | a re-freeze and about 2.5 h |
| A one-off memory fault in the extraction | the double build, exit 7 | +75 min; placement and pricing run once (the Final review's independent recompute covers them) |
| A thin or failing `asset_ctxs` day | read as absent, listed; trade fallback | 0.01–0.04 point of WITHHELD; step 1 prints it |
| A hole in the fills | left out, counted in WITHHELD | — |
| A day without books | option B's cut, or the tape | 2026-11-13 → 15 unknown (finding 2); P(>10%) 1.8% (B) against 11.6% (A) on E's rates |
| The 715 line too thin | the safety net to N, read once | fires in about 7% of windows under B |
| WITHHELD, TOO FEW | the verdict; look 2 runs after it | an unanswered look 1 |
| Book fetch incomplete | step 2 refuses before any store read, exit 5 | — |
| A crash between the writes | H15's recovery by hand; the same numbers or a code defect | — |
| A frozen file touched, `git` missing from the launcher's PATH | exit 4 | misleading message (finding 12) |
| A build, test or heavy run beside the look | P15, as a rule only | no mechanism |
| The reproduction fails again at look 1 | exit 6, `lookGate` needs `passed` | the rules are silent on retries; a retry of a deterministic check reads no outcome |
| LIKELY read as HOLDS | its own sentence says it is not | — |
| Look 2 drifts from look 1 | the allow-list (to be written) | finding 1 |

## What the P1/P12 rewording must contain (the supervisor's question on the ruling)

Look 2 is a later build under its own freeze and `rules.md` is unchanged at that freeze. So the text written now must carry, in P1 (with P0 and P12 pointing to it):

1. **The freeze itself:** `polish-freeze-2`, written by the same tool from a clean tree after look 1 (the tool must take the tag number: finding 7).
2. **An allow-list by file name, and who checks it.** Only these may differ from freeze 1's list: `dist/polish/seal.js` (FRESH_END), `range.js` (the look-2 range), `main.js` (the range and list it passes), `exam/design.js`, `exam/fresh.js`, `exam/steps.js`, the new data file `polish/fresh2.sha256`, and `polish/fresh-unpaired.json` only if look 1's step 1 ruled a record. Every other file, `rules.md` included, is byte-identical. The tool refuses a freeze-2 list that differs elsewhere from `git show polish-freeze-1:./apps/poller/polish/FROZEN.sha256` (mechanical, so it cannot be argued after look 1's result is known), and a test pins the allow-list in rules.md to the tool's. The builder's draft names the six compiled files and the list; it lacks the check.
3. **What those files may change:** ranges, end instants, data-list names, look 2's folder, the index into the bars (look 2's 2.81 / 2.437), F7's lists and the reading of look 1's files; **never** the rule (B0 + W4, M, K), the price, the verdict, the statistic, the bars' values, δ, the 10%, 20 and 10, the floors, the options. P17 says which of its rows are look 1's own (segment 2, the no-book days, the thin days) and which must stay equal, since `design.ts` changes the first and `polish-rules.test.ts` holds the table to it.
4. **FRESH-2's data:** the fill hours [2026-11-16 00h, 2027-02-06 00h) (82 days, 1,968 files), their `asset_ctxs` days and funding windows, listed in `polish/fresh2.sha256` by the tool's `--data` from its manifest (names, bytes, SHA-256; the exact key set, each once). FRESH's lines reappear unchanged, except the 38 funding files of the window that crosses FRESH_END (the download tool cuts the last window at the range's end, `endTime: w.end − 1`), unless FRESH-2 starts its own 20-day grid at FRESH_END: say which. FRESH-2's files stay unread until freeze 2 because `checkKey` refuses a key at or after FRESH_END even when the seal is open.
5. **Look 2's reading of look 1:** it reads look 1's `step1.json` (the deciding line chosen once by the net, T12) and `result.json` (look 1's reading, for F14), each held by a SHA-256 named in look 2's identity; the net is not read again.
6. **Look 2's store and its checks:** the whole range [2026-05-29 02h, 2027-02-06 00h) (M5's blocking, W4's hour, funding and the minute grid span the join), built twice and held equal (exit 7), the integrity again (G0, G5), the reproduction again by look 2's program. F7's lists (days without books, thin days) are the metadata of freeze 2's date, and option B, if chosen, cuts look 2's listed days by the same rule.
7. **F14 when look 1 ended the exam** (HOLDS or DOES NOT HOLD): say whether look 2 is not run or runs and prints "after the verdict" and changes nothing (my recommendation: optional, printed "after the verdict").
8. **P0's "after the freeze nothing changes"** gets this one named exception, and nothing else; a defect found after look 1 still goes by H0's route; a fresh worker reads the diff between the two lists (the changed lines only).
9. **What goes:** P1's "(two looks only)", P10's one-look bullet, P12's [OPTION C], P16's third table row and its header, P17's "floors, one look", "one later look" and the `looks` word of the `options` row; in code `OPTIONS.looks`, `BARS.oneLook`, `TEXTBOOK.oneLook` and the tests that pin them (`polish-exam-verdict`, `polish-rules`). `placebo.ts` may keep `LOOKS.oneLook`: `placebo.json` is held by SHA-256 and prints that row, which P10 must say decides nothing (the builder's draft does).

## My breaks (47 one-line breaks of what the rules decide, in a scratch copy; the 11 exam test files run for each)

**Killed 40; survived 7.**

| Group | Killed |
|---|---|
| The verdict (`v3`–`v10`, `x1`, `x2`): the book mean, the excess, DOES NOT HOLD's z, WITHHELD at 10%, TOO FEW at 20 days, LIKELY ending the exam, HOLDS at z_L, the order, the sentence, the not-advice line | all 10 |
| The deciding days and option B (`d1`, `d2`, `d4`) and the holes (`h1`, `h2`) | all 5 |
| The net (`n1`, `n3`, `m14`), K (`m13`) | all 4 |
| The gate and the look gate (`g1`–`g4`) | all 4 |
| Step 1 and 2's order and holds (`s1`–`s5`, `m2`, `m6`, `m8`, `m10`) | all 9 |
| z and the bars (`z1`–`z5`) and the price (`p1`), F7's shares (`c1`, `c2`) | all 8 |

| Survivor | What it breaks | Status |
|---|---|---|
| `v1` | `bookBoth: true` in step 2's `decided` | finding 3; the builder's tree extracts `decidedOf` |
| `v2` | the net in place of the excess | finding 3 |
| `p2` | BASE over segment 1 only | finding 3; the builder's tree extracts `examBase` |
| `n2` | step 1's net counts the left-out positions | finding 3; fixed in the builder's tree |
| `m3` | FRESH's store identity unchecked at step 2 | finding 3 |
| `d3b` | `onDeciding` at slice K itself | finding 10; on the builder's list |
| `h3` | a hole of exactly 60 s | finding 10; on the builder's list |

The three option flips (one later look, kept, OWN, each with P17's row set to match) fail 2, 7 and 2 assertions, all of them tests that pin the default.

## Rule by rule

| Rule | Code | Test | Agrees? |
|---|---|---|---|
| P0 identity, what is frozen, the gate, the seal, the defect route | `exam/gate.ts` (`EXAM_SCOPE`, `EXAM_CLOSURE` 31, `verifyExamFreeze`, `taggedList`, `sealOf`), `seal.ts`, `main.ts`, `tools/polish-freeze.cjs` | `polish-exam-gate` (the seal by name and through a junction, FRESH_END open or closed, the freeze in a temporary git repository: every refusal, the closure held to the three freezes), `polish-freeze`; mine `g1`–`g4`, the draft equals a clean build | Yes, with notes (1, 7, 12) |
| P1 instants, ranges, deciding days, look 2 | `seal.ts`, `range.ts`, `design.ts` `SEGMENTS`, `LOOK2_END`, `fresh.ts` `inExam`, `whereOf` | `polish-exam-fresh` (the download tool's plan key for key), `polish-exam-days`; mine `d2`, `d4`, the counts by hand | Yes; look 2's text (1) |
| P2 FRESH's data and store: list, two builds, integrity, absent days, F7 | `fresh.ts` `integrityOf`, `gates.ts` `wholeOf`, `pairingOf`, `steps.ts` `stepOne`, `ctxs.ts`, `look.ts` `f7Of` | `polish-exam-integrity`, `-fresh`, `-look`, `polish-freeze`; mine `s4`, `s5`, `m8`, `m10`; the manifests | Yes, with notes (2, 4, 8, 11, 13) |
| P3 coins, counted fills | `counted.ts`, `tries/forced.ts` | `polish-exam-fresh`, `polish-gates` | Yes |
| P4 the recipe, the net, N and 1,391 beside | `look.ts` `linesOf`, `tries/rules.ts` `place`, `fresh.ts` `safetyNet`, `design.ts` `RECIPE` | `-placebo` (the cuts), `-days`, `-look`, `-repro` (b); mine `n1`, `n3`, `m14`, `n2` survives; the cuts recomputed | Yes, with notes (3, 5) |
| P5 the deciding line, K = 20 | `look.ts` `onDeciding` | `-look`; mine `m13`; `d3b` survives | Yes (10) |
| P6 the price | `exam/price.ts`, WAVE-H's book code, `tries/sweep.ts` | `-price` (WAVE-H's `priceSpot` to the bit), `-repro` (c: 1,289 prices); mine `p1` | Yes |
| P7 minute price, BASE, excess, [D] | `tries/prices.ts`, `price.ts` `baseOver`, `beside.ts` `ownOf` | `-price` (BASE pooled), `-verdict` (OWN); `p2`, `v2` survive | Yes; the step-2 wiring is unpinned (3) |
| P8 holes, left out | `fresh.ts` `holesOf`, `leftOutOf`, `scan.ts` | `-days`; mine `h1`, `h2`; `h3` survives | Yes (10) |
| P9 the statistic | `verdict.ts`, `tries/stats.ts`, MARKET-1's `twoWay` | `-verdict`; mine R6 | Yes |
| P10 z from the placebo | `placebo.ts` `zTable`, `beside.ts` `placeboOf`, `design.ts` `BARS` | `-placebo` (day flips against an independent recomputation, z at each boundary, beside.json to the bit), `-verdict`, `polish-rules`; mine `z1`–`z5`, R1 | Yes |
| P11 the verdict, [E] | `verdict.ts` `verdictOf`, `steps.ts` `decided`, `fresh.ts` `whereOf` | `-verdict` (every condition and boundary), `-look` (ends WITHHELD only); mine `v3`–`v10`, `x1`, `x2`, R6; `v1`, `v2` survive | Yes; the wiring is unpinned (3) |
| P12 the looks, F14 as M11 | `verdict.ts` `decides`, `examVerdict`, `steps.ts` | `-verdict`; mine `v8`, `s3`, R6 | Yes for two looks; **as written at `09eaf57` the one-later-look branch differs** (ruled out) and look 2's text is open (1) |
| P13 lines beside | `lines.ts`, `steps.ts` `report`, `tries/beside.ts` | `-look` (walks by hand, tape lines, placebo copied, books read) | Yes, with a note (5) |
| P14 prints | `look.ts` `countsOf`, `steps.ts` | `-look` (counts by hand); mine `c1`, `c2` | Yes, with notes (8, 9) |
| P15 steps, gates, exits, recovery | `steps.ts`, `run.ts` `exitOf`, `main.ts` | `-look`, `-repro`, `-placebo` (the built program); mine `g1`, `g2`, `s1`, `s2`, `m2`, `m6`; `m3` survives | Yes, with notes (3, 6) |
| P16 options, projections | `placebo.ts` `powerOf`, `design.ts` `OPTIONS`, `withheld.mjs` (scratch, not frozen) | `-placebo`, `-verdict`, `polish-rules`; mine R4, the flips, `withheld.json` | Yes, with notes (2, 4) |
| P17 the design's numbers | `design.ts` | `polish-rules` (row by row; `m13`, `m14`, `z2` die on it) | Yes |

**Counts: agrees 7** (P3, P5, P6, P8, P9, P10, P17), **agrees with notes 10** (P0, P1, P2, P4, P7, P11, P13, P14, P15, P16), **differs 1** (P12's one-later-look branch, already ruled out). **By my breaks:** fully pinned 6 (P0, P2, P9, P10, P14, P17), partly 10 (P1, P4, P5, P6, P7, P8, P11, P12, P15, P16), none 2 (P3 and P13: not touched by my breaks, covered by the repository's tests).

## What I could not check

FRESH's data (sealed; nothing of it was or may be opened), so the real thin files' content, the real counts at step 1 and every real price; the second reproduction's result (the supervisor's run from 06:00:30Z); the archive's current listing for 2026-11-13 → 15 (metadata, the supervisor's to run); the book fetch at look time; the extraction's and the pricing's behaviour on FRESH's 160 GB; whether `git` is on the PATH of the detached launcher. The builder's uncommitted tree (read at 04:20Z, not reviewed) and its breaks round: the fresh code review follows it, and my 47 breaks and the P11 grid can be re-run on its commit in minutes. Lint and format. The code's quality. The projection's real-world calibration: its numbers are E's, seeded and optimistic (the 715 line was chosen after looking at E), as the rules say.

## For the fix round and the freeze day

1. In one commit: finding 1 (P0, P1, P12 per the section above; the branch out of code, P10, P16, P17 and tests), finding 2 (the listing and `NO_BOOK_DAYS`, P2, P16, P17), findings 5, 6, 7, 8, 9, 11, 13's sentence; tests for findings 3 and 10.
2. `pnpm verify`; the draft list written again (`node tools/polish-freeze.cjs` from a clean tree); a short read of the changed lines by the supervisor or a fresh worker, then the fresh code review.
3. The owner's talk (E and Q4; the looks are ruled); P17's `options` row and `design.ts` set to the answers.
4. The second reproduction's result (exact (a) = the fault was a one-off); the listing for 2026-11-13 → 15; `git` from the launcher's environment.
5. `pnpm verify` on a clean tree, `node tools/polish-freeze.cjs --final`, commit, tag `polish-freeze-1`; the list's SHA-256 and the tag in decisions before look 1.
6. Look 1: copy `placebo.json` (`c25345f7…`) into EXAM_ROOT; the reproduction by the frozen program; step 1; read its counts (the tripwire sentence) before the books are fetched; the books; step 2; no build, test or heavy job on the PC meanwhile.

## Questions, each with my recommendation

1. **The look-2 rewording** (items 1–9 above): adopt, with the mechanical check? *Recommendation: yes.* It is the only protection against a look 2 shaped by look 1's result, and it costs a list and a tool check.
2. **After an early verdict at look 1, is look 2 run?** *Recommendation: optional, printed "after the verdict", never changing it* (as M11 prints MARKET-1's later looks).
3. **Refresh option B's list** by a metadata listing before the freeze and print the missing row? *Recommendation: yes,* then keep B as the default.
4. **A step-1 tripwire sentence** (left-out plus funding-without-price above 5% of the deciding line is a data defect to rule on before the books are fetched)? *Recommendation: yes, a sentence, not a new verdict rule.*
5. **The "seeded, decides nothing" labels, the placebo copy, the tag number, the counted-fills print, the books-needed hash** (findings 5–9)? *Recommendation: yes;* each is a few lines, and the first, second and fifth change frozen files, so now is the cheap time.
6. **Re-run my 47 breaks and the P11 grid on the builder's commit?** *Recommendation: yes,* about 45 minutes, one run at a time, outside 06:00Z until your word.
7. **WITHHELD B or A, and BASE or OWN** (the owner's): *recommendation B (after the refresh) and BASE.*

## Slips, all of them

My first break harness read vitest's JSON from stdout; vitest 5 writes it to a file, so the two trial results were thrown away and the two breaks run again. My first `d3` break found its text twice and was not applied; it was re-aimed as `d3b`. A first progress note carried a stamp of 04:20Z written at 04:03Z (corrected). A first write to `progress.md` through a path spelled with another letter case was refused ("not read yet") and made again through the right one. My first attempt to save a draft of this report in my scratch folder was refused by the harness (nothing was written). None touched a figure in this report.

## Evidence

In my scratch folder (`C:\Users\grozd\AppData\Local\Temp\claude\2256ffbe4c0a36f2\9ae2cc3d-0e52-45ea-b789-e2b44c23fa51\scratchpad\POLISH-RULES-REVIEW\`): `mkcopy.ps1` (a scratch copy of a commit with per-package junctions), `copyA` (pristine, built), `copyB` (breaks), `breaks.cjs`, `breaks-list.cjs`, `breaks-list2.cjs`, `breaks-out.json`, `breaks-out2.json`, `r1-placebo.cjs` (the placebo, W4's quantiles, the funding-gap share), `r3-thin.cjs` (the thin-day worst case), `r4-power.cjs` (P16's table), `r5-manifests.cjs` (FRESH's and WAVE-H's manifests), `r6-verdict.mjs` (P11), `r7-draft.cjs` (the draft list against a clean build), `r8-printed.cjs` (placebo.json and withheld.json), `thin-days-check.cjs`, `store.cjs` (a copy of POLISH-EXPLORE-REVIEW's reader), and the run outputs `r1-out.txt`, `r3-out.txt`, `copyA-all.log`. The working record is `E:\coding\Claude\supervisor\polymarket-follow\workers\POLISH-RULES-REVIEW\progress.md`. Commit: none from me (the harness bars a subagent's report file); the coordinator saves this text as `docs/reviews/polish-rules-review-2026-11-20.md` and commits it by name.
