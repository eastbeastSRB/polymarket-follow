# PAPER-PLAN-REVIEW — the fresh review of the paper experiment's plan, before the owner approves it

PAPER-PLAN-REVIEW (Sonnet 5.5, max, a different model from the plan's), 2026-11-12
11:37Z – 12:20Z (UTC; every stamp from `date -u`), for polymarket-follow's
supervisor. The plan under review is `docs/reviews/paper-plan-2026-11-12.md`
(`55e3387`, `91b31bb`), written against decisions 2026-11-12, "APPROACH-REVIEW
accepted" and "the paper experiment runs daily and gets a page". Evidence: the
supervisor folder `workers/PAPER-PLAN-REVIEW/` (`progress.md`, `scripts/`,
`out/`; paths below are relative to it). **A review decides nothing:** the
supervisor and the owner answer; the plan was not edited.

**The blind store held.** Nothing stamped at or after 2026-11-07T00:00:00Z was
read. The collector's recordings, database and run folder were never opened;
no call was made to Polymarket's API. PAPER-PLAN's folder was read only (its
`kit/`, `inputs/`, scripts and outputs; its transcript once, by a search for
where one claim came from, F5). Outside what the brief lists I looked at names
and sizes only (not contents) of `F:\polymarket-follow-research\` and its
`KIT\panel`. Web: the venues' own pages (Finotive's rules, terms and help
article 955; Binance's fee and funding FAQs and an Academy page), one press
article, pnpm's `deploy` page, and two generic searches; no project or personal
name was in any request. No agent was started; polymarket-lab was not touched.

## For the owner, in one page

*Words.* A **token** is the unit the API counts its rate limit in (a read costs
2, 5 or 10). A **copy** is the paper position a follower would have opened
about 80 seconds after a trader. A **hole** is a stretch of a trader's trades
we could not read. The **freeze** is the moment the rules are locked by a
fingerprint, before anyone reads the weeks after 7 November. A **bp** is 0.01%.

**Verdict: the plan may be approved after the fixes named below.** It is a good
plan. It does what you and the supervisor decided, its rules are nearly exact
enough to freeze, and its everyday cost comes out the same when I rebuild it:
6,110 tokens and 51 minutes on a normal day, 38,170 and 5.3 hours on a Monday
(ending 09:18Z), 170 of our 250 a minute together with the collector. Nothing
needs a redesign. What is wrong sits in details that cannot be changed after
the freeze, so they must be written into the rules, and the build's checks,
first.

**What is in order.**
- All seven rulings of 2026-11-12 and the daily-run-with-a-page decision are in
  the plan. It adds three lines "beside" (the order-book price, the
  notional-board accounts, the competition's days) that come from the research
  report you accepted, and it asks you about the two things it added itself
  (favourites from the freeze, the first verdict ends the test).
- The statistics are right: 2.81, 2.43 and 2.17 are the limits for 0.5%, 1.5%
  and 3% (I computed 2.807, 2.432, 2.170), and keep, drop and too few to tell
  are defined exactly, apart from one corner case (F16).
- Nothing after 7 November was read, and part 4 of the build (the check on the
  old weeks) uses only weeks before it.
- Finotive's ban on copying other people's trades is quoted word for word, and
  I confirmed it on its own help article and in its terms.

**What must change first** (details in "Findings"):
1. **The first run is three different things in the plan.** Read literally it
   would cost roughly three times what is stated (an estimate from R6: about
   324,000 tokens and 45 hours, not 113,000 and 16 hours), and another reading
   would silently leave out our busiest real traders for the whole backlog. It
   must be written as the same weekly loop as every other run (F1).
2. **Days that were not read must not count as quiet days,** and a look must
   not run on an unfinished read (F2). One API change must not be able to
   throw every trader out for a month (F3).
3. **What is locked must be what runs.** The plan locks the source files, but
   the program runs from the compiled copy; and the reason it gives for one
   locking rule (that the toolbox files have Windows line endings) is wrong:
   they have none (F4, F5).
4. **The blind needs a guard in the code, not only in people** (F6), and the
   two dated checks D1 and D2 must wait for the freeze (F7).
5. **Test the new data reader on days we already know** before it touches a
   new day (F8), and write down how the run behaves when it is stopped,
   overlaps another, or meets the night pause (F9, F11).
6. **Two venue facts.** The plan says Binance lists no stocks; it does (F12).
   For Finotive, whose terms bar this kind of copying, I recommend printing the
   rule and the cost facts and no "what it would have earned" line (F13).

**Yours to decide** (full list at the end; each with my recommendation):
Finotive (no result line); D1/D2 after the freeze; whether the two heaviest
"beside" lines (maker entries and order-book price) may be dropped from this
freeze if they are not ready, so that they never delay the main test (yes).
I agree with the plan's other recommendations.

*This is research, not advice on what to trade.*

---

## Verdict

**MAY BE APPROVED AFTER THE FIXES NAMED:** F1 (high) and F2 to F14 (medium) are
additions to the rules text (`rules.md`, built from section 1 at part 5) and to
the build's parts and checks. F15 to F18 are low. None changes the design, the
data, the statistic or the budget of a normal day. The plan is dated evidence
and is not edited: the fixes travel in the owner's yes (a decisions entry),
into the build brief and into `rules.md`.

## Findings by severity

| F | Sev. | Where in the plan | Finding | Fix |
|---|---|---|---|---|
| F1 | **high** | §1 R3 (sweep cap), §2 "The gap", §3 table "The first run", Q10 | The first run has three readings and its figure fits one: literal about 324,000 tokens (45 h, an estimate), c3's 112,803 (15.7 h), day by day 144,501 (20.1 h) | One loop for first run, missed days and Mondays; formula for the figure; resumable |
| F2 | med. | R3 "Covered", R5, R16, §9 | A window is "covered" although the days are unread (a failed read); a look has no precondition | `P` in "covered"; a look waits or lists a hole |
| F3 | med. | R3 (rejected row = hole, "never read later"), §9 | One changed field type holes every account for 2 to 5 Mondays | Alarm above a reject share; re-parse the kept raw after a recorded fix |
| F4 | med. | R0, §6, Part 5 | The freeze hashes `src/paper/**`; the run copy holds `dist/`; shared modules, Node, zod, lockfile, line-ending basis, the path of `rules.md` unsaid | Hash what runs; keep data rules inside `src/paper/`; log the toolchain; tag the freeze |
| F5 | med. | §6 "CRLF", Part 0, §9 | The kit's files are LF (0 CR bytes); the "CRLF (checked)" rests on counts that equal each file's line count | Keep `-text` as a guard; correct the reason; check on a fresh clone; list the real hazards |
| F6 | med. | §6 header of "The parts", Part 6 | The blind rests on discipline and an after-the-fact scan | Code guard: no window at or after CUT before a valid freeze |
| F7 | med. | §8 D1, D2 | D1 and D2 read post-cut fills, probably before the freeze | Both after the freeze; give them a share |
| F8 | med. | §2, Parts 1 and 2 | The new market-day pull and fills reader are tested on fake replies only | Two blind-safe checks on pre-cut days against the kit's panel and the seed |
| F9 | med. | R6, R8, extensions table, Part 4 | The vendored `planCopy` hard-wires the cut and prices a post-cut copy with silent wrong numbers; `inPrimaryCell` throws on a new market | Re-implement with END; never call the vendored one; tests with END not equal to CUT |
| F10 | med. | R3 (seed), R9, §2 | The pre-cut panel (hard-coded `F:` path, 31 MB) and the seed live outside the repository, the freeze and the backup | Copy into the experiment's folder, verify by manifest, back up |
| F11 | med. | §3, §6, §9 | No lock, no own log, state not atomic or checkpointed, `paused` not handled, task limits, deploy smoke, daily compute, 429 retry | A short list of rules and checks (below) |
| F12 | med. | §4 Binance column, one-pager | "No stocks found" is wrong; funding "8 hours" is not universal | Correct; read the instrument list for every category |
| F13 | med. | One-pager "venues", §4, Q7 | A Finotive result line and a long account-rules row read as a way to use an account its terms bar | Rule first; no result line; shorten the row |
| F14 | med. | R13, R7 | MAKER, STOP, JUMP, VWAP formulas incomplete; three lines beyond the rulings; heaviest code is the least needed | Complete or separate: a freeze that does not wait for them |
| F15 | low | §3, Q3, C1 | Number labels and sources (728, 341, burst 12, "two Mondays", habit coverage) | Correct in `rules.md` and the budget text |
| F16 | low | R12, R14, R16, Part 7 | Missing precedence, formulas of prints, bound on unpriced, second look | One line each |
| F17 | low | R15, §5 | Page words, tense, caption, colours, size | Listed below |
| F18 | low | R12, R16, §4 | "5% in all" is two-sided; venue numbers fixed after the freeze; small wording | Listed below |

### F1 (high) The first run is not one rule, and its figure fits only one reading

Where: §2 "The gap … is filled from the API's history, exactly as every later
day: the first run reads, for every pool account, `fills` over [CUT, END) in one
paged read, and for every market `mark-history`, `klines` and `funding` day by
day"; R3 puts the 10-page cap only on "the Monday sweep"; §3 table "The first
run | 112,803 | 15.7 h"; `PAPER-PLAN/scripts/c3-budget.mjs`.

Finding. (a) Read literally, the first run has no cap. If the 182 accounts the
classifier calls algorithm or market maker trade at the median pace R6 measured
for machine-tempo accounts (695 fills a day, p90 4,257; R6 counted 84 such
accounts, so this is an estimate and not a measurement of these 182), that is
about 146 pages each in three weeks and, with the rest unchanged, **about
324,000 tokens, 45 hours at 120 a minute** (`out/r1`, 3b). (b) The 112,803
comes from c3, which charges the cap per account and per week (182 × 10 × 3
calls) and the market data in weekly windows (92.6 tokens a market-week, the
kit's own pull). (c) §2 pulls the market
data day by day: 30 tokens a market-day, 90 markets, 21 days = 56,700, not
25,002; so even with c3's cap the first run is **144,501 tokens, 20.1 h** (21
days), **187,934 and 26.1 h** at 28 days, **231,368 and 32.1 h** at 35; a run
started at 04:00Z meets the night pause 02:35Z after 22.6 h. (d) One cap per
read, the third reading, would hole a busy directional trader (p99 204 fills a
day, about 4,300 in three weeks) for the whole backlog, although every later
week reads such an account without a cap (it is on the list): the first weeks
would hold a different sample from the rest.

Fix. Write the first run as the same loop as every other run: from the first
Monday after CUT, week by week; each week's list comes from the labels at its
Monday; **list accounts are read without a cap, every other account with the
sweep's cap per account-week**; the market data in windows the build names. The
same rule then serves a missed day, a missed Monday and the first run. State the
cost by formula (fills calls × 10 + market-days × 2,700, or the weekly-window
form) with the real freeze date, and let Q10 be ruled knowing 16 to 26 hours.
Make the run resumable: when the client says `paused` (F11), on a stop or a
crash the run ends cleanly and the next start continues from each account's
`P`; the 04:00Z task does it by itself.

### F2 (medium) A window is "covered" although its days are unread

Where: R3 "Covered: a window [a, b) … when no hole … meets it and either a ≥ CUT,
or the seed is not truncated, or …"; R3 "A failed or rejected read leaves P where
it was"; R5; R11 "gap copy"; R16; §9 row 1.

Finding. A failed read leaves `P` behind **and records no hole**, so the account's
unread days read as quiet days: a directional trader's label becomes "no
fills", its entries are missing; a copy whose exit is unread stays "open". The
next days' reads repair it, but nothing prevents a look from running on such
accounts (R16 excuses only "a run that crashes"; part 7 checks the hash). A
standing 400 "account not found" (an unregistered favourite) would be retried
for ever.

Fix. Add `P ≥ b` to "covered" (after the Monday sweep every account has
`P ≥ M`, so a label at M is covered when its read finished). A look runs only
when every account on a list and every account with an open copy has
`P ≥ END_k`, every other account has `P` at or after the latest Monday before
`END_k`, and every market-day through `END_k` is present; otherwise it waits (a
stated number of days at most) or lists the account as a hole from `P` to `END_k`
and says so on its first page. A 400 "account not found" is recorded once as a
standing hole.

### F3 (medium) A rejected row is a permanent hole, and one API change would make them for everyone

Where: R3 "A failing row is dropped and counted, and its account-day becomes a
hole" and holes "recorded with its bounds, never read later"; §9 "API changes".

Finding. If a field's type changes, every row fails its schema, every account-day
becomes a hole, and every account is uncovered for two Mondays (labels, 14 days)
to five (habits, 30 days). The raw replies are kept, so a fix could repair it,
but holes are never read again.

Fix. (a) A bound: when the share of rejected rows in a run is above a stated
level (suggest 1%), the run writes no new holes and does not move `P`; it ends
as "schema alarm", and the page shows it. (b) A hole made by a rejected row may
be closed by re-parsing the kept raw replies after a code-defect fix recorded in
decisions (R0). The sweep's cap holes stay as written.

### F4 (medium) What is frozen is not what runs

Where: R0 "Frozen together … `apps/poller/src/paper/**` …", "Every run starts by
checking them"; §6 "Where the code lives"; Part 5; §2 "What the experiment
writes".

Finding. (i) The run copy holds `dist/`, not `src/`: `pnpm deploy` ships what
`pnpm pack` would, here `files: ["dist"]` (pnpm's `deploy` page, read today). A
literal build refuses to start at its first task run, which part 4's rehearsal
(from the repository) cannot show. (ii) The paper imports the collector's
client, schemas, `Recorder`, schedule, clock and logger; none is frozen, yet the
client decides which fills are read. Freezing them would block the collector's
own fixes (the User-Agent, the `consistent` flag); not freezing them lets a
collector fix change the experiment silently. (iii) Node (the `context.source`
parse was tested on 24.13), zod, TypeScript and the lockfile are neither pinned
nor logged. (iv) The path of `rules.md`, how the run copy gets it, and the
line-ending basis of `rules.md` and `FROZEN.sha256` are not said (the index and
the working tree are LF). (v) The freeze is a hash in decisions, not a commit.

Fix. Hash what runs: the compiled `dist/paper/**` (deterministic for the pinned
TypeScript), the vendored `research/`, `rules.md`, the favourites list and the
seed's manifest, all copied by the deploy. Keep every data-affecting rule
(windows, paging, parse, holes, dedupe, the rule book's use) inside
`src/paper/**`; call the shared client plumbing (admission, User-Agent, back-off)
and say so; each day's log lists the hashes of the shared files it ran with and
Node, zod, TypeScript versions and the lockfile hash (information, not a stop).
Name the path of `rules.md`; hash LF blobs (`git show HEAD:path`). Tag the freeze
commit (`paper-freeze-1`) and record the commit id with the hash.

### F5 (medium) The kit's files are LF, not CRLF; `-text` is right for another reason

Where: §6 "`research/kit/` … `.gitattributes` needs `apps/poller/research/** -text`:
the kit's files have CRLF line endings (checked 2026-11-12)"; Part 0; §9 row "The
vendored code is altered by git"; and the closing message's list for code-rules.

Finding. **All 34 files of PAPER-PLAN's `kit/` and its `lib-exits.mjs` hold 0 CR
bytes** (`out/r2`); the kit's own `checkKit()` returns the pinned fingerprint
`2d3667b5…09aa` on that copy, whose files are unchanged since 10:52Z
(`out/r3`). The plan's "CRLF" rests on counts that equal each file's number of
lines, not on CR bytes (its transcript shows `entries.mjs CR=169`,
`returns.mjs CR=56`, `classifier.mjs CR=247`, `rulebook.json CR=827`; those files
have 169, 56, 247 and 827 LF and no CR byte). With `* text=auto eol=lf` (and `core.autocrlf=true` on this PC)
the files would already be stored and checked out as they are. So `-text` is
right but only as a guard: it ends all conversion, whatever the user's git
settings say; it must stand on a line after `* text=auto eol=lf`. The builder
must not "restore" CRLF, and code-rules must not record the false reason.

What else could break the hashes: Prettier `--write` (`pnpm format`) on the
`.mjs` and `.json` files unless `.prettierignore` names `apps/poller/research`
(vitest's `include` is `test/**/*.test.ts`, eslint's rules apply to `**/*.ts`,
tsc includes `src` and `test`: those three already ignore the kit); a copy
through PowerShell text cmdlets (BOM, line ends) instead of a byte copy, in the
vendoring and in the deploy (`pnpm deploy` does not ship `research/`; the plan's
`deploy.ps1` copy must be a byte copy); an extra file in the kit's folder
(`checkKit()` rejects any file not listed: `desktop.ini`, `Thumbs.db`, an editor's
backup); an editor with format-on-save opened on a kit file. (The order of
`git add` and the attribute no longer matters for LF files; it would for a file
with CR bytes.)

Fix. Restate the premise and keep `-text`. Part 0's check: on a fresh clone into
a temporary folder `checkKit()` returns the pinned fingerprint and lib-exits
its hash; `git ls-files --eol` shows `i/lf w/lf attr/-text` for every file under
`research/`; `pnpm format` leaves `git status` clean; the kit's own
`node --test` passes in the vendored copy.

### F6 (medium) The blind has no guard in the code

Where: §6, the sentence "no part reads anything after the cut before part 5's
freeze"; Part 6 "the supervisor's access scan".

Finding. The plan itself is blind (checked: part 4 asks END = CUT of the kit's
data, FIND-6-EXITS's, X3's, FIND-3's and the 26 Mondays, all before the cut;
the plan's own ten API calls ended before it, asserted in the script). But
nothing in the new code stops a development run, a `rehearse` with a wrong
flag or a probe from asking a window at or after CUT. The kit has such guards
(`BlindStoreError` in `fills.mjs` and `panel.mjs`), and the new code replaces
the kit's readers.

Fix. The paper's fetch layer refuses any window or day at or after CUT unless
`FROZEN.sha256` exists and verifies; the seed builder keeps the kit's refusal
of a row at or after CUT; `rehearse` is a test (or refuses END above CUT); each
has a test that fails when the guard is deleted (code-rules, "Tests").

### F7 (medium) D1 and D2 are post-cut reads

Where: §8.

Finding. D1 reads the 100 holdout accounts' fills for 2026-11-07 to 11-21, D2 five
of R8's accounts for weeks to 11-30. The plan's own example freezes about three
weeks after the cut (11-28), after D1's date. They are not pool accounts, but
their fills show the prices and moves of the unseen weeks, and the brief's rule
is "nothing after the cut is read before the freeze, by anyone". Their reads
also have no share in the budget (170 of 250 leaves 80).

Fix. D1 and D2 run after the freeze (they were "after 11-21" and "after 11-30"
anyway); say so, and give each brief its share of the remaining 80 a minute and
a quiet hour.

### F8 (medium) The new readers are tested on fake replies only

Where: §2 "the same routes, intervals and end rule as the kit's panel, so the
yardstick is the same"; Parts 1 and 2.

Finding. The daily market-day pull (mark-history "a bucket comes only if it ends by
then", klines "day's end − 1 ms", funding filed by nominal hour) is new code;
part 2 compares the object built from files with `marketFrom`, not the pull.
The fills reader is checked on fake replies; the probe saw no id above 2^53,
so `context.source` has run on synthetic text only (I checked it in Node 24.13:
exact, 0.6 ms a 100-row page, `out/r4`; "1e3" or "10.0" would fail the digits
rule and become a hole).

Fix. Add to part 2 two checks that are blind-safe, because their windows end
before the cut: (a) pull one or two pre-cut UTC days for all markets with the
paper's code (2,700 tokens a day) and compare every row and the built object
with the kit's panel; (b) read one pre-cut week of about 20 accounts (about 30
calls), among them the account FIND-REVIEW-6 F4 found with ids above 2^53, and
compare with the seed fill for fill.

### F9 (medium) lib-exits' `planCopy` cannot be used past the cut, and fails silently

Where: R8 "FIND-6-EXITS's `planCopy`, with END in place of CUT"; R0 (lib-exits
byte-identical); the extensions table, last row; Part 4.

Finding. `planCopy` in the frozen file tests `x.t + D >= CUT` and marks at
`CUT_MARK_T = CUT − 1`. For an entry after the cut every exit is flagged
`crossing` and the copy is marked at an instant before it entered: run on a
synthetic copy entered 1 h after the cut it returns one leg of h = −3,680,001 ms
ending at 2026-11-06T23:59:59.999Z, 1 h 1 min before the follow instant
(`out/r6`). With a market object that extends past the cut the kit's `leg` then
returns finite, wrong numbers, not an error. Part 4 runs at END = CUT, where
both versions agree, so it cannot show misuse. Two small points beside it:
R6 lists the kit's `inPrimaryCell` first, but it throws for a market that is not
in the kit's rule book (check (2) must come first); and R6 (3) must apply only
from t ≥ CUT, so that the reproduction stays identical to the kit.

Fix. R8 says that `planCopy` is re-implemented in `src/paper/` with END a
parameter and that the vendored one is never called; tests: synthetic copies
with an exit before, at and after END, an entry in the last 95 seconds before
END, and equality with the vendored function at END = CUT on all 1,918 and 1,366
copies.

### F10 (medium) The pre-cut panel and the seed live outside the repository, the freeze and the backup

Where: R9, R3 (the seed), §2 table "Marks and minute volumes: the kit's panel
(`KIT\panel`, pinned by the kit's manifest)", §2 "What the experiment writes".

Finding. `kit/constants.mjs` hard-codes `PANEL = F:/polymarket-follow-research/KIT/panel`
(92 files, 31 MB) and the capture paths. The run depends on a research scratch
folder that nothing backs up; the seed's location is not in the list of what the
experiment writes. `checkKit()` pins the panel's manifest only; the kit's
`loadMarket` verifies each file as it loads it, and the plan re-implements the
loading without saying that it verifies. Whether R2-STYLE's pages hold the
replies' text or re-written numbers is unknown to the plan (that folder was
outside its allowed list), so for ids above 2^53 "kept as source text" may be the
rounded value; harmless for entries (`entryId` is `addr|iid|t|type`, no ids)
but part 2 should say so.

Fix. Copy the pinned panel (31 MB) and write the seed into the experiment's
folder; a stated rule that each panel file is verified against
`data/panel-manifest.sha256` at load; `paper\` (state, logs, manifests, seed,
panel) goes into the backup (small; the raw replies can be read again).

### F11 (medium) The run's mechanics are not written down

Where: §3, §6, §9.

- **A lock.** `poller.lock` is the poller's. A hand-started `paper.js daily` beside
  the task would write `state.json` twice. Its own lock file; the same for the
  logger (`createLog` writes `poller-<date>.log` and prunes by that name): its own
  prefix.
- **State.** `state.json` is rewritten each run: write to a temporary name and
  rename, and checkpoint after each account, so that a crash in hour 5 of a 5.3 h
  Monday does not repeat it. A second run on the same UTC day: say what it does
  ("a day's files are never rewritten").
- **The night pause.** `RestClient` answers `paused` at once from 02:34:45Z (it does
  not wait). Say what the run does: end cleanly and continue from `P` at the next
  start is the simplest. Part 1's fake Monday must start late enough to cross the
  window, or it proves nothing about 02:35 to 03:50Z.
- **The task.** An ExecutionTimeLimit longer than the first run (suggest 36 h; the
  backup task's 1 h would kill a Monday), `IgnoreNew`, and priority left at Task
  Scheduler's 7 so the collector (4) wins. `register-tasks.ps1` converts a
  local-time literal when it registers: `'05:00'` typed in winter is 04:00Z, typed
  after 2027-03-28 it is 03:00Z, inside the quiet window (the backup task has the
  same pattern); compute the trigger from the UTC time.
- **The deploy.** `deploy.ps1` renames the run copy and fails after 10 s while a
  process works in it (a 5.3 h Monday blocks collector deploys); its smoke test
  and `register-tasks.ps1`'s file check name only `dist\index.js`. Add
  `dist\paper.js` and `research\kit\check.mjs`, and the paper's own start-up
  refusal without settings (exit 2); test on a scratch `-RunRoot`.
- **Compute.** "Every copy is recomputed from all inputs each day" includes the
  label of 1,602 accounts at up to 52 Mondays, and the kit's `features` derives
  the events of an account's whole capture on every call. State a ceiling for the
  daily compute (suggest 30 minutes), measured in part 4 (it already computes the
  26 Mondays), and cache labels and habits per (account, Monday), keyed by a hash
  of the fills before that Monday, with a test that a cached value equals a fresh
  one.
- **Retries.** A dropped request on a 429 must not lose an account's day: reuse
  `withTries` (three tries, spaced by the client's back-off) from `jobs/paging.ts`
  rather than a new loop.
- **Safety cap on the list.** List accounts are read without a cap (right); add a
  high safety cap (suggest 50 pages = 5,000 fills in a day) that makes a hole and
  an alarm, so one runaway account cannot take the run's budget.

### F12 (medium) Binance: "no stocks found" is out of date

Where: one-pager "Binance futures — … crypto and … gold and silver, no stocks
found"; §4 table, Binance column ("Which copied markets", "Funding").

Finding (read 2026-11-12). Binance's own Academy page "How to Trade Tesla (TSLA)
on Binance Futures" (updated 2026-07-28) describes TSLAUSDT, a USDT-margined
perpetual, 24/7, up to 5x, with funding every four hours. The Block (2026-09-01)
reports that equity-linked perpetuals were about 79% ($342.9B) of Binance's
$433.4B TradFi-perpetual volume in August 2026; press reports list batches of
stock perpetuals since 2026-01-28. The plan's claim was an absence ("found none"),
the weakest kind of fact, and Binance's own page now contradicts it. What checks: the fee FAQ (updated 2026-05-01):
0.02% maker and 0.05% taker for a Regular User as an example, 10% off with BNB,
fee = position value × rate. The funding FAQ (updated 2026-03-06): 0.01% interest
per 8-hour interval, settlements 00:00, 08:00, 16:00Z, a clamp of ±0.05% on
(interest − premium), caps by symbol; it describes 1-hour and 4-hour intervals,
not "4 or 2 hours".

Effect. The Binance line would leave out all 35 equity markets of the 84 and
would claim 8-hour funding. Fix: say that Binance lists equity-linked perpetuals;
take the list of which of the 84 markets exist from Binance's own instrument list
at the build, for every category (the plan says so only for crypto); correct the
funding sentence and add the pages' dates.

### F13 (medium) Finotive: the rule is stated plainly; the line around it is the problem

Where: one-pager "The venues"; §4 table rows "Copying", "Account rules that matter",
"What it leaves out"; Q7.

Finding. Verified today: help article 955 (no date shown) says copying trades from
third-party accounts, shared master accounts, signal providers, account managers,
challenge-passing services or third-party trading groups is prohibited and that
Finotive may shut an account and withhold Reward Payments if ownership and
control of the setup cannot be shown; the terms §7.10 allow copying one's own
trades between one's own accounts and list the same practices as prohibited;
§7.2 items 2 and 3 repeat it. The plan quotes it in bold twice: good. But (a) a
computed Finotive result line is by construction the answer to "what would
copying these traders have earned on this account", which the terms bar; Q7's
"the line describes costs, never a way to use an account" is true of the
arithmetic, not of the reading. (b) The long row of account rules (drawdown
limits, floating-loss limits, 20% of profit from trades under 2 minutes, the
21:00 to 22:59Z rule, strikes, weekend holding) is guidance for operating an
account; the cost line needs none of it. (c) "What it leaves out" lists the rule
among ten approximations, where it is a prohibition.

Fix (the owner's call, Q7). For Finotive print the rule first, above the table,
and only the cost facts the owner chooses to supply, in the look report's venue
section; no result line for it, and nothing on the daily page (R15 already has
none); reduce the account-rules row to one sentence that account limits are not
modelled. The venue-independent line ("positions of this line would have paid at
any round trip below X bps") already lets the owner compare any figure.
Metals leverage is 1:15 on Instant accounts (the plan says 1:20, which holds
for the other programmes).

### F14 (medium) The lines beside: formulas incomplete, three beyond the rulings, the heaviest least needed

Where: R7, R13; §3 and §6 (the collector's books and tape).

Finding. Section 1 is meant to be frozen as written. (a) MAKER: the entry price is
the limit price and its instant is the fill instant, not t + D, but the kit's
`leg` prices at marks; the plan gives no formula for the entry leg, the funding
window from the fill instant, or the exit legs that follow. (b) STOP: "closes at
the end of minute s" does not say which instant goes to `leg` (the minute's start
or its last millisecond), which changes funding at an hour boundary and the
session of the spread table. (c) JUMP: U's window must end at e (that is
s + 15 min ≤ e), or the average looks up to 14 minutes ahead. (d) VWAP: "the leg's
notional" for an exit part, and which frame ("within 2 s before"). (e) Three lines
(VWAP, NOTIONAL, COMP) come from APPROACH-REVIEW's design text (C2; "what could
fool us" 7, 10, 11), not from the seven rulings; the owner accepted that text, but
each adds code to the freeze. MAKER and VWAP need the collector's Brotli book and
tape files, the heaviest and least tested code, for lines that decide nothing.

Fix. Complete the formulas in `rules.md` or separate the lines. My recommendation:
build the deciding path (MAIN, both readings, the statistic, the verdict, the
page) and the cheap lines (TEN, BROAD, DAY, FAV, STOP, DAYS7, JUMP, NOTIONAL, COMP)
first; MAKER and VWAP are a separate sub-part of part 3; if they are not ready on
the freeze date they join as a later arm with their own start (they decide
nothing, and the collector keeps the books and the tape), and the freeze does not
wait for them.

### F15 to F18 (low)

- **F15 Numbers.** (a) §3 says 728 accounts had a fill "in the last 14-day window
  before the cut"; 728 is the window before Monday 2026-11-02, at the cut 795 had
  none, so 807 were active; the sweep is 32,910 tokens, not 32,060 (+2.7%, Monday
  39,020). (b) The daily list's 341 calls count (290 + 20) × 1.1 and omit traders
  with open copies that are not directional this Monday. (c) "The collector's
  measured peak of 12 in 5 s" is COLLECTOR-REVIEW's whole night on fake timers
  through the real client (decisions 2026-11-11, (7)), not a live reading; the
  collector's own cap is 30, and two clients that do not know each other can add
  up to 45 (the API's own bucket takes about 90 to 100); the build logs both peaks
  (the collector's heartbeat has `peakBurst`). (d) Q3's "not covered for the next
  two Mondays" holds for the label (14 days); the habit window (30 days) makes it
  five. (e) C1's main-line count (284 a week) does not apply the 30-day habit
  coverage that R7 requires; print its effect (counts only, blind-safe).
- **F16 Rules.** (a) R12: if KEEP and DROP both hold (SE below about 2 bps, since
  2 × z × SE must be under 10) say which wins; I suggest DROP ("not worth having"
  is the stricter statement), a case that cannot happen in 26 weeks, but one line
  costs nothing. (b) R14 and R15:
  give the z (or t and df) of "its lower bound", of the per-trader 95% band, and the
  formula of "the smallest edge visible at the next look"; R3's e-value needs its
  tie rule (|d| below 0.1 bps dropped, decisions 2026-11-07, (4)). (c) State a share
  of unpriced MAIN copies above which a look's verdict is withheld (suggest 2%; 0 of
  1,918 were unpriced in FIND-6-EXITS); a copy that crosses a settlement is
  unpriced and drops out, a small survivorship the page should name. (d) The look
  refuses a second run when `looks\L<k>\` holds a result. (e) The design text's
  "stored with every copy for later splits" (C2: funding rate, long and short
  counts and open-interest change at entry, the agreement flag) is not in the
  plan; it costs little and the collector's tickers hold it, so it is not lost,
  but say it is deferred.
- **F17 The page.** R15 bans the words "follow", "copy", "signal", "edge", "skill",
  while the plan describes the page with "the follower's moment" and "the follow
  instant": name the page's own labels (for example "paper entry time") and test
  the page's text for the banned words. "It pays at any round trip below X" is
  present tense: write "positions of this line would have paid …". Under the
  per-trader rows add a fixed caption: with N traders about 5% of bands exclude
  zero by chance, and these rows decide nothing. Use neutral colours (no
  green or red for a sign). The full copy table reaches about 25,000 rows by the
  last look (BROAD); say how the one file stays openable (the newest N rows, the
  rest in a second file). Escape the text of addresses and symbols.
- **F18 Wording and form.** "5% in all" is the two-sided total; KEEP is one-sided,
  so it spends 2.5% (the limits are right). The normal limit z against the t
  quantile on the day clusters (41, 90, 181 degrees of freedom): 2.967 against
  2.81 at the first look (+5.7%), 2.480 against 2.43 (+2.0%), 2.187 against 2.17
  (+0.8%) (`out/r5`): print the t band beside, deciding nothing. The Binance
  5 bps and the owner's Finotive figures are chosen after the freeze, against R16
  ("no number changes"): say they are reporting arithmetic outside `rules.md`. The
  daily log repeats every copy's state every day (about 5 MB a day by the last
  look): write changes, with a full table weekly. The formats the paper reads from
  the collector (rule book documents, file layout) become a contract: list them in
  architecture so that a collector change checks the paper. `once.js` is deleted in
  part 1: fine, it is one of the collector's listed follow-ups; the build's closing
  message should say so.

## The checks of the brief, one by one

**1. Does the plan do what the decisions say, all of it and nothing more?** Yes for
every ruling: the pool without the holdout; P1 at the Monday on the 14 days
before; MAIN = median hold 6 h or more over 30 days with at least 3 closed cycles,
TEN beside; openings and flips in the primary cells, every hour, $1,000 at t + D
at a taker's cost with funding; two readings; data from the cut; the three looks
with the spending 0.5%, 1.5%, 3%; keep, drop (δ = +10 bps), too few; beside lines
(every directional entry, TEN, maker entries, stops and 7 days, day-holders,
"after a jump", the owner's favourites frozen and judged whole); the pool only;
a script first, now daily with a page that shows every copy, open and closed, the
running result per line and per trader with its band, "too early to judge" until
each look, verdicts only at the looks, rules frozen whatever the page shows. The
exams and D1, D2 are ruled; the budget and the page's reuse in v1 are stated.
*Gaps:* none against the decisions; against the design text, F16(e) and the
per-trader e-process (K = 20 slots), which is a rule of its own (which 20) and
which I would leave to v1. *Additions:* VWAP, NOTIONAL, COMP (from the design
text, F14); Q5 (favourites count from the freeze, not the cut) and Q11 (the first
verdict ends the test), both asked, not assumed.

**2. Are R0 to R16 exact and freezable?** Mostly. Entries and exits: R4 and R8 are
exact except F9 and the follow instant of an entry in the last 95 seconds before
END (unpriced in a daily run, never in a look, because it is not "voted"). The
3-cycle hold: the median of the closed cycles of the 30 days, the middle two
averaged for an even count (the kit's `median`); exact; its noise is the owner's
ruling 7. The label's week: no look-ahead (I read `features`: events after the
label's end do not enter; the one field that sees them, `openAgeMedianMs`,
feeds only `horizon`, which the plan does not use). The delay: `entryId` is
`addr|iid|t|type`, no ids, so D in [62.14 s, 95.44 s) is unchanged by the id
change. Unpriced: exact; add the bound (F16c). The matched null: it needs no tape
(`nulls.mjs` says so; the plan's finding is right); `dAgainstNull` throws on a null
long share, so the build must test it before calling (R11 says d is null). The
two-way error: R12's formula uses singleton clusters for the overlap term where
the usual form uses trader-day cells; with positive dependence inside a
trader-day it is the more conservative of the two; fine. The spending:
2.807, 2.432, 2.170 (`out/r1`). Keep, drop, too few: exact (F16a). "The first
keep or drop ends the test": agreed (Q11); say what the page's verdict box shows
after it. The effects of F1 to F3 are on coverage, not on the statistic.

**3. The blind.** Held in the plan; part 4 uses only weeks before the cut. Not held by
construction: F6, F7.

**4. The eight extensions of the kit past the cut.**

| # | Piece | Needed | Correct as written | Note |
|---|---|---|---|---|
| 1 | `readAccount`, `validFill` | yes | yes | F8(b), F10 (id text), F6 (guard) |
| 2 | `labelAt`'s `covered` | yes | no | F2: add `P ≥ b` |
| 3 | `inPrimaryCell` | yes | partly | F9: order of checks, t ≥ CUT only |
| 4 | `competition.mjs` | beside only | yes | needs every competition of the rule book |
| 5 | `feeAt` | yes, small | yes | the collector's record is taken "from that record's instant"; say that the record is the first time the collector saw the change |
| 6 | `marketFrom`, `loadMarket` | yes | untested for the pull | F8(a), F10 |
| 7 | `voted` | yes | yes | trivial |
| 8 | `planCopy` | yes | no | F9: silent wrong numbers if the vendored one is called |

A search for `CUT` and the `F:` paths in the 15 modules finds no other use than
rows 1, 6, 7 and 8 (in `constants`, `entries`, `fills`, `panel` and lib-exits)
and the hard-coded paths (F10); rows 2 to 5 are bound by data as of 2026-11-10,
not by `CUT`. What the kit computes before the cut does not change if the
extensions only act from t ≥ CUT (F9) and part 4 passes.

**5. The budget.** See the next section. Overruns, failures, a missed day:
`IgnoreNew` skips the next trigger while a run lasts; the next run reads from `P`;
a missed Monday sweep is made up by the next run, because a label at Monday M
depends only on fills before M (verified in `features`); the cap then applies to a
two-week read (F1); the gaps in all three cases need F2.

**6. The code's shape.** A second entry point beside `index.ts` and `once.ts`, the
client extended by a burst parameter and four routes, `research/` beside `src/`:
simple and it fits; three tools already ignore `.mjs` (F5). Zod at every
boundary: say it for the rule book's documents read from MongoDB, the collector's
book and tape lines, the stored files read back (`state.json`, the day files, the
manifests) and the favourites file, as the plan does for the page. Fit with v1:
the notes are enough. Nothing speculative except F14; `rehearse` should not ship
in the frozen program (F6). Parts and checks: the additions are in F2, F5, F6, F8,
F9, F11 (part 0: fresh clone; part 1: User-Agent, lock, pause crossing; part 2:
pre-cut pulls; part 3: compute ceiling; part 4: END not equal to CUT; part 6:
scratch deploy).

**7. The page.** One static file is the right size. Reading too much into
numbers: the plan's guards are good (no knobs, five lines, no verdict between
looks, the band at the next look's limit with its caption, no sort by result, a
stale warning at 36 hours); add F17. Advice: nothing reads as advice except the
present-tense "it pays".

**8. The venues.** F12 and F13. The cost-line method (Polymarket's marks, the
venue's fee on both legs of every part, a stand-in spread and funding, flagged) is
sound and its list of omissions is honest; Binance's 10% BNB discount and the
fee-tier example are correct as printed.

**9. The User-Agent.** Confirmed. `apps/poller/src/api/rest-client.ts:34`
`USER_AGENT = "polymarket-follow"` is sent on every REST request (line 223) **and**
on the WebSocket handshake (`ws/connection.ts:59`), and `test/rest-client.test.ts:81`
asserts it; PAPER-PLAN's probe sent `polymarket-follow-research`
(`PAPER-PLAN/scripts/p1-fills-probe.mjs:45`, ten calls, 11:09 to 11:10Z). The
database driver's `appName: "polymarket-follow"` (`store/db.ts:123`) goes to the
local MongoDB only, so the rule (outside services) does not touch it.
*Where the plan must fix it for the new script:* §6, the bullet that gives the
second entry point "its own `RestClient` instance (share 120, burst 15 — the burst
becomes the client's parameter)": the User-Agent becomes a client option in the same
change (the paper passes a generic name of the owner's choosing; the collector's
instance keeps its constant until the follow-up), and Part 1 adds a test that no
header or URL of any request carries the project's or the owner's name. *The
collector's header, a small follow-up:* change the one constant (REST and
WebSocket) to the generic name and update `rest-client.test.ts:81`; the live
poller changes only at its next deploy. The constant stays outside the frozen set
(F4), so the follow-up needs no freeze procedure. Record in external-apis which
agents the API has seen so far.

**10. The eleven questions.** See "The questions of the plan" below: I agree with
all eleven recommendations, with the conditions named there; Q7 differs in one
point.

**11. Risks the plan has missed.** F2, F3, F4 (shared code and toolchain), F6, F7,
F10, F11, F15(c); and: the collector's formats become a contract (F18); a standing
400 for an unregistered favourite (F2); a market that settles while a copy is open
drops the copy as unpriced (F16c); the likely answer in December and February is
"too few to tell" (APPROACH-REVIEW says so; the page one should keep saying it).

## The budget, re-derived (`out/r1`; weights from external-apis)

| Figure | Plan | Re-derived | Note |
|---|--:|--:|---|
| Market data a market-day | 30 | 5 × 2 + 5 × 2 + 10 × 1 = 30 | marks and klines 2 calls, funding 1 |
| Daily list | 341 calls | (290 + 20) × 1.1 = 341 calls = 3,410 | omits open-copy traders (F15b) |
| **Daily run** | **6,110** | 3,410 + 90 × 30 = **6,110**; 50.9 min at 120 a minute | agrees |
| Monday sweep | 32,060 | 874 × 1 + 182 × 10 + 256 × 2 = 3,206 calls = 32,060 | 32,910 with the cut-time counts (F15a) |
| **Monday run** | **38,170** | **38,170**; 5.30 h; **ends 09:18Z** | worst case, every active non-list account at the cap: 58,650 = 8.1 h (ends 12:08Z); no call can fall in 02:35 to 03:50Z |
| A week | 74,830 | 6 × 6,110 + 38,170 = 74,830; 6.2% of the share's capacity | agrees |
| **First run** | **112,803** | c3's model 112,803 (15.7 h); day by day 144,501 (20.1 h); 28 days 187,934 (26.1 h); literal (no cap) about 323,923 (45 h; an estimate from R6's median 695 a day); one cap 76,403 | F1 |
| All callers | 170 of 250 | 120 + 50 = 170 | agrees |
| Bursts | 27 of 30 | 15 + 12 = 27 | the 12 is a fake-timer night (F15c); worst case 45 |
| Rate shape | — | a 10-token call under a 15-in-5-s cap goes once in 5 s = 120 a minute: the burst and the share agree; 5-token calls are held by the share | |

The night pause is in the client (`restPaused` refuses from 02:34:45Z) and the
04:00Z start is outside it; a run that starts at 04:00Z reaches 02:35Z after
22.6 h, which only a first run of four weeks or more does on c3's model (F1,
F11).

## The venues re-read

| Fact in the plan | Source read today | Result |
|---|---|---|
| Finotive: copying third-party trades prohibited (help 955; §7.10, §7.2) | help article 955 (no date); terms §7.10, §7.2 (no date; "© 2026") | exact |
| Finotive: daily 3.0 to 5.0%, maximum 6.0 to 10.0% by account (§7.4, §7.5; 2-Step 4.5% / 9.0%) | terms §7.4, §7.5; `/rules` | exact |
| Finotive: floating loss per symbol 2% Challenge, 1.5% Instant; volume 1,250%; 20% of profit under 2 minutes; 21:00 to 22:59Z; five strikes | `/rules`, §7.14, §7.17 | exact |
| Finotive: leverage crypto 1:10, indices 1:40 (1:30 Instant), metals 1:20 | §6.4 | metals 1:15 on Instant |
| Finotive: 2-Step Solo USD 2.50 round turn (§8.8.3); Pro 25% lower (§10.4); may amend commissions (§6.4) | the terms | exact |
| Binance fees 0.02% / 0.05% as an example; 10% with BNB; updated 2026-05-01 | fee FAQ | exact |
| Binance funding 0.01% per 8 hours; 00:00, 08:00, 16:00Z; ±0.05% clamp | funding FAQ (updated 2026-03-06) | right; intervals are 1 h and 4 h, not "4 or 2" |
| Binance: gold and silver since 2026-01-05 and 07 | press (The Block 2026-01-08) | right |
| Binance: "no stock or index perp found" | Academy TSLAUSDT page (2026-07-28); The Block 2026-09-01 | **wrong** for stocks (F12) |

## The questions of the plan

1. **Main line without the 24 h map (Q1).** Agree. The accepted counts (284 a week,
   157 traders) assume no map; with it 224 and 149 (re-checked in `out/c1`). Remove
   the conditional clause R6 (4) from the final `rules.md`.
2. **Whole pool weekly (Q2).** Agree.
3. **Cap 10 pages (Q3).** Agree. Correct "two Mondays" (F15d) and add the safety
   cap for list accounts (F11).
4. **Code inside `apps/poller`, kit vendored as frozen JavaScript (Q4).** Agree, on
   the conditions of F4, F5 and F11.
5. **Favourites count from the freeze (Q5).** Agree.
6. **Five lines on the page (Q6).** Agree, with F17's caption.
7. **Finotive line (Q7).** Agree with "a cost comparison, the rule beside it" in
   spirit; my recommendation differs in one point: no Finotive result line and
   nothing on the daily page (F13). The owner's call.
8. **Close the exams of 11-30 and 12-19; 12-19 is L1 (Q8).** Agree.
9. **D1 after 11-21, D2 after 11-30, D2 after D1 (Q9).** Agree, both after the
   freeze (F7).
10. **120 a minute, 15 in 5 s, the first run at the same share (Q10).** Agree, with F1:
    16 to 26 hours, resumable, started at 04:00Z by hand.
11. **The first keep or drop ends the test (Q11).** Agree.

**My questions, each with a recommendation.**
- **Q-A (F1).** One loop for the first run and every other run, list accounts without
  a cap? *Yes.*
- **Q-B (F13).** No Finotive result line, rule and cost facts only? *Yes; the owner's
  call.*
- **Q-C (F7).** D1 and D2 after the freeze? *Yes.*
- **Q-D (F14).** May MAKER and VWAP be left out of this freeze if they are not ready,
  to join later as their own arm? *Yes.*
- **Q-E (F4).** The freeze is the hash of what runs plus a tag of the commit? *Yes.*
- **Q-F (F10).** Copy the pre-cut panel and the seed into the experiment's folder
  and back them up? *Yes.*
- **Q-G (F16a).** If KEEP and DROP both hold, DROP wins? *Yes.*

## What I could not check

- The seed's id text (R2-STYLE's folder holds post-cut files and was not opened by
  the plan or by me).
- That FIND-3's `d` reproduces with the plan's removal set (the line at M); part 4
  tests it, and a mismatch there is a rule change to make before the freeze.
- Finotive's symbol list and commission table and Binance's own instrument list
  (loaded by JavaScript); the Binance equity facts come from Binance's Academy page
  and press.
- The real run time of the daily compute and the live peaks of the collector.
- I did not re-run PAPER-PLAN's scripts or the kit's tests; I did hash-check the
  plan's evidence list (all eleven entries equal), the kit (`checkKit()` passes on
  PAPER-PLAN's copy) and lib-exits (`612d5836…6330`).

## Evidence

| File (`workers/PAPER-PLAN-REVIEW/`) | What | SHA-256 (start…end) |
|---|---|---|
| `scripts/r1-z-and-budget.mjs` → `out/r1/stdout.txt` | z values; the budget and the first run's readings | `a41c8050…6207` → `7536c25a…9b47` |
| `scripts/r2-line-endings.mjs` → `out/r2/stdout.txt` | line endings of the kit copy and lib-exits | `7ee6af0a…5434` → `15039695…11e0` |
| `scripts/r3-checkkit.mjs` → `out/r3/stdout.txt` | `checkKit()` on the copy; file times; CR counts by three methods | `abf7051c…2b7e` → `74046e8c…0949` |
| `scripts/r4-reviver.mjs` → `out/r4/stdout.txt` | `JSON.parse` reviver with `context.source` | `6b2dc4e3…c080` → `ee0755c2…076f` |
| `scripts/r5-tcrit.mjs` → `out/r5/stdout.txt` | t against z at the three looks (the kit's `tCritical`) | `a72cf847…6a32` → `be595275…56c0` |
| `scripts/r6-plancopy.mjs` → `out/r6/stdout.txt` | the vendored `planCopy` on synthetic copies after the cut | `22425d49…82b1` → `6ad6a1b0…142a` |

Web pages read 2026-11-12 (11:49Z to 12:10Z): `finotivefunding.com/rules`,
`/terms-and-conditions` (all 132,113 characters), `help.finotivefunding.com/en/articles/955-can-i-copy-trades-from-another-person`;
`binance.com/en/support/faq/binance-futures-fee-structure-fee-calculations-360033544231`
and `/360033525031`; `academy.binance.com/ur-PK/articles/how-to-trade-tesla-tsla-on-binance-futures`;
`theblock.co/news/business/2026-09-01-binance-adds-options-1000-us-stocks-etfs-monthly-tradfi-perpetual-volume-surge-413213`;
`pnpm.io/cli/deploy`. Two generic searches on Binance's TradFi and stock perpetuals
(press results, not relied on beyond the facts above).

*This is research, not advice on what to trade.*
