# COPYH-RULES2-CHECK — the fresh check that COPYH-RULES-2's last touch of COPY-H's rules says what the rulings say

COPYH-RULES2-CHECK (Sonnet 5.5, max, fresh; the rules' writer was Opus 5.5), 2026-11-26 12:59Z – 14:10Z (every stamp from `date -u`), for polymarket-follow's supervisor. It checks the three commits `855cfad`, `68a42ce` and `2e48130` (`git diff 5a80af5 2e48130 -- apps/poller/copyh/rules.md`: 35 hunks, 602 lines, 248 lines added and 70 removed; `rules.md` at `2e48130` is SHA-256 `cff618e2…58df`, 108,203 B, 1,672 lines, and is the same file at HEAD `7be16bf`). The question: does the diff say exactly what the rulings say, and nothing else? **A review decides nothing:** the supervisor rules on it. It changes no rule and writes no code.

**The limits held.** Read only. No data was opened (nothing on F:), no network, no program of the project run, no agent started, polymarket-lab untouched, `rules.md` not edited. Besides git, I ran two small text scripts of my own, both in my scratchpad (section 7). I read, never changed, the committed code where a ruling names it (`schema.ts`, `scan.ts`, `merge.ts`, `chains.ts`, `normalize.ts`, `design.ts`, the rules test), the supervisor's folder files named in section 7, and COPYH-RULES-2's `brief.md` and `progress.md` (the supervisor's later rulings are quoted there).

**The bar** was fixed in my brief before I read the text: (1) every ruling present and exact in meaning; (2) nothing else changed (every hunk traces to a ruling); (3) consistency: C18 equals `design.ts`, cross-references resolve, no new contradiction (above all cut E against C3's chain test and K3; (a-lite) + A' against C0's identity, C15 step 1 and C3's "each step builds its store twice"; the caps against C4, C5 and C15; UNIT_ROWS against C15's heap); (4) the guards hold (no outcome before the freeze, FRESH-2 unseen, no choosing month judges, nothing in the new text chosen from a count of E).

## In one page

**Verdict: ready after these fixes.** No high and no medium finding. Six low findings (F1–F6), all wording or a decisions entry; none touches a rule, a number, a bar or a guard. Five of them (F1–F5) are clauses of 10 to 25 words each, about 15 lines in one small fourth commit; F6 is the supervisor's own decisions entry. They belong before E's count: C15 (c) closes the file when the rehearsal first runs on real months, and E's count is held for COPYH-STORE-FIX's round anyway, so the commit costs no time.

**What is solid**

- **Every ruling is in.** I checked 26 rulings, one by one, from the text: **24 exact, 1 kept in meaning (the engine's Q3), 1 partly missing (the engine's Q2: its first sentence), 0 changed.** The eleven engine questions that the brief left without a sentence (Q6–Q10, Q13, Q14, Q16, Q18, Q19, Q21) were each read against the text: none makes the text differ from the ruled reading.
- **Nothing else changed.** All 35 hunks trace to a ruling, and a word-level diff (44 removals, each a phrase a ruling replaces) shows no removal hidden in a re-wrapped line. Six small clauses have no wording of their own in a ruling (section 2); each is a consequence of one, and none changes a rule, a number or a bar. No commit touches a file but `rules.md`, `design.ts` and `copyh-rules.test.ts` (commit 2, as the supervisor extended the brief).
- **The numbers agree.** C18 has 65 rows, equal by name both ways to the rules test's ROWS; the three new rows equal `design.ts` (both caps null and marked, FRESH-2's six days equal). Every figure of cut E's evidence and of C15 (a)'s new bullet equals COPYH-REPRO's `progress.md`, number by number; the burn-in figures equal decisions 2026-11-26; the duplicate counts equal decisions 2026-11-25.
- **Cut E and K3 do not meet.** The chain test and its count are unchanged and read a taker's and a maker's alike; cut E lives in `normalize.ts`, which no compiled file imports (so the store closure does not move), and K3's burn-in count stands.
- **(a-lite) + A' is coherent** with C0's identity, C15 step 1's 2., the exit-7 sentence, the heap sentence and C3's store bullet.
- **The guards hold.** Nothing priced before the freeze (the new counts are fills, accounts, labels and hashes); FRESH-2's new text is six dates and no data; no month that chooses also judges (the zero-duplicate counts from S's months are counts of a stop, recorded in decisions 2026-11-25).
- **Form:** 10 `[SET BEFORE THE FREEZE` markers (the eleventh occurrence is C17's own sentence, which is not a marker by its own definition), no `[OPEN Q`, no CR byte, `git diff --check` clean, no added line over 80 characters but one table row.

**What must change, in plain words**

1. **The engine's Q2 is half in (low, F1).** The text has the tripwire's half; it does not say that a trader's prior count is over all prior MAIN copies, priced or not, which is what lets the tripwire keep the count condition and drop only the mean-net one.
2. **The store closure's scope is not said (low, F2).** "Every compiled file that the pass … load" leaves out whether `dist/schedule.js` (shared, "not frozen" in C0) and lz4js's three files count. COPYH-STORE-FIX's `closure.ts` (`8f78679`, landed while I wrote) has chosen: relative imports, so schedule.js in and lz4js's three out; the sentence should say what the code does.
3. **Three small gaps in C3, C15 (a) and C15 (c) 7 (low, F3–F5):** the three failure causes are named but not defined; C3's cut-E print says 953,244 events where C15 (a)'s own print has three more at one order; the label bound's check does not say what the new label cap does to its whole capture.
4. **Five rulings exist only in messages (low, F6):** cut E, the line reading, the day rule's denominator, the fourth liquidation state and C15 (a)'s allowed difference. The text cites "the supervisor's ruling, 2026-11-26"; decisions holds no entry for them yet.

**Questions** (section 6, each with a recommendation): whether to take F1–F5 now in one small commit; the closure's scope; the decisions entry; the stale code comment that sits in the store closure (`chains.ts`); F5's wording.

**Next.** If F1–F5 go in, one fourth commit by COPYH-RULES-2 (or the supervisor) before E's count; then the rules wait for E.

---

## 1. Every ruling, from the text (the bar's 1)

**E** = the ruling's words, or the supervisor's approved wording, said in the text with the meaning whole; **K** = kept in meaning, other words; **P** = part of the ruling is missing; **C** = changed. Lines are `rules.md` at `2e48130` (= HEAD). Sources: the brief of COPYH-RULES-2 (its eleven sentences), decisions 2026-11-25 and 2026-11-26 (the entries named), the supervisor's messages as COPYH-RULES-2's `progress.md` quotes them (times Z), the engine's plan (`docs/reviews/copyh-engine-plan-2026-11-26.md`, section 16, equal to `workers\COPYH-ENGINE\progress.md`) and the store review.

| # | Ruling and its source | Where it landed | |
|---|---|---|---|
| A1 | **Another repeated record** outside the switch hour's two files stops the build (exit 5), with the zero-duplicate evidence; E's rehearsal shows a repeat first; on S or FRESH-2 one of C17's stops (decisions 2026-11-25, the store builder's ruling 2) | C3 l.349–358; C15 exit 5 l.1268–1269 | E. The code (`merge.ts` `fillsUnit`) agrees: twice in one file, twice outside the switch hour's two, a third time |
| A2 | **`COPYH_HEAP_GB` at most C18's `worker heap cap GB` (20)**, above it exit 2, a step that needs more cuts its parts smaller (ruling 3) | C15 l.1244–1247 | E. The ruling's last sentence (the heap measurement also reports the sum of all threads' peaks against the machine's memory) is a print of the program; C15 (c) 9 prints every part's peak |
| A3 | **Holes at the window's two ends** (ruling 4) | C3 l.485–488 | E |
| A4 | **A line that does not tile** (queued sentence 4; the supervisor's wording, approved 11:05Z) | C3 l.329–337 | E, in the approved wording (a line that parses whole as its format's line keeps its passing records; any other line counts its records as failing, one when none can be counted, a blank line one). It supersedes the brief's shorter "counts its records as failing". `scan.ts` `slowLine` and `recordsOf` do exactly this |
| A5 | **C0's funding seal by a row's time** (the breaks round, decisions 2026-11-26) | C0 seal 2, l.144–149 | E |
| A6 | **The burn-in re-reads E's sample days in its range** (COPYH-GUARDS' ruling 2, decisions 2026-11-26) | C15 l.1257–1261 | E |
| A7 | **`startPosition` read as its double**, shortest text at most 15 digits, with the burn-in's evidence (the boundary fix `d42b96a`, decisions 2026-11-26) | C3 l.304–321 | E. 628,020 of 220,682,866 and the 16–18 digits equal the decisions entry |
| A8 | **A finite guard on `sz`** (queued 10), and on `px` (11:05Z; store review M2) | C3 l.316–317; schema pins l.498–500 | E. The clause also names `startPosition`; the code's `exactAsDouble` already refuses a non-finite double (see section 2) |
| A9 | **LABEL_FILLS_MAX and HISTORY_FILLS_MAX** (the engine's Q1 (c); decisions 2026-11-26, "THE CAPS MUST NEVER LEAVE OUT…"): what each does, named, counted and printed at every look; the two lanes; the principle; both set before the freeze, marked like the worker heap; their C18 rows | C4 l.553–578; C5 l.597–606; C13 l.1015–1018; C15 (c) 5 l.1364–1367; intro l.27–30; C18 l.1621, 1624 | E |
| A10 | **FRESH-2's integrity sample days**, the 15th of each of its months (Q17) | C14 l.1185–1192; C18 l.1672 | E. Dec 15 → May 15 is six days; Nov 15 belongs to S |
| A11 | **Engine Q2**: the prior count is over all prior MAIN copies; the tripwire projects a try's set without the mean-net condition and says so | C16 l.1557–1563 | **P**: the second sentence is there, exact; the first (the count over all prior MAIN copies, priced or not) is not (F1) |
| A12 | **Engine Q3**: on a twin difference both copies are moved aside under a decisions entry and computed again; the light phases run twice too | C15 l.1466–1476 | K: "computed again, twice", "nothing is repaired in code, as with a store's two builds" and the five named phases come from the plan's wording of Q3 ("the stores' route"; RANK, RESULT, the tries, the choice, the confirmation) |
| A13 | **Engine Q4**: the market object held to `marketThrough` too | C9 tests l.820–827 | E |
| A14 | **Engine Q5**: step 2 holds step 1 to the SHA-256 of the positions' uncompressed lines sorted by entry id, named in `result.json` beside the file's own | C15 step 2's 3., l.1488–1495 | E (replaces "`look1.sha256`'s positions hash") |
| A15 | **Engine Q11**: no thin leg at a settled copy's last leg | C9 l.805–813 | E |
| A16 | **Engine Q12**: no mark for a minute whose market trades sum to size 0; the rehearsal counts such trades | C9 l.758–763; C16 l.1545–1549 | E |
| A17 | **Engine Q15**: a try's set is its line's copies of E voted by END_E; m over the priced, m′ over those with a d; the 100 traders and 100 days on the priced | C14 l.1079–1082 | E |
| A18 | **Engine Q20**: the closed copies leave out settled copies | C13 l.982–984 | E |
| B1 | **The merge's unit size a ceiling like the heap** (the store review's H1; approved 12:12Z; decisions 2026-11-26, "COPY-H IN PARALLEL") | C15 l.1233–1236 | E |
| B2 | **(a-lite) + A'** (decisions 2026-11-26, "COPY-H IN PARALLEL"; the supervisor 11:14Z): E's store built once, its record in `rehearsal.json` (closure hashes, manifest without run fields, every file's SHA-256), `--final` refusing a changed closure, E rebuilt and recounted then, step 1's first build held to the record and its twin if equal | C0 l.108–110, 114–120; C3 l.476–480; C15 (c) l.1403–1420; step 1's 2. l.1425–1436; machine time l.1504–1507; pin l.1514 | E. The five run-only names (worker heap, worker heap cap GB, closed windows, part minutes, run minutes) are the writer's list under the ruling's "the run-only names left out"; all five are run control in `design.ts` |
| B3 | **The failing records counted by cause**, RH1 (d)'s shapes from those counts (the supervisor 11:08Z; store review M4) | C3 l.293–303 | E (F3: the labels are named, not defined) |
| B4 | **Cut E** (the supervisor 12:22–12:23Z, with COPYH-REPRO's evidence): a taker's fill takes its chain head, a maker's its own; the chain test and its count unchanged; "join" wording kept | C3 l.399–431, 434–436, 509–511 | E (F4: one print) |
| B5 | **The day rule's denominator** is every record of the day, spot and builder-dex among them (store review Q3; the supervisor 12:25Z) | C3 l.289–292 | E |
| B6 | **The store's fourth liquidation state**, a liquidation that names no account (store review section 8; 12:25Z) | C3 l.461–465 | E |
| B7 | **C18's three rows and their code** (the supervisor's extension 11:05Z) | C18 l.1621, 1624, 1672; `design.ts`; the rules test's ROWS | E |
| B8 | **C15 (a)'s one more allowed difference** (the supervisor 12:45Z, on COPYH-REPRO's whole-seed run) | C15 l.1309–1322 | E |

