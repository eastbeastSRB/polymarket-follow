# COPYH-RULES-FIXCHECK — the fresh check that COPY-H's rules review was applied exactly

COPYH-RULES-FIXCHECK (Sonnet 5.5, max, fresh; the rules' writer was Opus 5.5, their reviewer Fable 5.2), 2026-11-25 21:42Z – 22:12Z (every stamp from `date -u`), for polymarket-follow's supervisor. It checks that `apps/poller/copyh/rules.md` at `9fee674` (SHA-256 `47bd169a…3b64`, 1,480 lines; unchanged at HEAD `6457a6c`) carries every fix of the rules review (`docs/reviews/copyh-rules-review-2026-11-25.md`, `4588143`) and every ruling since: the supervisor's on the review's questions 3–10 (decisions `d8cd4a1`), the owner's on RM3 and RM4, both option (a) (`60e694f`), and the supervisor's item of 21:32Z (C0 names `dist/polish/tables.js` beside `dist/polish/lz4.js`); that nothing else changed; and that the rules are ready to freeze with the code. **A review decides nothing:** the supervisor rules on it. It changes no rule and writes no code. Line numbers are the rules' at `9fee674`.

**The limits held.** Read only. Nothing on F: was opened, nothing was fetched, no program of the project was run, no agent was started, polymarket-lab was not touched, `rules.md` was not edited. Besides git, I ran eight small scripts of my own on the text (section 9), all in my scratchpad. In the supervisor's folder I opened my brief, my own `progress.md` and COPYH-RULES' `progress.md`. I read, never changed, some committed code where a rule names it (the kit's `panel.mjs`, `nulls.mjs`, `returns.mjs`; `src/polish/gates.ts` and `tables.ts`; `src/paper/copy.ts` and `stats.ts` by name; `src/waveh/keys.ts`; the three freeze lists by name; WAVE-H's rules for one anchor), and the head of `src/copyh/range.ts` and `design.ts`, which another worker is editing: I did not touch them.

**The bar** was fixed before I read the text (the brief's six points), and is the one used below: (1) every item present and exact; (2) nothing else changed; (3) the four declared changes of form judged; (4) markers; (5) consistency; (6) the guards.

## For the owner, in one page

**Verdict: ready after these fixes.** One medium finding and eight small wording ones. All are text: none touches a number, a bar, a design or a guard. They belong before the rehearsal first runs on real months, because from then on the file changes only in its set values (RM8).

**What is solid**

- **Every item is in.** I checked 61 items from the text, one by one: 48 carry the review's words letter for letter (a tag such as "(RH1 (c))" apart), 12 say the same in other words with the meaning whole, and 1 lacks two words of a reference (RL1). The three alternatives that were not taken (RM3 (b) and RM4 (b), which you did not choose, and the optional FIND-3 anchor of RM6) are absent.
- **Nothing else changed.** The fix round touched only `rules.md` (four commits). Its 43 hunks all trace to an item or to a consequence of one; no hunk changes a rule without a source. Seven small hunks have no wording in the review; each is listed (F8) with my view.
- **No open marker.** None of the draft's thirteen open questions is left. Six `[SET BEFORE THE FREEZE` marks stand, all for the two values that were ruled to wait for the rehearsal (the settlement mark, the worker heap); the seventh occurrence of the text is C17's own sentence, which is not a marker by its own definition.
- **The numbers agree.** All 61 rows of C18 equal what the text says; EXITS_MAX is 20,000,000 in all four places; the 15 sample days equal the analyzer's own list in the code; every cross-reference resolves.
- **The guards hold.** Nothing is priced before the freeze but one hash; FRESH-2 stays unseen until a yes needs it; no month that chooses also judges.

**What must change, in plain words**

1. **The tripwire's count and a delisted coin's last minute (medium, F1).** The new rule prices a copy still open at a delisting at the Settlement price. The tripwire still says a minute has a price only if the coin traded in it, so it would count such a copy as unpriced although the pricing prices it. Two short clauses (exact wording in F1) make the two agree.
2. **Eight small wording fixes (low, F2–F9):** a reference, a list that misses an item (the output's identity, the exit-5 stops, one number of C18), one sentence of C3 that C9 now contradicts in words, a test pin for the new marker definition, the hunks with no source, and one print.

**Questions** (section 8, each with a recommendation): whether the look should also print how many `settled` copies have no edge-over-the-market reading (recommended: yes, a print only), and the count of entries left out because their coin's Settlement came on their own day (recommended: yes, a print only); then when the fixes go in, and one note for the store's builder.

**Next.** COPYH-RULES applies F1–F9 as one small commit, about 20 lines of text; then the rules are ready to freeze with the code. **When:** before the rehearsal's first run on real months; F1 above all, since the rehearsal's count sets the settlement mark.

---

## 1. Every item, from the text (the bar's 1)

I read each item's wording in the review and found it in the rules. COPYH-RULES' `progress.md` holds no table for the fix round (only its last block), so this table is built from the text. **E** = the review's words, a tag or a full stop apart; **M** = other words, meaning whole; **P** = part is missing. Counts: 61 items; **48 E, 12 M, 1 P**.

Wordings were also compared by machine. Of the review's 34 blockquoted wordings: 4 are identical whole; 25 differ only by a tag the writer appended after them, or by where the tag stands; 2 are identical on inspection (RL8's choice sentence, which the script split at a line-start ">", and RL10's seven rows, which stand in C18's table); and 3 differ in words: RM1's confirmation (its heading's colon), RM8's head (declared, section 3) and D14 (one gloss inserted, F8). The review's inline quoted wordings (the "Wording:" quotes) were compared the same way: 56 are in the rules as quoted; of the others, the script's hits were the old text the review replaces, a tag after the quote, a quote mark of another kind, or a quote cut at a line start, each read by eye, apart from three real differences: RL1's last two words (F2), RM4's "the share of the set" for "the share of MAIN's set", and RM6's "the 5-minute rule" after a comma (both M in the table).

| Item | Where in the rules (at `9fee674`) | |
|---|---|---|
| RH1 (a) the tripwire's two outcomes | C16 l.1367–1376; C15 step 2 l.1319–1320; step 1 l.1287–1288 | E |
| RH1 (b) EXITS_MAX = 20,000,000 | C4 l.467–484, 493–494; C15 (c) 5 l.1215–1219; C13 l.902–904; C18 l.1432 | E |
| RH1 (c) the heap a ceiling | C15 l.1103–1121 (`COPYH_HEAP_GB` in the settings, l.1120) | E |
| RH1 (d) a day over the failure limit | C3 l.280–284 | E |
| RH1 (e) a funding file that fails | C9 l.677–691 (RM5's wording) | E |
| RH1 (f) a taker out of order | C9 l.646–651 (D8's wording) | E |
| RH1 (g) an hour the archive lacks | C14 term 1 l.1046–1049 | E |
| C17's "any other stop" sentence | C17 l.1405–1409 | E |
| RM1 a filter's verdicts | C14 l.989–1014 (confirmation), 1015–1023 (sealed judgment), 1090–1093 (tests) | E |
| RM2 lists by content | C0 l.165–184; gate l.121–131; step 1 l.1259–1260; step 2 l.1306–1309; C14 l.945, 983–988, 1061–1066; C17 l.1404–1405. No "freeze 1/2/3" and no fixed list number is left (the first list's own tag, l.83, is n = 1) | E |
| RM3 (a) no filter by side | C14 l.959–964; C13 l.891–893; tests l.1087–1089 | E |
| RM4 (a) copies open at a delisting | C3 l.414–416; C6 l.544–548; C8 l.610–618; C9 l.663–666; C11 l.759–760; C13 l.894–895; C16 l.1358–1359 | M (C16: "the share of the set", for each set the stop projects) |
| RM5 the funding | C9 l.672–691; C14 l.1055–1057; C18 l.1425 | E |
| RM6 known answers | C15 (a) l.1146–1172 | M (C9's test, l.714–716: "…before the kit's cut, the 5-minute rule (RM6)" for "(the 5-minute rule)") |
| RM7 FRESH-2's seal and stage | C0 seal 4 l.145–150; C14 term 4 l.1067–1076 | E |
| RM8 the file closes | C15 (c) head l.1188–1195 (declared); item 4 l.1209–1214 | M |
| RL1 a reference | C1 l.221 reads "(WAVE-H's rules, H1)": RL1 asks "(WAVE-H's rules, H1, DATA END)" | P (F2) |
| RL2 "R…" | intro l.4–5, 20–23; C4 l.462–463; C13 l.874–877; C18 l.1416; C7 l.565–567 | M (C7: the one phrase is spread over the rows, each with its own function) |
| RL3 the 60-minute mark | C9 l.696–699; C16 l.1355–1357 | E |
| RL4 the label check's denominator | C15 (c) 7 l.1225–1231 | E |
| RL5 a coin `meta` lacks | C3 l.352–357 | E |
| RL6 three covariates | C14 l.951–956 | E |
| RL7 files named, written | C0 l.105–108; C15 (c) 10 l.1244–1245; C3 l.341–344 | E |
| RL8 C12's and C14's cases | C12 l.803–805, 816–817, 833–837; C14 l.973–976 | E |
| RL9 the smallest edge | C13 l.877–879 | E |
| RL10 C18's rows, the marker check | seven rows: l.1426, 1428, 1433, 1445, 1457, 1462, 1472; C17 l.1399–1402 | M (C17's sentence, declared) |
| RL11 three clarities | C1 l.208; C3 l.340–341; C15 (c) 1 l.1198–1200 | E |
| RL12 the closure's date | C0 l.86–88 | E |
| RL13 "at most half" | C9 l.674–677 | E |
| D1 closedPnl cut before the parse | C3 l.296–302; test l.431–433 | E |
| D2 the switch hour's duplicate | C3 l.310–317; test l.448–450 | E |
| D3 chains by `startPosition` | C3 l.358–369; test l.437–438 | E |
| D4 the head read with the account | C3 l.358–369 | E |
| D5 15 digits, shortest text | C3 l.288–291, 376–381, 403–405 | E |
| D6 the pass's order | C3 l.405–408 (inside the bullet, before the partition sentence) | E |
| D7 no minute shared | C1 l.221–227; C3 l.419 | E |
| D8 the pairs' guard | C9 l.646–651 | E |
| D9 exit 3 and parts | C15 l.1122–1130, 1134–1136 | E |
| D10 the heap before the rehearsal | C15 l.1103–1106 | E |
| D11 the sample days | C15 l.1277–1280, 1311–1314; C18 l.1479–1480 | E |
| D12 matching events with more than one chain | C15 (c) 1 l.1196–1199; step 1 l.1279–1286 | E |
| D13 `instants.ts` | C1 l.234–238 | E |
| D14 the closure named whole | C0 l.85–100 | M (one gloss added, F8) |
| D15 seal 5 | C0 l.151–164 | E |
| Section 5, wording 19 (`dirs.json`) | C3 l.318–320 | E |
| Section 5, wording 20 (`szDecimals`) | C3 l.340–341 | E |
| Section 3, Q6 (the vault taker) | C3 l.389–396; its marker is gone | E |
| Section 3, Q7 (RANK's ties) | C7 l.571 | E |
| Section 6, S1 (a try is data) | C14 l.936–948; tests l.1085–1089 | E |
| Section 6, S3 (the books' half) | C13 l.908–917; C15 (c) 11 l.1248–1250 | M |
| Ruling Q3 (EXITS_MAX) | C4 l.475–484; C18 l.1432 | E |
| Ruling Q4 (tries as data) | C14 l.936–948 | E |
| Ruling Q5 (d in the known answers) | C15 (a) l.1165–1172 | E |
| Ruling Q6 (all 15 sample days) | C18 l.1479–1480; C15 l.1277–1280 | E |
| Ruling Q7 (the kit's own panel) | C15 (a) l.1154–1157; settings l.1118–1119 | M (the writer's words; `loadMarket` exists in the kit and holds each panel file to its pinned hash) |
| Ruling Q8 (the fix-check computes the ratio; the file closes) | C15 (c) l.1188–1195, 1209–1214 | M |
| Ruling Q9 (the `burnin` line) | C15 l.1131–1133 | M (the writer's words) |
| Ruling Q10 (books only if the reader serves it) | C13 l.913–916; C15 (c) 11 l.1248–1250 | M |
| Owner's RM3 (a) | as RM3 | E |
| Owner's RM4 (a) | as RM4 | M |
| The `tables.js` item (21:32Z) | C0 l.93–94 | E |

**Not applied, as ruled:** RM3 (b) and RM4 (b) (the owner chose (a); neither wording appears, probed), and RM6's last sentence, FIND-3's 1,086 as a further anchor "if its script is at hand", which the supervisor's Q5 ruling does not carry.

**The draft's thirteen open questions** were each settled as the review and the rulings say, and every marker is gone: Q1 by EXITS_MAX (C4, C18); Q2 by RH1 (c) and D10 (C15); Q3 the whole capture, no second bound (C15 (c) 7); Q4 the engine's guard (C15); Q5 "eight whole buckets of the 256" (C15 (c) 7); Q6 "Net Child Vaults" (C3); Q7 RANK's ties (C7); Q8 RM1 (C14); Q9 the closure at COPY-H's freeze commit (C0, RL12); Q10 1,700 at D = 0 (C15 (a)); Q11 the owner's yes, unchanged (C14 term 2); Q12 `coins.json` (C3, RL5, RL7); Q13 D11 (C18).

## 2. Nothing else changed (the bar's 2)

`git diff fa52406 9fee674 -- apps/poller/copyh/rules.md`: 43 hunks, 1,396 lines, read whole. The four commits touch only `rules.md`. Hunk by hunk (lines are the new file's):

| # | Lines | Section | Traces to |
|---|---|---|---|
| 1 | 2–35 | intro | RL2; the round's status and sources (F8); the marker sentence (F8) |
| 2 | 84–134 | C0 closure, files, gate | D14, RL12, `tables.js`; RL7; RM2; draft Q9 |
| 3 | 143–192 | C0 seals, after the freeze, identity | RM7; D15; RM2; RL7 (the identity line, by consequence) |
| 4 | 205–211 | C1 table | RL11 |
| 5 | 218–241 | C1 | D7, RL1; D13 |
| 6 | 277–305 | C3 stops, boundary | RH1 (d); D5; D1 |
| 7 | 309–330 | C3 kept, `dirs.json` | D2; item 19; Q6 |
| 8 | 335–372 | C3 `coins.json`, chain heads | draft Q12; RL5, RL7, RL11; item 20; D3, D4 |
| 9 | 375–384 | C3 normalized | D5 |
| 10 | 387–422 | C3 market trades, store | Q6; D5, D6; RM4 (the bars); D7 |
| 11 | 429–454 | C3 tests | D1, D5, D3, Q6, D2 |
| 12 | 459–487 | C4 | RL2; RH1 (b) |
| 13 | 490–497 | C4 test | RH1 (b) |
| 14 | 541–558 | C6 | RM4 (a) |
| 15 | 562–574 | C7 | RL2; Q7 (section 3) |
| 16 | 607–625 | C8 | RM4 (a) |
| 17 | 642–654 | C9 spread | D8, RH1 (f) |
| 18 | 660–703 | C9 object, funding, settlement mark | RM4; RM5, RH1 (e), RL13; RL3; the colon (F8) |
| 19 | 711–721 | C9 tests | RM6; RM4 |
| 20 | 757–763 | C11 | RM4 |
| 21–23 | 801–808, 813–820, 831–840 | C12 | RL8 (empty sets; every case; last sentence) |
| 24 | 871–882 | C13 | RL2 (the e-value); RL9 |
| 25 | 889–898 | C13 | RM3 (a); RM4 (the `settled` print) |
| 26 | 900–920 | C13 | RH1 (b) (the print); RL7; Q10 |
| 27 | 934–967 | C14 explore | S1 (Q4); RL6; RM3 (a) |
| 28 | 971–1026 | C14 choice, freeze, confirmation, seal | RL8; RM2 and S1; RM1 |
| 29 | 1043–1079 | C14 FRESH-2 | RH1 (g); RM5; RM2; RM7 |
| 30 | 1083–1099 | C14 tests | RM1; RM3; S1 |
| 31 | 1102–1139 | C15 program, parts, `burnin`, exit codes | RH1 (c), D10, Q7; D9; Q9 |
| 32 | 1144–1175 | C15 (a) | RM6; Q5; Q7 |
| 33 | 1186–1236 | C15 (c) | RM8 (Q8); D12, RL11; the marker joined; RH1 (b); RL4, Q3, Q5 |
| 34 | 1241–1264 | C15 (c) 10–11, step 1's gate | RL7, Q10; whitespace only; RM2 |
| 35 | 1275–1291 | C15 step 1 | D11, D12; RH1 (a) |
| 36 | 1295–1323 | C15 guard, step 2 | draft Q4; RM2; D11; RH1 (a) |
| 37–38 | 1343–1350, 1353–1379 | C16 | RH1 (a); RL3; RM4 |
| 39 | 1385–1419 | C16 tests, C17, C18's intro | RM4, RH1 (a); RL10, RM2, RH1; RL2 |
| 40–43 | 1422–1480 | C18 | RM5, RL10, RH1 (b), RL9 (the `504` of the smallest-edge row goes with its formula), D11 |

**Hunks with no source** (the bar asks for each, whatever its size): F8 lists the seven. None changes a rule, a number or a bar; I grade them low. Every other changed line is the review's wording, a consequence of it (a test line, a print, a cross-reference), or one of the four declared changes.

## 3. The four declared changes of form (the bar's 3)

1. **RM8's head and C17's marker sentence, reworded so the file does not hold the marker its own check refuses.** *Meaning kept; needed.* RM8's "its `[SET BEFORE THE FREEZE]` values" (the review's text) is, by C17's own definition, a marker (`[SET BEFORE THE FREEZE` followed by `]`); written literally it would make the frozen file refuse itself. "Its set-before-the-freeze values" (l.1191) says the same. C17's sentence (l.1399–1402) keeps RL10's rule (the tool refuses a file that holds an open marker) and adds what counts as one: the first text followed by `:` or `]`, the second by a digit. A plain substring check, as the review's wording reads, would trip on the sentence's own two quotes. Two notes. The definition binds the tool, so its test should pin it (F7). And the change is wider than the supervisor's entry says: COPYH-RULES also reworded the intro's marker sentence (its own `progress.md` says so) and put a colon into C9's marker (l.692, "[SET BEFORE THE FREEZE: by C16's count…"), because without the colon the C9 marker would not be one under the new definition and could pass the check unset. Both are needed and keep the meaning; the colon is in neither declaration (F8).
2. **C15 (c) 3's marker joined onto one line.** *Meaning kept; needed.* The draft broke it over a line ("[SET BEFORE THE" / "FREEZE]"), which a line-based check does not see. With it joined, the whitespace-collapsed count of `[SET BEFORE THE FREEZE` (7) equals the line-level count (7).
3. **D2 kept to the switch hour's two files.** *Meaning kept; needed; and not a departure from the review.* The rules carry D2's wording letter for letter (C3 l.310–317), and that wording is the scope the review itself recommends ("the rule's scope, the switch hour's two files: the stop can then fire only in E, before the freeze, and RH1 gains no eighth case"). What differs is the store's working code, which drops a duplicate wherever it stands (review section 5, item 22). The code must follow the rule: outside the switch hour a repeated record is two records the archive wrote, kept twice, with no stop.
4. **RM3 (b) and RM4 (b) not applied.** *Correct.* The owner chose (a) for both. Neither (b) wording is in the file (probed: "long share of 1", "own Settlement fill", "0.05%", "waits for the owner": 0 hits).

## 4. Markers (the bar's 4)

- **`[OPEN Q` followed by a digit: none.** The only `[OPEN` is in C17's sentence (l.1400), followed by a backtick. The draft had twelve such markers and two more inside brackets ("OPEN Q1", "OPEN Q2"): all gone.
- **`[SET BEFORE THE FREEZE` followed by `:` or `]`: six, all for the two named values.** l.692 (C9's settlement mark), l.1103 (C15's worker heap), l.1206 (C15 (c) 3, which sets the settlement mark), l.1237 (C15 (c) 9, which sets the heap), l.1449 and l.1471 (C18's two rows).
- **C17's own sentence** holds the text twice, each followed by a backtick: by its definition, not a marker. Whitespace-collapsed, the file holds 7 occurrences of `[SET BEFORE THE FREEZE` (six markers and C17's quote) and 1 of `[OPEN` (C17's quote); none is split over a line.
- The draft held 11 occurrences of `[SET BEFORE THE FREEZE` (one of them split over a line); four went with the intro's marker sentence and with EVENTS_MAX (C4, C15 (c) 5, C18), and C17's quote was rewritten.

## 5. Consistency (the bar's 5)

**RM4's `settled` copies across the sections.** C3's bars hold the Settlement records' Σ sz and Σ px·sz (l.414–416); C6 ends a coin's object at the end of the Settlement's minute, mark = Σ px·sz ÷ Σ sz (l.544–548); C8 plans the copy to the coin's end, marks it at the end's last millisecond, flags it `settled`, prints MAIN with and without (l.610–618); C9's object runs to the same minute with the same mark (l.663–666); C11 prices, flags and counts it (l.759–760); C13 prints it (l.894–895); C16 counts it, never unpriced (l.1358–1359, test l.1388). All agree on: where it closes, at what price, that it is priced, flagged, counted and printed with and without. **One disagreement: C16's exactness sentence (F1).** One residue that is no contradiction: a copy with a `settled` flag whose Settlement falls within 24 h of its follow instant has no d (the kit's `leg` returns null with no mark at t + D + 24 h, C10, C11), so it is in m but not in m′ (question 1).

**RH1's outcomes across C3, C9, C14, C15, C16 and C17.** (a) C16 l.1367–1376 gives the two outcomes; C15 step 1 item 5, step 2 item 4 and C14 term 4 point to it; the exit is 6 in all (C15's exit list names the tripwire). (b) EXITS_MAX is a count, not a stop: the account is left out and named (C4, C13, C15 (c) 5, C18). (c) C15 l.1105–1121. (d) C3 l.280–284. (e) C9 l.688–691, with C17 for a changed file. (f) C9 l.646–651. (g) C14 l.1046–1049. Every stop with no outcome of its own falls under C17's two outcomes (l.1405–1409). The new exit-5 stops (a duplicate market taker in the switch hour, a taker out of order across files, a funding file the reader does not pass) are each worded "(exit 5)" where they arise, but C15's exit-5 list does not name them (F6).

**EXITS_MAX** is 20,000,000 in C4 (l.476), C15 (c) 5 (l.1216), C13 (l.903) and C18 (l.1432: 20000000); EVENTS_MAX is gone. **C18**: all 61 rows read against the text, each equals its mentions; the `stops` row (0.02 0.05) is carried by the names STOP2 and STOP5. C18 lacks one number the text fixes (a run's 14 minutes, F4). **Cross-references:** the 159 lines the round added or changed that name a C-number, a step, an item or a finding were each read against their target; every one resolves (C15 (c) items 1, 4, 6, 7, 10, 11; C15 (a) and (b); C16; C18).

## 6. The guards (the bar's 6)

- **No outcome is computed before the freeze.** The rehearsal's counts (C15 (c) 1–11) are counts of instants, sizes, labels, memberships, exit rows and Settlement instants, or two prices of one moment; the new counts (the matching events with more than one chain, each coin's first Settlement and the trades and entries after it, the exit rows) are no outcome. The one priced computation is item 10's, in memory, whose only output is a SHA-256 with counts by line and legs by source (l.1238–1247); the rewrite changed only where its hash is compared (`copyh/rehearsal.json`). Item 4's ratio uses entries and exits alone. RM4 prices a settled copy only at a step.
- **FRESH-2 stays unseen.** Seal 4 (l.145–150) opens it only for the `fresh2` command under a verified FRESH-2 freeze; the stage's first term waits for step 2's report and the owner's yes (l.1043–1049, 1059–1060); the funding for its hours is fetched then, not before; the "end there" outcomes keep its months sealed (C16).
- **No month that chooses also judges.** Unchanged and intact: MAIN is judged on E and on E ∪ S, a KEEP is confirmed on FRESH-2 alone; a try is explored on E, confirmed on S alone, judged on FRESH-2 alone; the side is no longer a covariate, since S's direction is public (l.959–964). The freeze tool reads S's funding files for shape and times only (RM5), not S's fills and no rate; seal 3 speaks of S's raw store.
- **After the rehearsal's first real run the file is closed** to all but its set values (l.1188–1195), so the fixes below are to be made before it.

## 7. Findings, by severity, each with its exact new wording

### High

None.

### Medium

**F1. C16's count is not exact for a delisted coin's last minute (C16 l.1348–1351, 1364–1366, 1388–1389; against C6, C8, C9).**

- **What.** RM4 gives the Settlement's minute a mark without a market trade (C6, C9: the Settlement price). A `settled` copy's last leg is at its coin's end − 1 ms, in that minute, and is priced (C8; C16's own item 3 says "never unpriced"). C16's item 1 counts as unpriced every leg instant whose coin had no market trade in the 6 minutes up to its minute end, "an open or crossing copy's END − 1 ms among them"; and the closing sentence says the count is exact "since a minute has a mark exactly when it has a market trade (C9)". For a settled copy on a coin that was quiet in its last minutes, the count says unpriced and the pricing says priced. The tripwire would then over-count by those copies (a conservative error), and the test written beside it ("the projection equal to the copies the pricing then finds unpriced by reasons 1–2") would fail on a made-up quiet coin. The review's own wording for RM4 created the gap; the fix round applied it exactly.
- **Exact new wording.** Item 1 of C16 becomes:

> 1. the follow instants and every leg's instant (an open or crossing copy's END − 1 ms among them, but not a `settled` copy's last leg, at its coin's end − 1 ms, whose mark is the Settlement price: C6, C8) whose coin has no market trade in the 6 minutes up to the instant's minute end (the minute that holds the instant and the 5 before it: the kit's staleness);

and the sentence after the list becomes:

> It is exact for those reasons, since a minute has a mark exactly when it has a market trade, or is its coin's Settlement minute (C9; C6).

and in C16's test list, "a `settled` copy counted and never unpriced" becomes "a `settled` copy on a coin quiet for its last six minutes counted and never unpriced".

### Low

**F2. RL1's reference lacks two words (C1 l.221).** RL1 asks "(WAVE-H's rules, H1, DATA END)": WAVE-H's rules hold the sentence in H1 under DATA END (`waveh/rules.md` l.78–79). The review's D7 wording, which the rules took for the whole bullet, cites "(WAVE-H's rules, H1)"; the two wordings of the review differ. *Wording:* "**A fill file holds its writer's hour** (WAVE-H's rules, H1, DATA END), so a fill timed…".

**F3. C0's identity list does not name the heap that C15 puts "in every output's identity" (C0 l.185–191; C15 l.1111–1112).** *Wording,* end of C0's identity bullet: "…the shared files' hashes; the worker heap in GB (C15); Node's version."

**F4. C18 lacks the run's 14 minutes (C15 l.1123–1125; C18 l.1469).** The text fixes two numbers, "14 minutes are spent" and "ends inside 15"; C18 holds the 15. The code derives the 14 as one minute less (`design.ts`). *Wording,* a row after `part minutes`: `| run minutes | 14 |`.

**F5. C3 says `--data` opens no data file; C9 now has it read funding files (C3 l.266–268; C9 l.678–686).** `data.sha256` is written from the two lists alone, but the same command writes `funding.sha256` after a reader check on the funding window files, S's among them (RM5). *Wording,* C3: "…from WAVE-H's and FRESH's lists alone, no fill file opened; the same command reads the funding files' shape, C9)".

**F6. C15's exit-5 list does not name the new exit-5 stops (C15 l.1137–1140).** *Wording:* "5 not ready (sealed; a listed file missing, differing or failing to decode; a day over the record-failure limit; a `dir` or coin outside its list; an earlier step's file differing from its hash; a funding file the reader does not pass (C9); a duplicate market taker in the switch hour (C3); a taker out of time order across two files (C9); already run)".

**F7. The new marker definition has no test pin (C0 l.112–114, C17 l.1399–1402).** The definition binds the freeze tool. *Wording,* C0's test list: "(a closure file differing from its own freeze's line refused; each later list's allowed differences, below and C14, and any other refused; a file holding a marker refused, and C17's own sentence not taken for one)".

**F8. Hunks with no source in the review or the rulings.** The brief grades such a hunk medium; none of these seven changes a rule, a number or a bar (they are bookkeeping, form, a gloss, a pointer, whitespace and one ordering claim), so I grade them low, and the supervisor may regrade. For each, my view.

| # | Where | What | View |
|---|---|---|---|
| a | intro l.6–8, 12–17 | the status ("drafted, reviewed fresh and fixed") and the fix round's own sources | needed bookkeeping; keep |
| b | intro l.27–31 | the marker sentence reworded (the literal `[SET BEFORE THE FREEZE: …]` and `[OPEN Qn]` would be hits of the freeze check) | needed by RL10 and C17's definition; in COPYH-RULES' own note, not in the supervisor's four; keep |
| c | C9 l.692 | a colon after FREEZE in the settlement mark's marker | needed (see section 3, item 1); in neither declaration; keep and declare |
| d | C0 l.94 | "(the analyzer's column codecs, the store's table format)" for D14's "(the store's table format)" | accurate (`src/polish/tables.ts` is the analyzer's tables and their columns, with `bytesOf` and `valuesOf`); keep, or cut four words to equal D14 |
| e | C3 l.292–293 | the first boundary bullet lost "(`JSON.parse`'s `context.source`; code-rules, PAPER-BUILD)"; D1's second bullet keeps `context.source` | the pointer is gone. *Wording,* l.300–301: "…is read from its digits (`context.source`; code-rules, PAPER-BUILD)" |
| f | C15 l.1255–1258 | the rehearsal store's "sealed" paragraph reflowed | whitespace only; keep |
| g | C15 l.1131–1133 | Q9's line says the `burnin` run is "before the rehearsal" (the review: "a timing run on the five weeks that judge nothing"; `range.ts`: "the counts and timing run outside E and S") | the order is plausible and unsourced; keep, or cut "before the rehearsal" |

