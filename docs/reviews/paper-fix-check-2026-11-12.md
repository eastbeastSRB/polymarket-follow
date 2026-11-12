# PAPER-FIX-CHECK — the second read of the paper experiment's fixes, before the freeze

PAPER-FIX-CHECK (Sonnet 5.5, max, fresh; not the builder, not either first
reviewer), 2026-11-12 19:08Z – 19:58Z (UTC, every stamp from `date -u`), for
polymarket-follow's supervisor. Under check: PAPER-BUILD's 14 commits
`1d720b7` … `65faa05` (the diff `6704cb3..65faa05`: 33 files, +2,670 −873)
against the two reports `docs/reviews/paper-rules-review-2026-11-12.md` and
`docs/reviews/paper-code-review-2026-11-12.md`. Since `65faa05` the repository
moved by three commits that change docs only (`19b852f`, `a7166f9`,
`4d3cdfe`; the last two are decisions about the favourites list); HEAD is
`4d3cdfe`, and no code, tool or lockfile differs from `65faa05`. **A review
decides nothing;** the supervisor and the owner answer. Evidence: the
supervisor folder `workers/PAPER-FIX-CHECK/` (`progress.md`, `scripts/`,
`out/`).

**The limits held.** Nothing stamped at or after 2026-11-07T00:00Z was read;
I never opened the collector's recordings, database or run folder, never ran
`paper.js` against real data or real paths, made no API call, deployed and
registered nothing and did not touch Task Scheduler (the `.ps1` scripts were
only parsed; the deploy's gate command was run on scratch copies). Every
build, test run and deliberate break was done in scratch copies of the
repository under the scratchpad; the repository itself was only read until
this report. PAPER-BUILD's, PAPER-RULES-REVIEW's and PAPER-CODE-REVIEW's
folders were read only; no agent was started; polymarket-lab was not touched.
**One deviation, disclosed:** `pnpm verify` run in a scratch copy that had no
installed packages first ran `pnpm install` by itself (pnpm's check before a
run) and fetched 64 lockfile-pinned dev packages from the npm registry into a
new pnpm store on C: — not a Polymarket call, nothing in the repository or its
`node_modules` touched (checked), but I had not meant to download anything.
One scratch output (`out/fav-cases.txt`) shows a holdout account's address in
a refusal message; it came from the kit's `population.json` in the scratch
copy, and no holdout data was opened.

## For the owner, in one page

*Words.* A **look** is one of the three dates (19 December, 6 February, 8 May)
on which the test gives its verdict. The **freeze** locks the rules and the
program by a fingerprint; after it a mistake can only be put right by a new
list. The **draft list** is the fingerprint written ahead of time to check it.
A **deliberate break** (a mutant) is a small change I made on purpose to the
code in a scratch copy, to see whether a test notices.

**Verdict: not yet, because of four small things that change locked text or
the check you run before locking.** Everything the two reviews asked for is
in; the fixes changed no number in the made-up world I ran before and after,
added no way to trade and no way to read a day the gate keeps shut. But the
fixes themselves left four slips, and the cheap moment to mend them is now:

1. **The page can print words your own page rule forbids.** The rules say the
   page never shows "follow, copy, signal, edge, skill". The fix that puts the
   look's verdict on the page also puts the look-3 sentence there, "no edge as
   large as X bps a copy was seen" (two banned words); and the new fee alarm
   says "their copies are priced…". The rules contradict themselves at look 3
   (R12 gives the sentence, R15 bans its words), and the page test never
   renders either sentence. (N1)
2. **Two sentences in `rules.md` no longer say what the program does.** R17
   still gives the collector's burst as 30 (it is 15 now), and R15 says the
   verdict box is "the verdict line and its sentence, nothing else", while the
   page also prints "Look k (date): the main line" and "Next look …". (N3, N4)
3. **One test now fails by itself when the disk is busy.** The new flush to
   disk before each save makes one test take 4–5 s of its 5 s limit in a full
   run, and it timed out in every one of three runs with some background disk
   work. `pnpm verify` — which the freeze and the deploy both require — can go
   red for no real reason. A longer time limit on that one test cures it. (N2)

Each is a few lines and one commit; then a new draft list and a short read of
the changed lines by the supervisor, not a new full review. If you would
rather freeze now, the wording ones (1 and 2) can be accepted as they are
(the page would show those words only in two rare cases) — but the first one
means the frozen rules contradict each other, and mending it later costs a
new list.

**What is in order.** All 39 findings of the two reviews: 34 are fixed (5 of
them in part, the part left out being sound), 5 are skipped for sound reasons,
none is open. `pnpm verify` is green in my own copy (35 files, 280 tests).
The draft list is exactly what a fresh build gives: 60 of 60 files, and the
freeze tool, run in my copy, wrote the same body. The collector is equal
apart from its burst (15 in 5 s): the one changed line and its two changed
tests hold. The task script can register the paper task without touching the
collector's three (read from its syntax tree). The freeze tool refuses a
dirty tree and a bad favourites list, and the deploy's gate check accepts the
frozen copy and refuses a changed one (both run on scratch copies). The same
made-up world run through the code before and after the fixes gives
byte-identical daily logs of every copy. The builder's claim "49 of 50
deliberate breaks caught" holds: I re-ran all 50 against the whole suite.

**What I would still like pinned by a test** (none of it decides a number; the
tests are outside the frozen scope, so they can be added after the freeze):
the two conditions under which a look waits are each masked by the other in
the test; the stop at 1,000 rejected rows; and about 25 prints and edge
values (N5).

*This is research, not advice on what to trade.*

## Verdict

**NOT YET, BECAUSE** (a) R12's look-3 sentence and the fee alarm put words on
the page that R15 bans, and R12 and R15 contradict each other there (N1); (b)
`rules.md` R17 and R15 disagree with the program (N3, N4); (c) the flushed
write made one test fragile, so `pnpm verify` can fail with no code fault
(N2). All four are small, none touches a number or the blind, and one commit
mends them. **After that commit, with a new draft list and `pnpm verify`
green, my verdict is "ready to freeze"** — nothing else I found needs to
change first.

Counts: **39 findings (20 + 19): 34 fixed (5 of them in part), 5 skipped and
sound, 0 open.** New findings: 2 medium (N1, N2), 5 low (N3–N7).

## New findings, by severity

| # | Sev. | Where | Finding | Fix |
|---|---|---|---|---|
| N1 | medium | `summary.ts` `lookReport` (sentence), `daily.ts` `feeAlarm`, R12, R15 | **The page can carry words R15 bans.** R15: "Never on the page: … the words follow, copy, signal, edge, skill (a test reads its text)"; the repository's page test bans the stems follow, copy, copies, signal, edge, skill. The page-verdict fix (`567c135`) now prints the latest look's MAIN sentence, and R12 fixes look 3's as "no edge as large as m + z·SE was seen": the code writes `no edge as large as 1085.0 bps a copy was seen` — words `edge` and `copy` (`out/page-words.txt`: a page with look 3 "too few to tell" contains both). The new fee alarm (`05f665d`) says "their copies are priced at the kit's rate" — `copies`. A failed-backup line (new) carries an error text whose paths contain `polymarket-follow`. The page test renders a page with no verdict and no alarm, so it cannot see any of these. R12 and R15 contradict each other at look 3. | Reword the look-3 sentence in R12 and `summary.ts` (for example "no gain as large as X bps a position was seen") and the alarm in `daily.ts`; or exempt R12's sentence in R15; a test that renders the page with every sentence and alarm that can reach it and scans for the stems. Recommended: reword. |
| N2 | medium (process) | `store.ts` `writeAtomic` (fsync, `efdc8aa`), `test/paper-loop.test.ts` | **The flush makes one test timing-fragile.** "pauses at the night window…" takes 2.99 s alone with the flush (1.44 s without), 3.9–4.9 s (median about 4.3 s) in 12 clean full-suite runs, against vitest's 5 s limit. With four background writers doing fsync it timed out in 3 of 3 full runs (9.5 s, 28 s, 28 s); without the flush, same load, it passed 2 of 2 (3.2–3.9 s). Twice in my 115 mutation runs a failure in this test also showed up that the mutation could not explain. `deploy.ps1` and the freeze procedure both run `pnpm verify`, so a red run blocks them for no code reason. | An explicit timeout on that test (`{ timeout: 30_000 }`), test-only, outside the frozen scope. |
| N3 | low | `experiment/rules.md` R17 | R17: "120 … and 15 in any 5 s beside the collector's 50 and 30 (170 of the 250 allowed)". The collector's burst is 15 since `7adf1d5`. The docs sweep does not cover `apps/poller/experiment/` (outside `docs/`), which is how it slipped through (N7). | "…beside the collector's 50 and 15 (30 in 5 s together)". |
| N4 | low | R15, `daily.ts` `pageData`; R14, `summary.ts` | R15: the box shows, at and after a look, "R12's verdict line and its sentence, nothing else". The page prints "Look k (date): the main line V. <sentence>" and, unless V is KEEP or DROP, " Next look <date>." (the form is in the decisions entry, not in the rules). Likewise R14 words the gross's lower bound as a sentence ("positions of this line would have paid at any round trip below X bps"); the look prints only the number, under `breakEvenRoundTrip` (older than the fixes). | Word R15 as the page prints it, and R14 as "named `breakEvenRoundTrip`" (or print the sentence). |
| N5 | low | tests | **Pins missing on things the fixes added or changed.** 65 breaks of my own (31 caught, 1 invalid, 33 pass; 4 of those are no-ops or equivalent, so 29 are real gaps). Nearest to deciding: each of the look's two wait conditions (`unread` and `missingDays` in `ready`, R16) alone; the use of the 1,000-rejected-row stop (`loop.ts:193`; the guard pins the constant 1_000, not the stop); the schema alarm's edges (exactly 10 rows; exactly 1%). Prints and edges: `splitEvents` and `feeAlarm` in a look's result; split days clipped at the first record; JUMP's edge at 3; the map's null case; the t band's error (two-way against day clusters, Q6) and df; `afterTheVerdict` naming the first decisive look; "Next look" after a DROP; a string `instrument_id`; the gap copy's hole edges; a competition's first and last instant, and a competition from before the cut; "data through"; the drawdown and copies a week; the break-even side; the fee alarm's scope (the primary markets, not every kit market); a rejected row with no usable instant (lost with `parseFillRows`). In each case the code reads right. | Pin when convenient — before or after the freeze (tests are outside the frozen scope). The two wait conditions and the 1,000-row stop first. |
| N6 | low | R1, `paper-freeze.cjs`, `checkFavourites` | The tool checks the cut ≤ F0 ≤ its own instant, so an F0 earlier than the freeze by any span passes, and R1's "the instant, to the second, at which `--final` is run" cannot hold literally (`favourites.txt` is committed first). | Record F0 and `--final`'s instant in the freeze entry and compare them; optionally a one-line age limit (say 24 h) in the `.cjs` (outside the frozen scope). |
| N7 | low | CLAUDE.md "docs sweep" | The sweep lists `docs/*.md` and CLAUDE.md; `experiment/rules.md` holds numbers and behaviours too (N3, N4). | Add it to the sweep. |

Also noticed, not from the fixes (no action needed): `look()`'s wait check
goes through the pool accounts only, while R16 says the list includes the
favourites outside the pool (they are read every day anyway; a failed read
shows as a gap); PAPER-BUILD's progress note says "32 of 50 before the guards"
where its own result files show 23.

## The finding-by-finding table

`R-` is PAPER-RULES-REVIEW's numbering, `C-` PAPER-CODE-REVIEW's. "Pin" names
the test; "partial" means a part of the fix is not pinned (see N5). A fix is
"in part" where PAPER-BUILD skipped a half with a reason I judge sound.

| # | Sev. | Finding (short) | Fixed in | Pin | Status |
|---|---|---|---|---|---|
| R-H1 | high | `look()` untested and not injectable | `1d720b7` `look()` takes `daily()`'s `io` | `paper-look.test.ts`: the look end to end (no freeze 4; before its Monday 5; once; waits, then a forced run lists the unread; MAIN's figures equal the 12-19 log; after the verdict); the builder's ten breaks of `look.ts` and `summary.ts` all caught | Fixed; pin partial (N5: each wait condition alone) |
| R-M1 | med | Student-t band always 0 | `1d720b7` tCritical(2·normalUpper(z), days−1)·SE_day | `paper-look` "prints the band…": 2.97 / 2.48 / 2.19 at df 41 / 90 / 181 | Fixed; pin partial (SE choice and df±1 not pinned; a print that decides nothing) |
| R-M2 | med | page never shows the verdict | `567c135` latest look's MAIN verdict and sentence, next look = first not run | `paper-look` (box before and after look 1, escaped, next look); `paper-daily` | Fixed; see N1, N4 |
| R-M3 | med | holdout favourite accepted | `0b74a9a` refused by the freeze tool and by a run | `paper-daily` "the favourites…"; my breaks of both checks caught | Fixed |
| R-M4 | med | lines at the looks not printed | `9e70b98` `besideLines` in each look's result; only MAIN has a verdict | `paper-look` "prints the lines beside MAIN…" (exact figures per line, no verdict word); removing `beside` caught | Fixed; pin partial (JUMP's edge at 3, `splitEvents`/`feeAlarm` prints) |
| R-M5 | med | split rule dropped | `e7235da` (and `05f665d`) | `paper-score` "a split" (parse, a day after the entry, the entry's day, another market, id-less event on crypto and on equity), `paper-guards` (day edges); my 7 edge cases behave as ruled (`out/split-edges.txt`) | Fixed; pin partial (clip at the first record; a string id) |
| R-L1 | low | "follow" on the page | `efdc8aa` | `paper-look` "never says 'follow' on the page" | Fixed; but see N1 |
| R-L2 | low | R1: a look runs "after that day's run" | `efdc8aa` (R1 wording) | the look's timing is pinned in `paper-look` | Fixed |
| R-L3 | low | a look uses fills after END | `ffa192f` | `paper-look` "reads nothing after its END" (fails without the fix; the break caught) | Fixed |
| R-L4 | low | F0 not tied to the freeze; `--final` overwrites, no parse | `0b74a9a`, `9538d66`, `efdc8aa` | `checkFavourites` in `paper-daily`; the tool itself is outside vitest: I ran it in a scratch copy (refuses no file, untracked or modified tree; accepts a valid list) | Fixed; residual N6 |
| R-L5 | low | R6: settlement's own day | `efdc8aa` (R6 wording) | `paper-score` "leaves a settled market out from its settlement's day"; my break caught | Fixed |
| R-L6 | low | R0: a fix is a new list; Monday cache | `efdc8aa` (R0 wording) | wording | Fixed |
| R-L7 | low | R3: `adl`, `settlement` booleans | `efdc8aa` (R3 wording) | wording; the code is unchanged | Fixed |
| R-L8 | low | R12: SE cannot be computed | `efdc8aa` (R12 wording) | `paper-stats` (null error → TOO FEW) | Fixed |
| R-L9 | low | R15: entry price; F16 (e) | `efdc8aa` (R14, R15 wording) | the entry price as wired: `paper-guards`; the builder's break (spread left out) caught | Fixed |
| R-L10 | low | a failed list read leaves P | skipped: the reviewer said none needed | — | Skipped, sound |
| R-L11 | low | the builder's own numbers inside the frozen text | skipped: accept in the freeze entry | — | Skipped, sound — the freeze entry must say so |
| R-L12 | low | `gap` ignores an unread tail | `efdc8aa` (R11) | `paper-score` "flags as a gap a copy whose span was read only in part"; my break caught | Fixed |
| R-L13 | low | a missing fee category uncounted | `05f665d` alarm on the page and in each look | `paper-score` "names the primary markets' fee categories…"; the builder's break caught | Fixed; see N1 (its wording); pin partial (primary-only scope) |
| R-L14 | low | verdict word on every line | `9e70b98` | `paper-look` (TEN, BROAD, DAY, FAV: verdict and sentence null); my break caught | Fixed |
| C-H1 | high | t band always 0 | `1d720b7` (and Q6: the day clusters, as R14 says) | as R-M1 | Fixed |
| C-H2 | high | the look untested, no `io` | `1d720b7` | as R-H1; of the review's ten breaks eight are now caught (the drawdown flipped and copies a week over 30 days still pass) | Fixed; pin partial (N5) |
| C-M1 | med | a mistake in `favourites.txt` stops every run | `0b74a9a` lower-cased, each once, checked by the freeze tool | `paper-daily`; my 19 cases (`out/fav-cases.txt`) | Fixed |
| C-M2 | med | holdout favourite read and scored | `0b74a9a` | as R-M3 | Fixed |
| C-M3 | med | "Too early" after a look | `567c135` | as R-M2 | Fixed |
| C-M4 | med | nothing checks the freeze before the first run | `9538d66`: `--final` refuses a dirty tree; both lists hash a fresh build; the deploy runs the copy's own gate | outside vitest: I ran the tool (refusals, a `--final` of 61 files) and the deploy's gate line through its own `ProcessStartInfo` on scratch copies (`out/gate-cases.txt`) | Fixed |
| C-M5 | med | page written before the day's record | `567c135` record, manifest, backup, then the page; a failed backup and dropped raw replies named | `paper-daily` "writes the day's record before the page…"; my breaks caught | Fixed |
| C-M6 | med | 56 of 120 breaks pass | `7e442fd` (15 guard tests, literal values), `efdc8aa` | `paper-guards.test.ts`; I re-ran the builder's 50 breaks: 49 caught, 1 equivalent survivor; four sub-rows of the review's table are still unpinned (below) | Fixed; pin partial |
| C-L1 | low | dead code in the frozen scope | `6c9a96c` | lint, `tsc`; tests moved | Fixed |
| C-L2 | low | types for unused kit members | `6c9a96c` (competition module only) | — | Fixed in part; the rest sound: types leave no byte in `dist` |
| C-L3 | low | settings declared three times | skipped: each is checked at its own boundary | — | Skipped, sound |
| C-L4 | low | an unknown account costs three reads | skipped: the reviewer said accept | — | Skipped, sound |
| C-L5 | low | day as epoch ms; verdict on every line | `efdc8aa`, `9e70b98` | `paper-look` (key matches `YYYY-MM-DD`) | Fixed |
| C-L6 | low | facts written twice | `7adf1d5` (a test sums the callers' literal limits) | `rest-client.test.ts` "adds up to at most 250 a minute and 30 in 5 s…" | Fixed in part; the rest sound |
| C-L7 | low | names and size | skipped: the reviewer said "not now" | — | Skipped, sound |
| C-L8 | low | churn: the manifest repeats `state.json` | `efdc8aa` (last hash per path) | `paper-guards` "names each file once…" | Fixed in part; the second sort harmless |
| C-L9 | low | robustness: no flush; cast in re-parse; heartbeat under a long score | `efdc8aa` (flush) | not testable; side effect N2 | Fixed in part; re-parse (reads its own files) and heartbeat (task is IgnoreNew) skipped, sound |
| C-L10 | low | test hygiene | `1d720b7`, `efdc8aa` (`answer` unexported, literals) | — | Fixed in part |
| C-L11 | low | registering the paper task re-registers the collector's three | `9538d66` `-PaperOnly` | outside vitest: read from the script's syntax tree | Fixed |

**C-M6's table of breaks that passed, one by one** (the 15 rows plus the look's ten):
caught — the DROP edge, the scope entries, the lock's names, a 400 that is not
"account not found" and the dropped request, the breaker's reset, a week read
again, the standing hole saved at once, the backup by content and with the
looks, the panel's pin, the kit's fingerprint (and lib-exits'), STOP2/STOP5,
DAYS7, JUMP and the entry price as wired, the habit window and the Monday's
edge, the Monday cache, 21 favourites, the page's 500 rows and 36 h, the
collector's burst cap, the look's date gate, once-only, wait time, after the
verdict, the voted filter, the unpriced share, the mean d, each look's z.
**Still unpinned:** the *use* of the 1,000-row stop; a gap copy's hole edges
and a competition's first and last instant; "data through"; the look report's
drawdown (flipped) and copies a week (over 30 days). **Equivalent:** an entry
exactly at END (`scoreInput` already drops every fill at or after END; the
builder's one surviving break).

## The seven areas the brief named

1. **`look()`'s new `io`.** In production `io` is `{}`, so the package folder,
   the research folder, `fixedInputs` and the rule-book reader are the ones the
   look used before; `paper.ts` passes none. Order unchanged: freeze check
   (exit 4), once-only (5), the Monday (5), and only then the kit, the fixed
   inputs, the database read. The look and `daily()` now share one rule-book
   reader (`ruleBookOf`) and one reader of earlier verdicts (`looksDone`). A
   malformed `result.json` makes the next `daily()` stop before its record (a
   Zod error); the file is written by the program itself, so I count it as
   loud, not a fault. Fine.
2. **The split rule.** Read in full and run on 7 edge cases
   (`scripts/split-edges.mjs`): first-record clip; drop and re-list (two
   intervals); a malformed document in between (the listing is kept); the same
   event with its keys reordered (a new event, the days are the union); a
   string, a float or a missing `instrument_id` (every equity market out, the
   crypto untouched); a listing at 00:20Z covers that whole UTC day. As ruled.
   The category string is `equity` in the kit's rule book (39 of 91). One
   thing for the owner: if the API keeps old events in the list for ever, the
   market (or all equities) stays out for the rest of the test; the page's
   alarm says so.
3. **The look's END.** `scoreInput` keeps rows before END for a run and a
   look alike; the look's list of accounts to wait for is still built with the
   Monday's fills (so it can name an account that traded after END), which
   changes no number. The 12-19 log and the look at END₁ agree on the made-up
   world.
4. **The collector's burst.** Outside `src/paper`, `git diff` shows one line of
   behaviour: `burst: 15` in `COLLECTOR_LIMITS` (and the import it no longer
   needs). The largest route weight, 10, fits 15. The
   night test's peaks stay 49 and 12 (so 15 never binds in the passes). The
   restart tests' "at once" bound went from 5 s to 10 s; with the real client
   the first requests come at 900 ms (competitions), 900 ms (boards) and
   exactly 5,000 ms (the daily reads' splits, which wait one burst window
   behind the start-up reads), so 5 s could not hold and 10 s (two windows) is
   loose but fair. The admission test now expects 15 in 5 s (7 calls at 0,
   peak 14) and a new test sums the callers' literal limits (50 + 120 ≤ 250;
   15 + 15 ≤ 30). Equal apart from the burst: yes.
5. **`register-tasks.ps1 -PaperOnly`.** Parsed (0 errors) and walked as a
   syntax tree: outside the three guarded blocks the only calls are the paper
   task's `New-ScheduledTaskPrincipal/Trigger/SettingsSet/Action`, its
   `Register-ScheduledTask`, and read-only `Get-ScheduledTask` and
   `GetSecurityDescriptor`. The collector's three registrations, the poller's
   start and the grant sit inside `if (-not $PaperOnly)`. Not run.
6. **`paper-freeze.cjs --final`.** Run in a scratch copy with its own throwaway
   git repository: no `favourites.txt` → refused; an untracked file or a
   modified tracked file → refused ("the tree is not clean") before any build;
   a valid made-up list on a clean tree → 61 files written, the gate then says
   `ok 61`; a CRLF `favourites.txt`, a changed, missing or extra file in
   `dist/paper`, `research` or `experiment`, no list, an empty list → refused.
   `checkFavourites` over 19 cases: lower-casing, duplicates (also differing in
   case), 21 addresses, F0 before the cut / in the future, a holdout address
   (also pasted in capitals) — all as ruled. It does not notice a CRLF
   `favourites.txt` (it trims lines): the list would then hash the CRLF bytes
   and a later fresh clone (LF) would fail the gate, so `git ls-files --eol`
   must show `w/lf`, as the rules review said.
7. **The deploy's gate check.** The command line is copied from `deploy.ps1`
   into a script that builds the same `ProcessStartInfo` and runs it on the
   scratch copy: "ok 61" for the frozen copy, "changed: dist/paper/score.js"
   after one byte, and it works for a path with a space. The copy needs
   `dist/schedule.js` beside `dist/paper` (the gate imports it); `pnpm deploy`
   brings all of `dist`, so it has it. All five `.ps1` scripts: 0 parse errors,
   pure ASCII, LF.

## The draft freeze list

`experiment/FROZEN.draft.sha256` has SHA-256
`34df20ffddbda0b8818952f550506fb9d7f40885742779c3ce5753d71b039714` (the brief's
figure, confirmed). It lists 60 files: `dist/paper.js`, 22 files of
`dist/paper/`, 35 of `research/`, `rules.md` and `seed.sha256`. A build in my
scratch copy (a different folder; the lockfile's TypeScript 6.0.3) matches all
60 hashes, and `paper-freeze.cjs`, run there, wrote an identical body (only
the header's time and commit differ). It covers the scope the gate checks
(`FROZEN_SCOPE`); the shared modules the experiment imports (`rest-client.js`
and the rest) stay outside by design (R0) and are hashed for information in
each day's log. The 38 tracked files of `experiment/` and `research/` are
`i/lf w/lf`. It will be rewritten after the fix commit; the new list is checked
the same way.

## `pnpm verify`, the paper tests and the mutation check

- **`pnpm verify`** in the scratch copy of HEAD: build, lint, test (35 files,
  280 tests, 6 s), format:check — green. Flaky in one test (N2).
- **The builder's 50 breaks, all re-run** with a harness of my own that runs the
  whole suite for each and counts a kill only when a test fails (a crash does
  not count): **49 caught, 0 crashes, 1 survivor** — `score.ts` `g.t >= end` →
  `g.t > end`, equivalent as the builder says. Spot detail: DROP 10 → 11 is
  caught by the new guard (`DROP: m + z·SE below +10 bps, the edge exactly`);
  the split day's first instant by `paper-guards`; `burst: 15` → 16 by the
  rest-client test; the fee alarm removed by `paper-score`; the verdict not
  escaped by `paper-look`; the look's Monday by `paper-look`.
- **65 breaks of my own** on what the fixes added: 31 caught, 1 invalid, 33
  pass (N5). Among the 31 caught are the checks I most wanted: the freeze
  accepting an F0 before the cut or in the future, a run or the tool no longer
  refusing a holdout favourite, `scoreInput` keeping every stored fill, an
  id-less split taking every market, a copy open across a split day priced,
  the first record the latest, the collector's rule book counted from the cut
  again, an unread tail not a gap, the page saying "follow" again, the
  experiment's burst 16 and share 121.
- **A control:** a break that changes nothing (`false || …`) survives, and one
  that only changes a log word is caught — the harness discriminates.
- **Not re-run:** the code review's own 120 breaks (its harness is in its
  folder; the builder took up 50 that decide or are frozen, and those I re-ran),
  and the old-weeks reproduction (real pre-cut data; the brief forbids running
  it). I compared its two output files: equal line for line apart from the
  header, the times, the heap and the slot.

## Questions, each with my recommendation

1. **N1: reword, or exempt?** Reword R12's look-3 sentence and the fee alarm
   so the page never carries a banned word (recommended, three strings and one
   test), or add "except R12's sentence" to R15. *Recommendation: reword:* the
   ban is your page rule, and "no gain as large as X bps a position was seen"
   says the same.
2. **N2: a longer time limit on that one test, or drop the flush?**
   *Recommendation: the time limit* (test-only); the flush guards `state.json`
   against a power cut, which is its point.
3. **N3 and N4:** correct R17 and R15 to what the program does.
   *Recommendation: yes,* in the same commit.
4. **N6: F0.** Accept the procedure (F0 and `--final`'s instant both in the
   freeze entry), or add an age limit to the tool?
   *Recommendation: the procedure, plus the one-line limit in the `.cjs`.*
5. **N5: pins before or after the freeze?** *Recommendation: add the two wait
   conditions, the 1,000-row stop and the alarm's edges soon; the prints
   whenever convenient.* They need no new list.
6. **A second look from me after the fix commit?** *Recommendation: a short
   read of the changed lines by the supervisor is enough;* I am glad to re-read
   them.

## For the freeze day (additions to the reviews' list)

1. The fix commit (N1–N4, N2), `pnpm verify`, then the draft tool and the
   comparison with a clean build, as above.
2. `favourites.txt`: the 20 accounts of PAPER-FAV's list (decisions
   2026-11-12, `0f6991d1…`; none in the holdout, which the tool re-checks),
   written with the Write tool (LF), `git ls-files --eol` showing `w/lf`; F0 and
   the `--final` instant noted for the freeze entry (N6).
3. The freeze entry also says it accepts the builder's own numbers (R-L11).
4. `pnpm verify` on a clean tree (the whole repository must be clean: any
   untracked file of another worker stops `--final` and the deploy),
   `node tools/paper-freeze.cjs --final`, commit, tag `paper-freeze-1`, the
   list's SHA-256 and the tag in decisions, then the owner's deploy: its gate
   check should print `the copy's gate: 61 files as frozen`.

## Evidence

All in `workers/PAPER-FIX-CHECK/`: `progress.md` (the log, findings first);
`scripts/` — `mutate.cjs` (my harness), `extract-builder-mutants.cjs` and
`mutants-builder.cjs` (the builder's 50, copied verbatim), `mutants-mine.cjs`
and `mutants-mine2.cjs` (my 65), `fav-cases.mjs`, `gate-cases.mjs`,
`gate-quoting.ps1`, `ast-paperonly.ps1`, `split-edges.mjs`, `page-words.mjs`,
`diff-run.test.ts` (the old/new differential run), `burn.cjs` and
`diskburn.cjs` (the load for N2); `out/` — `mutate-builder.txt`,
`mutate-mine.txt`, `mutate-mine2.txt`, `fav-cases.txt`, `gate-cases.txt`,
`gate-quoting.txt`, `ast-paperonly.txt`, `split-edges.txt`, `page-words.txt`,
`diff-run.txt`, `n2-timing.txt`. Every script ran on made-up data or on a
scratch copy of the repository; nothing wrote to the repository but this
report.