**Counts: 26 rulings; 24 E, 1 K (A12), 1 P (A11), 0 C.**

**The engine questions with no sentence**, each read against the text: Q6 (step 1's stores; superseded by (a-lite)), Q7 (the engine folders sealed: C15 l.1474–1476 already says it), Q8 (vault accounts before labels: C2), Q9 (withdrawn, decisions "COPY-H IN PARALLEL"; C9 unchanged, as ruled), Q10 (the last-price object: C9 "the same"), Q13 and Q14 (prints; C13 does not differ, the top 1% as ⌈n ÷ 100⌉ is a print's rounding), Q16 (covariate units: code), Q18 (FRESH-2's report: C14 term 5 already says it), Q19 (a step refuses while a set-before-the-freeze value is null: `--final` refuses a marker, C17), Q21 (docs). None makes the text differ from the ruled reading. The store review's Q2 (K1 keeps listing, no rule) is correctly absent.

## 2. Nothing else changed (the bar's 2)

`git diff 5a80af5 2e48130 -- apps/poller/copyh/rules.md`: 35 hunks, read whole. Commit 1 (`855cfad`) holds 32 of them, commit 2 (`68a42ce`) hunks 34–35 with `design.ts` and the rules test, commit 3 (`2e48130`) hunk 26. Lines are the new file's.

| # | Lines | Section | Traces to |
|---|---|---|---|
| 1 | 27–30 | intro | A9 |
| 2 | 106–123 | C0 frozen list, freeze test | B2 |
| 3 | 143–152 | C0 seal 2 | A5 |
| 4 | 287–320 | C3 stops, boundary | B5, B3, A7, A8 |
| 5 | 326–340 | C3 line reading | A4 |
| 6 | 346–361 | C3 repeated record | A1 |
| 7 | 406–439 | C3 chain heads, normalized | B4 |
| 8 | 459–470 | C3 `fills` | B6 |
| 9 | 474–492 | C3 store bullet, holes | B2, A3 |
| 10–11 | 495–515 | C3 pins | A7, A8, B4 |
| 12 | 550–581 | C4 the history cap, lanes, rule | A9 |
| 13 | 585–592 | C4 pin | A9 |
| 14 | 597–609 | C5 the label cap | A9 |
| 15 | 628–635 | C5 pin | A9 |
| 16 | 758–766 | C9 minute mark | A16 |
| 17 | 805–814 | C9 thin legs | A15 |
| 18 | 820–827 | C9 markets pin | A13 |
| 19 | 979–987 | C13 closed copies | A18 |
| 20 | 1013–1021 | C13 prints | A9 |
| 21 | 1076–1085 | C14 a try's set | A17 |
| 22 | 1185–1195 | C14 FRESH-2's integrity | A10 |
| 23 | 1230–1239 | C15 heap, UNIT_ROWS | B1 |
| 24 | 1242–1250 | C15 `COPYH_HEAP_GB` | A2 |
| 25 | 1257–1272 | C15 burn-in, exit codes | A6, A1 |
| 26 | 1306–1325 | C15 (a) | B8 |
| 27 | 1361–1370 | C15 (c) 5 | A9 |
| 28 | 1400–1439 | C15 (c) E's store, step 1's 2. | B2 |
| 29 | 1466–1479 | C15 engine's guard | A12 |
| 30 | 1487–1498 | C15 step 2's 3. | A14 |
| 31 | 1503–1518 | C15 machine time, pins | B2 |
| 32 | 1545–1552 | C16 | A16 |
| 33 | 1556–1566 | C16 | A11 |
| 34 | 1618–1627 | C18 two rows | B7 |
| 35 | 1669–1672 | C18 FRESH-2 row | B7 |

**Hunks with no source: none.** Six clauses inside hunks have no wording of their own in a ruling; each is a consequence or a reading of one, and none changes a rule, a number or a bar:

1. C3 l.316–317 names `startPosition` in the finite clause; commit 1's message says "px and sz". The code has refused a non-finite `startPosition` since `d42b96a` (`exactAsDouble` tests `Number.isFinite`), so the text says what the code does. **Kept.**
2. C14 l.1187–1188 "integrity as S's at step 2": says the form of the integrity whose days Q17 rules.
3. C15 (c) l.1408–1411 the five run-only names: the writer's list; checked against `design.ts` and the code (`PART_MINUTES` is not even used outside `design.ts`).
4. C4 l.577–578 "S's and FRESH-2's months may still bring an account above a cap: the look names it": a consequence of "named, counted and printed at every look", and an honest limit of "never leaves out".
5. C15 l.1471 "nothing is repaired in code, as with a store's two builds": the plan's "the stores' route".
6. C3 l.425–427 "So a market maker has more events than a join would give it…": a consequence of cut E.

Besides the clauses, the attributions "(the supervisor's ruling, 2026-11-26)" and "decisions 2026-11-26" point at rulings that decisions does not yet hold (F6).

## 3. Consistency (the bar's 3)

**C18 against `design.ts`.** 65 rows in the table, 65 keys in the test's ROWS, equal both ways (my script `c18check.mjs`, section 7). The new rows: `HISTORY_FILLS_MAX` and `LABEL_FILLS_MAX` are `[SET BEFORE THE FREEZE]` and null in `design.ts`; `sample days, FRESH-2` is the six days 2026-12-15 … 2027-05-15, equal to `SAMPLE_DAYS["FRESH-2"]`. The three commits ran `pnpm verify` green (exit 0, per COPYH-RULES-2's progress). One note (I4): the rules test pins the marker against the code's null only for the settlement mark.