The consequence hunks (a test line, a print, the identity line's two files, the `504` leaving C18, C13's calibration clauses reordered so that "only if" attaches to the books' half, C16's "each set the stop below projects") trace to RL7, RL9, Q10 and RH1 (a) and are not listed again.

**F9. The `settled` print could say how many of them have no d (C13 l.894–895).** A settled copy whose Settlement comes within 24 h of its follow instant has no d (kit `leg`), so it leaves m′ (question 1). *Wording,* a print only: "**The `settled` copies** (C8; RM4): their count, how many of them have no d (a Settlement less than 24 h after the follow instant leaves d null, C10, C11), and MAIN with and without them."

**Shared with the review, no action needed.** D14's "(`keyDate`, the one parser of a key's date)" stands after `dist/waveh/instants.js`; the function is in `keys.js`, which imports `instants.js`.

## 8. Questions, each with a recommendation

1. **For the supervisor (the owner if he wants): should m′ be cleaned of the delisting survivorship too?** RM4 (a) values a settled copy in m. Where its Settlement falls within 24 h of its follow instant it has no d, so it is still absent from m′. *Recommended: print only* (F9), because both bounds must hold for KEEP and for DROP, and the print shows the size. Valuing d at the Settlement would change the null's 24 h window, which is a rule change.
2. **For the supervisor: print the entries left out by C6's rule 2?** An entry whose coin has a Settlement by the end of its own UTC day is "not primary" and priced in no line (C6 l.537–543, kept as the review says: "stays as it is"). C6 says such entries are "counted apart", but C13's prints do not name them. They are the extreme case of RM4's concern. *Recommended: yes,* one phrase in C13's `settled` bullet: "and MAIN's entries left out because their coin's Settlement came by the end of their day".
3. **For the supervisor: when are these fixes made?** *Recommended:* as one small commit by COPYH-RULES before the rehearsal's first run on real months (RM8's closure), no later. F1 in particular: the rehearsal's C16 count on all of E sets C9's settlement mark (C15 (c) 3), and F1 changes what that count counts for a settled copy; made after the count is seen, it would be a change made on a count, which RM8 forbids. No second full check is needed: the supervisor can read the diff against the wordings above (about 20 lines).
4. **For the store's builder (not a question about the rules):** D2's scope (the switch hour's two files) and D8's guard are the rules' words; `merge.ts` drops a repeated record wherever it stands. The review's section 5 item 22 already says so.

## 9. What I read, and what I did not

- **In full:** my brief; CLAUDE.md (the session's copy); `docs/claude-code-rules.md`; the rules review (1,091 lines); decisions 2026-11-25 (`d8cd4a1`, `60e694f` and the entry that records the fix round); `copyh/rules.md` at `9fee674` (1,480 lines) and its diff from `fa52406` (1,396 lines); COPYH-RULES' `progress.md`.
- **In part, for facts a rule names:** the kit's `panel.mjs` (`loadMarket`, the pinned hash, `markAtMinuteEnd`), `nulls.mjs` (`dAgainstNull`), `returns.mjs` (`leg`); `src/polish/gates.ts` (the 15 sample days) and `tables.ts`; `src/paper/copy.ts` and `stats.ts` (the five named functions exist); `src/waveh/keys.ts`; the three freeze lists (the eleven closure files are in their lists); `waveh/rules.md` (DATA END); the plan's headings (section 11); the head of `src/copyh/range.ts` and `design.ts`; `docs/reviews/README.md`.
- **Not opened:** any data; the supervisor's other files; the plan and its review beyond what the rules cite; the store's working code beyond those two heads.
- **What this limits.** I judged the text, not the code that is not yet built: whether the builders' code does what a rule says is the code review's. My reading that F1 is a real inexactness rests on C9's and C6's wording (the Settlement minute's mark is the Settlement price) and on the kit's `markAtMinuteEnd`; no run of the pricing was made.

**My scripts** (scratchpad `…\scratchpad\COPYH-RULES-FIXCHECK\`; none reads data; SHA-256 first and last 8 hex):

| Script | What | SHA-256 |
|---|---|---|
| `quotes.mjs` | each blockquoted wording of the review against the rules (whitespace collapsed) | `f0e445ed…00a3a078` |
| `worddiff.mjs` | a word-level diff of the four blocks that were not whole-identical | `58fcc8cc…e49f890d` |
| `inline.mjs` | each inline quoted wording of sections 1, 4 and 5 against the rules | `ee938341…66ef9a2d` |
| `markers.mjs` | the marker scan, line and whitespace-collapsed, old and new; the (b) probes | `49a00a25…470481a2` |
| `refs.mjs` | the cross-references on every added or changed line | `dad4187c…e19b57c1` |
| `lines.mjs` | each item's line in the rules | `0b81f742…bcfe8474` |
| `nums.mjs` | numbers of the body that C18 does not hold | `eb9ea82d…87289866` |
| `count.mjs` | the status cells of section 1's table: 61 rows, 48 E, 12 M, 1 P | `2eed3bb2…781dbc0f` |

The two versions of the rules and their diff, written to the scratchpad with `git show` and `git diff`: `f4067942…661100ae` (`fa52406`), `47bd169a…2d3b3b64` (`9fee674`) and the diff `698fc458…e20cf364`.