**Cut E against C3's chain test and K3.** No conflict. C3 l.399–409 (the chain test) is the fix-checked text word for word but that "Every fill takes its chain head's `startPosition`" moved into cut E; l.409–411 says the count of matching events with more than one chain "reads these chains, a taker's and a maker's alike", so chains.ts, D12 and K3 are unchanged (the burn-in's K3: 127,443,917 matching events, 6,348 with more than one chain). The event forming is in the normalization (l.410–413, 434–436), whose code, `normalize.ts`, is imported by no compiled file at `7be16bf` (`accounts.ts` imports its `Row` type only), while `chains.js` is reached through `integrity.js`'s `chainCount`: so cut E does not move the store closure. C15 (a)'s reproduction runs "C3's chain heads and normalization", so it exercises cut E, as COPYH-REPRO's whole-seed run did (0 differences but the one order of the new bullet). One print is imprecise (F4).

**(a-lite) + A' against C0's identity, C15 step 1 and C3's twice.** Coherent. C0 l.108–110 names the record in `rehearsal.json` and l.114–120 pins the refusal; l.193–200's identity (the step's stores' manifests, `builds.json`, `integrity.json`, `rehearsal.json` by SHA-256) still holds, since step 1 writes each comparison into `look1\builds.json`; step 1's 2. (l.1425–1436) gives both cases (equal: the rehearsal's build is its twin; not equal: a second build, compared the same way, the difference from the record listed and deciding nothing) and keeps exit 7 for a difference between step 1's own two stores; the exit-7 sentence (l.1272–1273), the heap sentence "every store to its second build" (l.1229), C3's store bullet (l.476–480: S's and FRESH-2's twice, step 1's held to the record) and the machine-time bracket (l.1506–1507) agree. The rehearsal's store stays sealed, "only its record crosses the freeze" (l.1417–1420) matches A'. The ruling's "whole-program fingerprint stays" needs no sentence. Wording nits only (I5). The closure's scope is F2.

**The caps against C4, C5 and C15.** Coherent: C4's two bullets and marker (l.564–578), C5's rule and its label "too many fills for the kit" (l.600–606; the engine's `labelOf` answers "no fills in window" first, as the text orders), C13's print list, C15 (c) 5 (the rehearsal counts the accounts above the normal lanes' thresholds and each cap, Monday by Monday, with their fills, and labels them in the large lane), the intro's "Four values", the lanes at "C18's worker heap cap" (20, an existing row) and C15's `COPYH_HEAP_GB` sentence. The rule can only raise a cap, never lower it, so the rehearsal's count cannot choose a cap that leaves a directional account out. One gap: F5 (the label bound's check).

**UNIT_ROWS against C15's heap.** The sentence is exact to the ruling and to the review's own test ("a bucket above the unit size runs whole, the same store"). One thing worth knowing (I1): UNIT_ROWS is a constant of `merge.ts`, not of `design.ts`, and `merge.js` is in the store closure, so "a ceiling as the heap is" means no output depends on it, not that it can be raised after E's store is built without moving the closure (the store review's Q5 suggests raising it before the freeze if the 16-fold re-reading dominates).

**Cross-references** (all resolve): C15 (c) 1, 4, 5, 6, 7 and 10; step 1's 2. and 3.; step 2's 3.; C17's "other stops"; C18; RH1 (d); the engine's plan Q2/Q3/Q4/Q5/Q11/Q12/Q15/Q20 (the plan was filed as `docs/reviews/copyh-engine-plan-2026-11-26.md` in `79c46b6`, after the three commits, "so the rules' references to it point into the repository"); COPYH-STORE-REVIEW's Q3 and section 8; COPYH-GUARDS' question 2; the store builder's rulings 2, 3 and 4. The pointers "decisions 2026-11-26" name a date with seven entries, as the older pointers do (I5).

**Markers.** 10 markers: C4 l.569 (both caps), C9 l.796, C15 l.1224, C15 (c) 3, 5 and 9 (l.1351, 1367, 1385), C18's four rows (l.1621, 1624, 1639, 1662); the eleventh `[SET BEFORE THE FREEZE` (l.1588) is C17's own sentence. The intro's "Four values" (the settlement mark, the worker heap, the two caps) agrees. No `[OPEN Q`.

## 4. The guards (the bar's 4)

- **No outcome before the freeze.** Every new count is of fills, accounts, labels, memberships, hashes or sizes: the caps' counts "Monday by Monday" and the large lane's labels (labels are not outcomes: decisions 2026-11-26), E's store and its record, the failing records by cause. C15 (c)'s own closing sentence ("a count of instants, sizes, labels and memberships, or two prices of one moment") still covers them. The reproduction's figures are the paper's seed, Polymarket's known answers.
- **FRESH-2 unseen.** The new text is six dates and a rule that FRESH-2's integrity reads them; no FRESH-2 file or count is named. S is touched only by the zero-duplicate manifest counts that decisions 2026-11-25 (ruling 2) already records, "counts only", as the evidence for a stop.
- **No choosing month judges.** Cut E and the allowed difference are decided "from the seed's known data, never from a count of E" and "before any count of E"; the `startPosition` rule from the burn-in (before M₀, "prices nothing and judges nothing"); the caps only ever rise, from E's counts of labels, by a rule fixed before the count.
- **Nothing in the new text could have been chosen from a count of E.** E has not been counted: decisions 2026-11-26 holds E's count for the store review's findings, `copyh/rehearsal.json` does not exist, and `dirs.json` and `unpaired.json` hold the burn-in's values only (`af8076c`, `3280969`).

## 5. Findings, by severity

No high. No medium. Six low (F1–F6), five informations (I1–I5). Each finding gives the place, the text now, the problem and the wording I would put. Lines are `rules.md` at `2e48130`.

### F1 (low). Q2's first sentence is missing (C14)

- **Where:** C14, covariates, l.1068–1069: "the trader's own MAIN copies whose follow instant and every leg lie before M: their count and their mean net (RL6)."
- **The ruling** (decisions 2026-11-26, "ITS PLAN APPROVED", Q2): "a try using `priorMeanNetBps`: the prior count is over all prior MAIN copies. The tripwire projects its set without the mean-net condition, and says so." The plan: "the prior count counts the trader's MAIN copies whose follow instant and every leg lie before M, priced or not (price-free; RL6's 'their count'), and the mean is over the priced ones".
- **The problem:** C16 l.1559–1563 carries the second sentence. The first is what makes it work: the tripwire drops only the mean-net condition, so the count condition must be known before any price. "Their count" can be read as the count of priced copies.
- **Wording:** "…lie before M: their count, of all of them, priced or not, and their mean net, over the priced ones (RL6; the engine's plan, Q2)."

### F2 (low). The store closure's scope is not said (C15 (c))

- **Where:** l.1405–1411: "the hashes of its store closure (every compiled file that the pass, the merge, the store, the twin and the integrity load, found from the compiled import graph; `design.js` by the values of the names those files import from it, …".
- **The problem:** (i) `dist/schedule.js` (HOUR_MS, MINUTE_MS, DAY_MS: imported by `scan.ts`, `merge.ts`, `holes.ts`, `run.ts`) is loaded, and C0 l.112–113 calls it "shared and not frozen"; the sentence does not say whether the closure hashes it. (ii) The integrity's independent re-reader loads lz4js through `dist/waveh/lz4.js`; lz4js's three files are not "compiled files" (C0 l.98–100 lists them in the frozen closure). (`dist/log.js` is imported by `main.ts` only, which the closure's start files do not include, so it needs no sentence.) **COPYH-STORE-FIX's `closure.ts` (commit `8f78679`, which landed while I wrote) answers by the code:** from the entry points `pass`, `worker`, `merge`, `store`, `twin`, `integrity` and `reread`, every compiled file their *relative* imports reach, so `dist/schedule.js` is in, `dist/log.js` is out, and lz4js's three files (a bare import) are out; five run-only names (the same five) are left out of `design.js`. So the code has chosen; the sentence should say what the code does. lz4js's three files stay C0's closure's, checked at `--final`, not this record's. (A closure by compiled bytes also holds the files' comments, since tsc keeps them: `dist/copyh/chains.js` begins with its header comment. Any comment edit of a closure file after E's store is built moves the closure and re-opens E.)
- **Wording:** "(every compiled file that the pass, the merge, the store, the twin and the integrity load, found from the compiled files' relative imports, `dist/schedule.js` among them (lz4js's three files are C0's closure's, not this record's); …".

### F3 (low). The three failure causes are named but not defined (C3, C15)

- **Where:** C3 l.293–297: "counted by cause, counts only, never a value: "frame", "parse", "line", else the field path of the schema's first refusal, … each file's causes summing to its failed records, which the integrity holds (C15; …)".
- **The problem:** the three names are defined only in the store review's M4 and the code. A frozen rules file that the code review and a later reader check the code against should carry them. And C15's integrity list (step 1's 3., l.1437–1450) says "records conserved (read = kept + left out by kind + failed + not used)" and does not name the causes' sum, which the C3 sentence points to.
- **Wording:** in C3 after "never a value:" put `"frame" (not ["0x…",{…}]), "parse" (its text is no JSON), "line" (each record of a line that fails its own shape)`, then "else the field path…". In step 1's 3.: "failed (the sum of its causes, C3)".

### F4 (low). C3's cut-E print says 953,244 events; C15 (a)'s own run has three more (C3)

- **Where:** C3 l.422–425: "cut E gives 953,244 events, no entry and no P1 differing, and FR1's 1,137 / 157 and 525 / 61 (C15 (a))."
- **The problem:** 953,244 is COPYH-REPRO's what-if (12:13–12:19Z, taker fills chained, each maker its own head). Its run of the real cut E (found at 12:23Z, the whole seed again at 12:41Z; C15 (a) l.1317–1322) has events 2,110 / 2,113 at the one 27-digit order (`0x38df…`): three events more, one entry's exits split at the same instant, entries and P1 equal. The two prints sit 900 lines apart and a reader meets a contradiction until he reaches the allowed difference.
- **Wording:** "cut E gives the paper's 953,244 events but for three more at one order (C15 (a)), no entry and no P1 differing, and FR1's 1,137 / 157 and 525 / 61 (C15 (a))".

### F5 (low). The label bound's check does not say what the label cap does to its whole capture (C15 (c) 7)

- **Where:** l.1370–1381: the label and MAIN's conditions "from C5's 90-day capture against the whole capture from ARCHIVE_START, every difference listed", the pass mark counting "the accounts that meet the conditions under one capture and not under the other".
- **The problem:** C5 l.600–606 now gives "too many fills for the kit", never P1, to any capture above LABEL_FILLS_MAX. A whole capture is several times a 90-day one, so an account can meet the conditions under the 90-day capture and be capped under the whole one: the check would count the cap's effect as a difference of the bound, and could fail the 1% mark for a reason that is not the bound. It is also the kit's largest input, so it is a question where it runs.
- **Wording:** after "every difference listed": "an account whose whole capture is above LABEL_FILLS_MAX is counted apart, never as a difference of the bound, and is read in the large lane (C4, C5)".

### F6 (low). Five rulings exist only in messages (cites in C3, C15 (a))

- **Where:** C3 l.337 "(decisions 2026-11-26)" for the line reading; l.417–418 "(the supervisor's ruling, 2026-11-26)" for cut E; l.289–292 "(COPYH-STORE-REVIEW's Q3, the code's reading)" for the denominator; l.461–465 "(… section 8)" for the fourth state; C15 l.1309–1310 "(the supervisor's ruling on COPYH-REPRO's run, 2026-11-26)" for the allowed difference.
- **The problem:** decisions 2026-11-26 has no entry for cut E (12:22–12:23Z), the line reading (11:05Z), the day rule's denominator and the fourth liquidation state (12:25Z) or the allowed difference (12:45Z); the date's only word on the line reading is "a line that does not tile … queued". They exist in the supervisor's messages (as COPYH-RULES-2's progress quotes them) and, for two, in the store review, which "decides nothing". CLAUDE.md: decisions is the why; a review of the frozen text looks there. The dated pointers resolve to a date with seven entries. The other rulings are in decisions: `failedBy` and the finite guards on `px` and `sz`, the merge's unit, (a-lite) + A', the caps, Q17.
- **Fix:** the supervisor's decisions entry (see Q3). Not a rules change.

### Information (no fix needed, or not in `rules.md`)

- **I1. UNIT_ROWS lives in `merge.ts`**, so it is inside the closure's bytes (section 3). The sentence is exact; the consequence is for the supervisor: raising it after E's store is built re-opens E.
- **I2. Code comments the text now outruns.** `chains.ts`'s header says "Every fill takes its chain head's `startPosition`" (true of `chainHeads`, not of the mapping since cut E), and `normalize.ts`'s says "prevS = the fill's chain head's `startPosition`". `chains.js` is in the store closure and tsc keeps comments (F2): **correct `chains.ts` before E's store is built**, or never. `design.ts` l.45–49 says a capped account "fits well inside one worker's heap"; C4 says within half of the worker heap cap (20 GB). For the docs sweep, not edited: `docs/claude-architecture.md` l.1021–1022 says "a bucket above it refused", true until COPYH-STORE-FIX lands H1's deletion.
- **I3. The pin lists are partial.** The new sentences got pins where the writer touched a list (schema, normalize, entries, labels, markets, steps), none for the causes, the line reading, the repeated record, the holes' ends, the fourth liquidation state or the funding seal by time. The tests exist (`copyh-scan`, `copyh-merge`, `copyh-integrity`, `copyh-funding`) under file names the rules' lists predate (no list names `scan.ts` or `merge.ts`). For part 5 to check by content.
- **I4. The rules test pins a marker against the code only for the settlement mark** (its third `it`); the two caps' rows rely on the second `it` (a number in the table must equal the code's) and on `--final`'s refusal of a marker. A cap set in `design.ts` and left a marker in C18 would pass the test and stop at the freeze tool.
- **I5. Wording nits, none changes a meaning.** (a) C15 step 1's 2. "compared byte for byte … with E's record" compares to hashes, not bytes. (b) C9 l.822–825: "…and to the paper's `marketThrough`, the 5-minute rule (RM6; the engine's plan, Q4)" puts Q4 in the parenthesis of "the 5-minute rule"; read it as "the object equal to … `marketThrough`, and the 5-minute rule". (c) C0 l.197–198 "the step's stores' manifests" is plural where step 1 may have one store and the record. (d) "(the decisions entry of 2026-11-26)" (C4 l.571) names a date with seven entries; "COPY-H's ENGINE, COMMITS 1–2" would open one. (e) The bracketed s6/s7 print (C3 l.427–431: "with chain heads the kit's events break chains 17 times in 109,724 …") was measured with a chain head for every fill, before cut E; it is a print of the old mapping and now sits after the description of the new one.

## 6. Questions, each with a recommendation

1. **Take F1–F5 now, in one small fourth commit?** Recommendation: **yes.** Each is a clause, none changes a rule, a number, a bar or a guard, and after E's first count the file takes only the set values and the code review's named fixes (C15 (c), with the reason no count can have chosen them). COPYH-RULES-2 knows the file. About 15 lines; `pnpm verify` runs the rules test, which only the C18 rows touch (none of F1–F5 does).
2. **The store closure's scope (F2):** say in the sentence what `closure.ts` does (every compiled file the relative imports reach, `dist/schedule.js` in, lz4js's three files left to C0's closure)? Recommendation: **yes**, with no exemption but design.js's five run-only names. It is the safe reading; the cost is that an edit of `schedule.ts`, or a comment edit of any closure file, after E's store is built re-opens E (about 11 h), which is procedure to tell the workers (no edit of those files before the freeze).
3. **A decisions entry for the five message-only rulings (F6)?** Recommendation: **yes**, one entry before E's count, a line each with the time: cut E (12:22–12:23Z, with COPYH-REPRO's figures), the line reading (11:05Z), the day denominator and the fourth state (12:25Z), the allowed difference (12:45Z).
4. **Correct the stale code comments (I2) now?** Recommendation: **yes**, `chains.ts`'s header through COPYH-STORE-FIX before E's store (the comment is in the closure); `normalize.ts` and `design.ts` through COPYH-ENGINE-2 at its next commit; the architecture lines (I2) by whoever builds that part (a build may update architecture).
5. **F5's wording:** is "read in the large lane" what you want for the check's whole capture, or should the check skip such accounts? Recommendation: **count apart and read in the large lane**, so the check still sees the account and the pass mark's denominator stays honest.

## 7. What I ran, and access

- **git** (read only): `diff` and `show` of `5a80af5`, `855cfad`, `68a42ce`, `2e48130`, `7be16bf`; `git grep` at `2e48130` and `7be16bf` for the imports of `normalize.js`, `chains.js`, `schedule.js`, `log.js`, the run-only names and `UNIT_ROWS`; `diff --check`; the SHA-256 of both file versions.
- **Two small text scripts, in my scratchpad** (`COPYH-RULES2-CHECK\`): `c18check.mjs` (C18's row names against the rules test's ROWS both ways, the three new rows against `design.ts`, the markers, the CR bytes, the line widths) and `worddiff.mjs` (the word-level diff of the two versions, hunk by hunk). Output: 65 = 65 rows, no name on one side only, the FRESH-2 days equal, both caps null, 11 occurrences of the marker text (10 markers + C17's sentence), 0 CR, 0 `[OPEN Q`; 44 word-level removals, each read.
- **What I read in code, and what I took from the store review:** I read the code for A1 (`merge.ts` `fillsUnit`), A4 (`scan.ts` `slowLine`, `recordsOf`), A7 and A8 (`schema.ts` `exactAsDouble`, the guards still to land for `sz` and `px`), the imports behind F2 and I2, and the run-only names; the code's agreement with A3, A5 and A6 is the store review's section 8 (its rows 3, 5 and 6 answer "Yes").
- **Files read:** CLAUDE.md; `docs/claude-code-rules.md`; decisions 2026-11-26 and 2026-11-25 entries from the top to "COPY-H's RULES FIX-CHECKED" (lines 1–522; a search of the whole file for "queued" and "last touch" shows no queued item below them); the rules at HEAD in full; the store review, the engine plan (section 16) and the rules fix-check (its method); the rules review's D3, D4, D5 and D12; `design.ts`, `chains.ts`, `normalize.ts`, `schema.ts`, `scan.ts` (the line reading), `merge.ts` (the repeats) and the rules test, at `2e48130`/`7be16bf`; in the supervisor's folder, my brief and progress, COPYH-RULES-2's `brief.md` and `progress.md`, COPYH-ENGINE's `progress.md` (section 16) and COPYH-REPRO's `progress.md` (lines 196–326, the cut E evidence), and `verify\VERIFY.lock` (held by COPYH-STORE-FIX while I wrote).
- **Not done:** no data opened, nothing run of the project's code, no test; the rules test's green is COPYH-RULES-2's three `pnpm verify` runs (exit 0, 1,066 tests + 6 skipped), not mine.
