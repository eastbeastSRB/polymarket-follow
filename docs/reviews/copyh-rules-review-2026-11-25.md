# COPYH-RULES-REVIEW — the fresh review of COPY-H's rules, before the code is reviewed and frozen

COPYH-RULES-REVIEW (Fable 5.2, max, fresh), 2026-11-25 17:11Z – 17:55Z and, after a stop on a usage limit,
21:12Z – 21:16Z (UTC; every stamp from `date -u`), for polymarket-follow's supervisor. It reviews
`apps/poller/copyh/rules.md` (C0–C18, 1,239 lines, SHA-256 `f4067942…00ae`; commits `36db11a`, `02e65bc`,
`fa52406`; COPYH-RULES, Opus 5.5) against its sources: the plan (`83ac6ba`), the plan's review (`dda8d38`),
the owner's eight rulings (decisions 2026-11-25, "COPY-H'S PLAN APPROVED"), the paper experiment's frozen
rules, and the supervisor's 13 provisional rulings (decisions 2026-11-25, "COPY-H's RULES DRAFTED"). **A
review decides nothing:** the supervisor and the owner rule on it. It recommends how a test is written,
never what to trade.

**The limits held.** Read only. Nothing on F: was opened, nothing was fetched, no program of the project was
run, no agent was started, polymarket-lab was not touched. No rule and no code was changed. Two small scripts of
mine ran, on numbers the rules and their sources state (section 9). In the supervisor's folder I opened my
brief, my own `progress.md`, COPYH-RULES' `progress.md` and, on the coordinator's word at 17:15Z, one section of
COPYH-STORE's `progress.md` ("The rules draft against my code and plan"): its 15 differences are section 4.
On its word at 21:12Z I read COPYH-STORE's two commits (`74dec98`, `a021779`) where a rule's wording must
match the code, and searched its working tree of that minute for four more points (section 5).

My findings are named RH, RM and RL, so that none is taken for the plan review's H1–L9, which the rules cite.
One bp is 0.01% of a copy's $1,000.

## For the owner, in one page

**Verdict: the rules may be frozen after these fixes.** They are careful work, and nothing in them needs a new
design. The fixes are wording, a few missing cases, and two points that are yours to rule.

**What is solid**

- **Every fix and every ruling is in.** I checked the plan review's 20 fixes and your eight rulings one by one
  against the text. The sentence you chose for the filter rounds is there letter for letter.
- **No month that chooses also judges.** The main rule was frozen on Polymarket's weeks. A filter chosen on
  WAVE-H's months is confirmed on FRESH's months alone, and then judged on FRESH-2's months alone. Before the
  freeze nothing is priced but one computation whose only output is a fingerprint.
- **The paper experiment's rules are carried over without a silent change.** I read the frozen kit's code
  beside each rule: the order events, the label and its proof, the delay, the copy's legs, the matched null, the
  two-way error.
- **Every bar is the right number.** I recomputed each (2.81, 2.43, 2.99, 2.24, 1.96, 1.645) and the whole
  calendar (48, 24 and 26 Mondays; 8,845 and 4,102 files; 504 days).
- **The main verdict is complete.** Each of its 32 possible states has exactly one reading, and its sentence
  is written in advance.

**What must change, in plain words**

1. **Stops after look 1 (the one high finding).** In seven places the program can stop "for a decisions
   entry" for the first time at step 2 or later, after look 1's result is known, and the rules do not say
   what that entry may decide. A decision made then is a rule made on a result. Each stop needs its allowed
   outcome written now. None of this changes what is tested.
2. **A filter's two later verdicts have gaps:** the order of the checks, the case where no error can be
   computed, and the sentences for the confirmation on FRESH's months.
3. **Smaller things:** freeze numbers that would collide with a bug fix, the funding list, the known-answer
   test, and names of files and numbers.

**Two points that are yours**

1. **Copies still open when a coin is delisted.** The paper rule drops them and calls it "a small
   survivorship". Hyperliquid has delisted up to 56 of its 235 coins, so here it may not be small: at this
   test's bars, one copy in a thousand that lost 30% moves the average by 3 bps. *Recommended:* value such a
   copy at what its holder was paid, the settlement price, flagged, and print the result with and without.
2. **Filters by side.** A filter "longs only" or "shorts only" does not measure skill on the second reading: it
   carries the market's direction, and the direction of FRESH's months is public. *Recommended:* a filter may
   not use the side; longs and shorts stay printed apart.

---

## Verdict

**May freeze after these fixes.** One high finding, eight medium, thirteen low. The high one (RH1) is seven
unwritten outcomes of one kind; RM3 and RM4 need the owner's word, since each changes what a reading means.
Nothing asks for a new design: the question, the deciding line, the months, the seals and the bars stand.

## 1. Findings, by severity, each with its exact wording

### High

**RH1. Seven stops can first fire after look 1's result is known, and the rules do not say what may then be
decided.**

- **Why it is high.** It is the plan review's H2 again: "if it is ruled after look 1, it is a rule made on a
  result". The draft handles three such stops well: a new `dir`, a new coin and an unpaired record each have
  a written outcome (an append, the only difference). These seven have none.
- **The record shows the risk is real.** The exam's look 1 read WITHHELD after its copies were priced, on a
  projection of 2.2% that met 11.6% (decisions 2026-11-25, "LOOK 1'S VERDICT"). WAVE-H's step 1 died at its
  heap ceiling after 7 hours (code-rules).

**(a) The tripwire's stop (C16).** "Above 1% … the step stops before any price (exit 6) for a decisions
entry." At step 1 it should not fire, since the rehearsal counts all of E first. At step 2 it can.
*Exact wording,* in place of C16's "Above 1%" bullet:

> - **Above 1%** (half of the 2% WITHHELD line), the step stops before any price (exit 6). The decisions entry
>   that follows records the projection and may do one of two things only, changing no rule, number or file
>   of this test: **run on** — the step is started again with `--past-tripwire` and runs as frozen (a set
>   above 2% then reads WITHHELD, which the projection already says); or **end there** — the step is not
>   run, its look and its confirmations are recorded as not made, its months stay sealed, and a repair is a
>   new frozen test. The sets projected: at step 1 look 1's; at step 2 look 2's and each chosen try's set
>   on S; at FRESH-2's stage each judged set.

C15, step 2, item 4 then reads "the tripwire on look 2's set and on each chosen try's set on S (C16)"; the
draft's "S's copies alone" is a print's set (L8), which judges nothing. Since the projection is exact (C16),
"end there" keeps S unseen for a repaired test, which the exam could not do.

**(b) An account the kit cannot hold (C4, C15 (c) 5, C18; the supervisor's Q1).**

- The draft leaves EVENTS_MAX to "C15 (c) 5's count", and no formula is written. The provisional ruling is
  "twice the largest P1 account's count on E, within one part". It does not say what happens when the largest
  account does not fit one part.
- **A count of events does not measure what breaks.** I read `entries.mjs`: `buildEntries` appends each
  reducing event to every group still open on its side, so the work is the number of exits appended, not the
  number of events. An account with 500,000 events that often goes flat is cheap. One that is never flat on
  one coin holds between about n² ÷ 8 and n² ÷ 4 exits: up to 10 million at 6,300 events and 100 million
  at 20,000.
- So an account under any bar on events can still be one the kit cannot hold, and it would first be met at
  step 2 or on FRESH-2, as a crash.

*Exact wording,* in place of C4's "An account the kit cannot hold" bullet:

> - **An account the kit cannot hold** (M4): the kit's `buildEntries` appends every reducing event to every
>   group still open on its side, so an account that adds and trims for months without going flat grows that
>   work with the square of its events. The measure is that work itself, the **exit rows**: the number of
>   exits `buildEntries` would append over all its groups, counted without building them by
>   `exitRows(events)` (the kit's own loop with a count in place of each append; a test holds it equal to the
>   exits of every group that `buildEntries(events, −∞, ∞, 60 000)` returns, on made-up accounts). An account
>   P1 at some Monday whose exit rows over [ARCHIVE_START, END) number more than **EXITS_MAX = 20,000,000**
>   (fixed now: about 2 GB of exits at about 100 B each; an account never flat on one coin reaches it at
>   about 9,000 to 13,000 order events) is not run through `buildEntries`, so it has no habits: it is in no
>   line and in no line's removal set (C10), and it is named at each look with its exit rows and its OPEN
>   and FLIP order events at the Mondays where it is P1 (its entries' upper bound). The count reads the
>   account's fills to END, so an account can leave a later look for what it did after its copies; the
>   look names each such account.

C15 (c) 5 then reads: "among the accounts P1 at some Monday of E: the exit rows of each account above
EXITS_MAX and of the ten largest under it, and the kit's time and memory on the largest under it (M4). If
that run passes one part or half the worker heap, the freeze waits for a decisions entry." C18's row becomes
`| EXITS_MAX | 20000000 |`, and one `[SET BEFORE THE FREEZE]` value is gone. C4's test list gains "the count
equal to the kit's exits; an account above EXITS_MAX left out and named".

**(c) The worker heap (C15; the supervisor's Q2).** It is set from the rehearsal's peak, and the rehearsal
runs on E alone. Step 2 holds about 1.7 times the records (4.46 against 2.66 billion), and FRESH-2's stage
more still. A ceiling met at step 2 would need a frozen number changed after look 1.
*Exact wording,* added to C15's "The program" bullet after "and no heap flag":

> **The heap is a ceiling, not a rule of the test:** no output depends on it (every engine part is held to
> its twin's hash, every store to its second build). The rehearsal measures E alone, and step 2 and FRESH-2's
> stage hold longer histories; so a later step may run under a larger ceiling, never a smaller one, given as
> the setting `COPYH_HEAP_GB` and named in a decisions entry before the step and in every output's identity.

and to the settings: "and, when a decisions entry names it, `COPYH_HEAP_GB` (a whole number above
`design.ts`'s value; any other value is exit 2)".

**(d) A day over the record-failure limit (C3, "Stops").** In E the rehearsal meets it before the freeze. In
S or FRESH-2 it is met after look 1, with nothing written. *Exact wording,* added to C3's "Stops" bullet:

> At step 2 or at FRESH-2's stage a day over the limit is ruled by C0's route as a defect of the boundary:
> the entry lists the failing records' shapes, the boundary is widened to read what the archive wrote (never
> narrowed, and nothing else changes), and the pass runs again, before any price of that stage.

**(e) A funding file that fails (C9).** "… stop the step (exit 5) before any price, for the supervisor's
ruling by C0's route." Every funding file of E and S exists before the freeze, so this check belongs there.
The wording is RM5's: the freeze tool refuses a list whose files the program's reader does not pass, and at a
step only a changed file can then fail.

**(f) A market taker out of time order across two files** (the store's ruling 8, section 4, D8). The new
guard stops the pass. Its wording there names the outcome: by this file's own words the pairs are
consecutive in time, so code that cannot give them is a defect, fixed by C0's route with a sort across the
two files.

**(g) An hour the archive never uploads (C14, FRESH-2's terms, 1).** "The fetch's manifest must hold the
exact key set." *Exact wording,* added there:

> If the archive still lacks an hour of the range on 2027-05-25, the stage runs on the keys the manifest
> holds: the freeze's decisions entry lists the missing hours, and each is a hole (C3).

**And one line for whatever is not foreseen,** added to C17:

> **Any other stop after the freeze has two outcomes only:** once its cause is removed without changing a
> rule, a number or a frozen file, the step runs again as frozen; or the step is not run and its months stay
> sealed. Nothing else is decided after a result is known.

### Medium

**RM1. A filter's verdicts on S and on FRESH-2 are not complete (C14).**

- **The confirmation on S** has no reading names and no sentence. The brief asks for "each sentence written
  in advance".
- Not said: which try is first when one has no s, or when two are equal; whether the second try's test waits
  on the first's s or on its confirmation. (Waiting on s alone is valid: the extra conditions can only remove
  a pass, so the family's error stays at 2.5%.)
- **The sealed judgment** lists CONFIRMED before WITHHELD, where C12 puts WITHHELD first. A set with no copy,
  or with no error, has no sentence that can be filled.

*Exact wording,* in place of C14's "The confirmation" bullet:

> - **The confirmation, once, on S alone, at step 2** (Holm with m = 2 always: M5): each chosen try on its
>   line's copies with t in S, voted by END_S. Its statistic on S is **s = min(m ÷ SE, m′ ÷ SE′)** (C12's
>   forms on that set); a try with no copy there, or whose SE or SE′ cannot be computed, has no s. The try
>   with the larger s is the first (a try with no s is the second; equal s: the choice's order). The first is
>   tested at **z = 2.24** (2.5% ÷ 2, one-sided); the second at **1.96**, and only if the first's s exceeded
>   2.24, whatever the first's other conditions say (Holm's step-down is on s alone); a lone chosen try is
>   tested at 2.24. **A try's reading on S, the first that holds:**
>   1. **WITHHELD** when more than 2% of its set is unpriced: "Withheld on S: P% of the copies were
>      unpriced, above the 2% limit."
>   2. **NOT CONFIRMED** when it has no s: "Not confirmed on S: no error could be computed."
>   3. **NOT CONFIRMED** when it was not tested: "Not confirmed on S: not tested, since the first try's
>      bounds at 2.24 were not both above 0."
>   4. **CONFIRMED** when its s exceeds its bar z and C12's three sign conditions hold on S: "Confirmed on S
>      at z: m − z·SE = X bps a copy and m′ − z·SE′ = Y, both above 0; the traders' own means, the days' own
>      means and the copies without thin legs are above 0 too."
>   5. **NOT CONFIRMED** otherwise: "Not confirmed on S at z: m − z·SE = X bps a copy and m′ − z·SE′ = Y; a
>      confirmation needs both above 0 and the three conditions."
>
>   Each with R12's line. A try that is not CONFIRMED is closed for good and never retried on these months.

and in "The sealed judgment", in place of the text from "**CONFIRMED** when" to "**NOT CONFIRMED**
otherwise.":

> **The reading, the first that holds:** **WITHHELD** when more than 2% of the set is unpriced; **NOT
> CONFIRMED** when the set is empty or SE or SE′ cannot be computed ("Not confirmed on FRESH-2: no error
> could be computed."); **CONFIRMED** when m − z·SE > 0, m′ − z·SE′ > 0 and C12's three sign conditions
> hold; **NOT CONFIRMED** otherwise. A reading that is not CONFIRMED is no yes, and is not judged again.

`test/copyh-confirm.test.ts` gains: a try with no s second; equal s; the second not tested; WITHHELD before
the bounds.

**RM2. The freeze lists are named by fixed numbers, which a bug fix or an append would take (C0, C14, C15,
C17).**

- C0 gives a defect's fix "a new list tagged `copyh-freeze-<n + 1>`", and lets an append to `dirs.json`,
  `coins.json` or `unpaired.json` re-freeze. C14 and C15 hard-wire `copyh-freeze-2` as the rounds' list and
  `copyh-freeze-3` as FRESH-2's ("the gate at `copyh-freeze-2`").
- One fix between step 1 and the rounds and the frozen text contradicts itself. The exam's rules avoided it:
  "n the next free number" (P1).

*Exact wording,* in C0's "After the freeze" bullet, in place of everything from "the fix gets a new list" to
the bullet's end:

> the fix gets a new list. Never a number of this file. **Lists are numbered in the order they are made:**
> each is tagged
> `copyh-freeze-<n>`, n the next free number (`--tag <n>`), whatever its kind; no rule of this file names a
> list by its number. **The kinds of list after the first,** each allowed to differ from the list before it
> only as its own rule says (the tool refuses any other difference): a defect's fix (above); a value appended
> to `dirs.json` or `coins.json`, or a record added to `unpaired.json`, by C3's and C15's rulings; **the
> rounds' freeze** (C14, `--rounds`); **FRESH-2's freeze** (C14, `--fresh2`). **A step asks for what its list
> holds, never for a number:** step 1 runs under a list without `copyh/look1.sha256`; step 2 under one that
> holds `copyh/look1.sha256` and `copyh/choice.json` and no `copyh/fresh2.sha256`; FRESH-2's stage under one
> that holds `copyh/fresh2.sha256`, `copyh/funding2.sha256` and `copyh/look2.sha256`. Before a step runs
> under a list of any of these kinds, a fresh worker reads its lines that differ from the list before it (as
> the exam's P0 for its look 2).

Then, wherever they stand: "`copyh-freeze-2`" becomes "the rounds' freeze"; "`copyh-freeze-3`" becomes
"FRESH-2's freeze"; "may differ from freeze 1's" and "from freeze 2's" become "may differ from the list
before it"; "under freeze 1's gate" becomes "under the gate of the list in force"; "the gate at
`copyh-freeze-1`" becomes "the gate at a list without `copyh/look1.sha256`"; "the gate at `copyh-freeze-2`"
becomes "the gate at the rounds' freeze, or a later list of its kind"; C17's "freeze 2 and freeze 3" becomes
"the rounds' freeze and FRESH-2's".

**RM3. A filter by side is not neutral on the edge over the market, and S's direction is public (C14, C13).
The owner's ruling.**

- **The mechanism.** x′ rests on d, the copy against a null that is "long with the long share" of the trader
  (R10). Over all of a trader's entries that null cancels the trader's lean. Over one side only it does not.
  For a trader with long share 0.66, a long carries +0.68 of the market's 24-hour move and a short −1.32
  (section 9); all the trader's entries together carry 0.
- **What it does.** "Shorts only" on months that fell passes both readings from the direction alone. The
  plan review's H1 saw the case ("a try such as 'longs only' leans fully one way") and took the pair of
  bounds to cure it. For side filters it does not.
- **Why S is not clean for it.** S ended on 2026-11-15, and its direction is known to anyone. It is the plan
  review's M5 again: there, the wave's family was "printed on FRESH's months".
- **FRESH-2 still judges it honestly** (its direction is not known), at 2.5%. But the rules' "at most about
  0.06%" would not hold for such a try.

*Exact wording (a), recommended.* In C14's list of what a try is given, "the side;" leaves, and this is added
after "so no such covariate is given":

> **Nor the side:** a filter by side is not neutral on the edge over the market (x′'s null leans with the
> trader's long share, so a long of a trader whose long share is 0.66 carries 0.68 of the market's move and
> a short −1.32), and S's direction is public. SIDES prints the two sides, deciding nothing.

and in C13's "By part": "longs and shorts apart (SIDES; a side's m′ carries the market's direction and is
no edge)".

*Wording (b), if the owner wants side filters:* "A try that uses the side reads its edge over the market
against a null on the copy's own side (the kit's `dAgainstNull` with a long share of 1 for a long and 0 for a
short), computed at step 1 for every MAIN and BROAD copy beside its d." That is one more column and its
tests.

**RM4. Copies still open when their coin is delisted are dropped; on Hyperliquid that may not be small (C6,
C8, C9, C11, C16). The owner's ruling.**

- **The rule is the paper's, unchanged:** "a copy that crosses a settlement is unpriced this way (a small
  survivorship, named at the looks)" (R11). On Polymarket Perps a market is retired rarely.
- **Here up to 56 of 235 coins were delisted** (`meta`, 2026-11-25). A coin is usually delisted after it has
  fallen, MAIN leans long, and a dropped copy leaves every mean.
- **The size at this test's bars** (arithmetic only): 0.1% of copies at −30% is 3 bps a copy; 0.3% is 9.
  The bars are 0 and +10. The 2% WITHHELD line cannot see it.
- **It can be removed, not only named.** A holder at a delisting is paid the settlement price. The paper's
  own `planCopyThrough` already marks a copy at an end it is given (I read `copy.ts`: the last leg is at
  `end − 1`). Given the coin's end, it marks the copy at the settlement.

*Exact wording (a), recommended.* C6, second bullet:

> - **A coin's market objects end with its first "Settlement" record** (C9): at the end of the minute that
>   holds it, whose mark is the Settlement records' own price, their Σ px·sz ÷ Σ sz: what every holder was
>   paid. A copy still open then is closed there (C8). [56 of the 235 coins were flagged delisted on
>   2026-11-25.]

C8, a new bullet:

> - **A copy still open at its coin's Settlement** (a change from R11, declared: Hyperliquid delists far more
>   markets than Polymarket, and Iron Rule 4 wants the price a follower could have had): its legs are planned
>   with the coin's end in place of END (`planCopyThrough`'s `end`), so what is still open is marked at the
>   end's last millisecond, at the Settlement price, with C9's spread and fee as on any leg (the settlement
>   itself cost neither: a small charge against the copy). It is flagged `settled`, and every look prints
>   MAIN with and without such copies.

C9's market object runs "to END or the end of its first Settlement's minute, whose mark is the Settlement
price (C6)"; C3's bars also hold "the Settlement records' Σ sz and Σ px·sz". C11's sentence becomes "A copy
open at its coin's Settlement is priced there (C8), flagged and counted." C16's reason 3 becomes a count,
and the projected share is "the share of MAIN's set with at least one of 1–2". C6's rule for an entry (no
Settlement by the end of t's UTC day) stays as it is.

*Wording (b), if R11 is kept:* "C16's count 3 on all of E is read before the freeze; above 0.05% of MAIN's
set the freeze waits for the owner. Each look prints MAIN with those copies valued at the trader's own
Settlement fill, beside, deciding nothing."

**RM5. The funding: its first hour, the list's completeness, and the reader's check before the freeze (C9,
C18, C14).**

- **The range.** C9 and C18 say the hours from 2025-05-25T00:00Z. COPYH-FUNDING's tool, committed as
  `a0c7b9e`, fetches from M₀, 2025-06-30. The tool is right: no copy is open before M₀, so no earlier hour
  can be charged. From M₀ it is 26 windows a coin (17 in E, 9 in S), against 28.
- **The list.** The tool writes its list when a run has gone through its reads, and logs the reads still
  `left` (a reply refused twice). A window missing from the list would be 480 hours "charged nothing and
  counted": cheaper copies, by a gap nobody ruled.
- **The check** is RH1 (e).

*Exact wording,* in C9's "Funding" bullet. "the hours [2025-05-25T00:00:00.000Z, END_S)" becomes "the hours
[M₀, END_S) (no copy is open before M₀)". In place of the clause that begins "and listed in":

> a window a file, no window holding both E's and S's hours. **`copyh/funding.sha256`** is written by
> `tools/copyh-freeze.cjs --data` from the store's own list, each line held to the store's manifest: the
> `meta` reply of C3 and **every window of every coin of `coins.json`** (an empty reply is a window read:
> the coin had no settlement in it). **The tool refuses** a list that lacks a window, and one whose files
> the program's own reader does not pass: its schema (Zod: `coin` text, `fundingRate` and `premium` decimal
> text, `time` a safe integer), and no coin's nominal hour twice. That check reads the rows' shape and
> times only, S's among them, and uses no rate.

and in place of the bullet's last sentence:

> At a step, a window file that fails the reader stops the step (exit 5) before any price; after the tool's
> check only a changed file can.

C18's row becomes `| funding from | 2025-06-30T00:00:00.000Z |`. C14's FRESH-2 terms, 2, gain: "listed in
`copyh/funding2.sha256` the same way: every window of every coin, and the reader's check before FRESH-2's
freeze."

**RM6. The known-answer test leaves the new deciding reading and the new market object untested, and does
not say where its answers come from (C15 (a), C9).**

- **d is not in it.** The paper's own reproduction held "FIND-3's d 1,086 of 1,203" (decisions 2026-11-12,
  PAPER-BUILD's technical calls). COPY-H's list has no d, and since H1 the edge over the market, d less the
  cost, decides beside the money.
- **The market object is never met by it.** The reproduction runs "on the kit's own panel", so COPY-H's own
  `markets.ts` ("the kit's `marketFrom`, step for step") is not run by any known answer. No test in C9's
  list holds it to the kit's.
- **The 1,700 copies** were reproduced "exits copied, held 24 h, D = 0" (the same entry). The rule does not
  say so.
- **The reference** for 1,700 copies "to 1e-9 bps" is not named. The seal closes the paper's folders, and
  FIND-6-EXITS's own output holds all 1,918 copies, the 218 holdout ones among them.
- **The conversion** must chain each timestamp's fills apart. The kit keys an event by (order, previous
  size, instrument) with no time (`fills.mjs`, `entries.mjs`), so two timestamps' fills that share a
  previous size must both start their chain at it, or the events differ from the paper's.

*Exact wording,* in C15 (a). "each order event's fills given per-fill `startPosition` chains from its
`previous_size`" becomes "each order event's fills of one timestamp given a per-fill `startPosition` chain
that starts at the event's `previous_size`". After "on the kit's own panel and taker setting.":

> **Each reference value is computed in the same run by the kit on the seed's own records** (its `normFill`,
> events, entries, `labelAt`, `habitsAt`, `leg`, lib-exits' `priceCopy`, `dAgainstNull` with `removalOf`);
> every total is the record's (decisions 2026-11-12, PAPER-BUILD's technical calls).

The first known answer becomes "FIND-6-EXITS's **1,700 of 1,700** non-holdout copies, exits copied and held
24 h, at D = 0, each equal to its reference to 1e-9 bps". And a new one:

> - **d and x′** (the reading H1 made decide): for every entry the reproduction prices, d by `judge.ts`
>   (C10: the line's accounts at M, the week of M, distinct trades, market trades only) equal to its
>   reference to 1e-9 bps, the reference's removal lists taking the same fills; null for the same reason
>   where the reference is null; and x′ = d − the cost of the kit's `leg` at 24 h.

C9's test list gains: "the object equal, field for field, to the kit's `marketFrom` on a made-up panel that
ends before the kit's cut (the 5-minute rule)". If the script behind FIND-3's 1,086 is at hand, that count is
a further anchor (question 5).

**RM7. FRESH-2's stage: what the engine reads, which stores it holds, and the seal that opens it (C0 seal 4,
C14 terms 4).**

- "The labels at FRESH-2's Mondays from S's and FRESH-2's fills" is right for labels (90 days back from
  2026-11-16 lies in S). But C4's events and C5's habits run "from ARCHIVE_START", so the stage needs E's
  store too. Nothing holds E's and S's stores to their hashes there.
- Seal 4 says "until FRESH-2's freeze every reader refuses a key at or after END_S", and C14 has the stage
  run by "the one frozen at freeze 1". So the frozen program must carry the state that opens FRESH-2, and no
  rule says what opens it. (COPYH-STORE's `seal.ts` seals FRESH-2 always, with two states: section 5.)

*Exact wording.* C0, seal 4:

> 4. **FRESH-2 is not downloaded before step 2's report is recorded** in decisions, and then only if a yes
>    needs confirming (C14). Every reader refuses a key at or after END_S, open or not, but the `fresh2`
>    command under a verified FRESH-2 freeze, which reads FRESH-2's store (`FRESH2_STORE`) and refuses any
>    fill, row or minute at or after END_F2.

C14, FRESH-2's terms, 4:

> 4. **The run** (`dist\copyh.js fresh2`; the gate at FRESH-2's freeze; the settings of step 2 and
>    `FRESH2_STORE`, read only), as step 2's: a second run refuses (exit 5); FRESH-2's pass twice and held
>    equal (exit 7); its integrity; E's and S's stores held to the SHA-256s that steps 1 and 2 named (exit 5
>    otherwise); the engine on E ∪ S ∪ FRESH-2 at END_F2 — C4's events and C5's habits from ARCHIVE_START,
>    C2's vault accounts and C4's accounts the kit cannot hold counted to END_F2 — every part twice; the
>    labels at FRESH-2's Mondays, each from the fills before its M; the tripwire on each judged set (C16);
>    then `fresh2\result.json` first, `positions.jsonl.gz`, `report.json`.

**RM8. After the rehearsal's counts are seen, this file should change only by its set values; and H1's
measured ratio has no reader (C15 (c), C17).**

- The rehearsal prints MAIN's long share day by day over all of E. With public prices that hints at the
  money's sign by day (the plan review said the same of one week's 66%). Nothing may then be tuned, and the
  draft does not say that this file is closed to all but its set values from that moment.
- C15 (c) 4 has "the rules review" read the ratio "real ÷ read". The rules review is this one, and it runs
  before the rehearsal exists. So the measurement has no reader, and nothing says what it may do.

*Exact wording,* at the head of C15 (c):

> The rehearsal on real months first runs after this file's rules review and its fix round are closed in
> decisions. From then on this file changes only in its `[SET BEFORE THE FREEZE]` values, each by the rule
> written beside it, and in what the code review's fix round names in a decisions entry with the reason no
> count seen can have chosen it.

and in (c) 4, in place of "from which the rules review reads the ratio 'real ÷ read' by the review's
section 6 formula":

> from which the build's fix-check computes the ratio "real ÷ read" by the plan review's section 6 formula,
> recorded in decisions before the freeze. It changes no rule; if it lies outside the plan review's grid
> (its `r1-power.mjs`, sections E and F), the plan gate is read again before the freeze.

### Low

**RL1. A wrong reference (C1).** "A fill file holds its writer's hour (WAVE-H's H11)": WAVE-H's H11 is its
statistic; the sentence is in its H1, under DATA END. *Wording:* "(WAVE-H's rules, H1, DATA END)".

**RL2. "R…" has two meanings in this file, and five names of frozen code are not used (the intro, C4, C7,
C13).**

- The intro says "R…" is the paper experiment's rule. But "R8's delay" is the research R8's (the paper's
  rule for D is R4), and "R3's pooled daily e-value" is the research R3's (the paper's R3 is its fills).
- The closure already holds the code for both, and for three lines beside: `dist/paper/stats.js`'s
  `dailyEValue` and `smallestEdge`, and `dist/paper/copy.js`'s `stopInstant`, `DAYS7_MS` and `jumpRatio`.
  Naming them keeps the builder from writing a second copy.

*Wording.* The intro gains: "A research report is named in full ('the research R8'); 'R…' alone is always a
rule of the paper experiment. 's6' to 's8' are the planner's scripts (the plan's section 11)."
The first paragraph and C4: "R4's delay (the research R8's 62–95 s)". C7's rows for STOP2, STOP5, DAYS7 and
JUMP gain: "by `dist/paper/copy.js`'s `stopInstant`, `DAYS7_MS` and `jumpRatio`, unchanged". C13: "the
pooled daily e-value (R14; `dist/paper/stats.js`'s `dailyEValue`: one vote a UTC day of t + D, the sign of
the day's mean d, a day within ±0.1 bps a tie, dropped)".

**RL3. The 60-minute settlement mark is not exact to the minute (C9, C16, C18).** The kit's "5 minutes'
staleness" reads six minutes (`panel.mjs`: the minute that ends at the hour and the five before it), and C16
says so: "the 6 minutes before the hour". By the same reading "at most 60 minutes old" is 61 minutes; C16
says "the 60 minutes before the hour". The tripwire is meant to be exact, so the two must agree.

*Wording.* C9: "each settlement at the coin's latest minute mark among the minute that ends at the hour and
the 60 before it (the kit's rule with a staleness of 60 minutes in place of 5; where the kit's rule finds a
mark, this one finds the same)". C16, reason 2: "under C9's 60-minute rule, if it is set, the 61 minutes
before the hour". C18's row stays, its 5 or 60 being that staleness.

**RL4. The label check's pass mark has no stated denominator (C15 (c) 7).** "MAIN's membership differs for
under 1% of MAIN's accounts": of MAIN under which capture, and membership of what, since MAIN is a rule on
entries? With about 434 MAIN accounts in the slice (13,900 ÷ 32) the mark allows 4 to differ. *Wording:*

> the label and MAIN's account-level conditions (C7: P1, the habit window covered, median hold ≥ 6 h, at
> least 3 closed cycles) from C5's 90-day capture against the whole capture from ARCHIVE_START, every
> difference listed. **Its pass mark, fixed now: at each of the four Mondays, the accounts that meet the
> conditions under one capture and not under the other number under 1% of those that meet them under the
> whole capture.**

**RL5. A coin of E's records that `meta` lacks, met before the freeze (C3).** "A kept record whose coin is
not in the list stops the step"; the route out is written for step 2 and FRESH-2 only. The rehearsal can
meet it first (a renamed coin would do it). *Wording,* added to the `coins.json` bullet:

> Before the freeze, a kept record of E whose coin the reply lacks stops the rehearsal's pass; the supervisor
> rules it in a decisions entry from the name alone: the coin is appended after the reply's coins (it has no
> funding rows), or its records are left out and counted as their own kind.

**RL6. Three covariates of a try (C14).**

- "the trader's own priced MAIN copies before M (their count, …)": whether an earlier copy was *priced* can
  depend on marks after M. *Wording:* "the trader's own MAIN copies whose follow instant and every leg lie
  before M: their count and their mean net".
- "median hold" is listed with the habits, and then again as "the trader's usual hold at M". *Wording:* once,
  "(closed cycles; median hold, the trader's usual hold at M, never the copy's own; long share; entries)".
- A try on BROAD meets traders with no MAIN copy. *Wording:* "A condition on a covariate the copy lacks is
  false."

**RL7. Two files that the looks read are not named in the freeze, and two have no named writer (C0, C3, C9,
C13, C15 (c)).**

- C13 copies the calibration prints "by SHA-256"; C15 (c) 10 has step 1 compare its hash "to the last
  rehearsal's"; C17 sets values "from the rehearsal's recorded counts". No file is named for either.
- `coins.json` is "the list of one `meta` reply … stored raw … by the funding fetch": the fetch stores
  `info/meta.json`; nothing says what writes `coins.json` from it.

*Wording.* C0's list of files required by name gains "`calibration.json` (C13) and `rehearsal.json` (C15
(c): the counts that set this file's values, the label check's result, and the two-week copies' SHA-256)".
C15 (c) 10: "compares its hash to `copyh/rehearsal.json`'s". C3: "`coins.json` is written by `dist\copyh.js
coins` from the stored reply, held to the store's manifest."

**RL8. C12's and C14's last small cases.**

- **More than one case can apply.** Of the TOO FEW states, ten hold two cases at once: (a) or (b) with (c),
  (d) or (e) (section 9). "The first case that applies" then leaves out the other fact. *Wording:* "every
  case that applies, in this order".
- The last sentence lacks the others' opening. *Wording:* "Too few to tell: no mean result as large as X bps
  a copy was seen."
- **Empty sets.** *Wording,* added to C12's readings: "A set with no copy is TOO FEW TO TELL (no error). A
  mean over no copy is not above 0." (The paper's own edge fix did the same: decisions 2026-11-12, the
  freeze.)
- **The choice's two conditions do not say of what.** *Wording:* "the mean of its traders' own means of x
  > 0, and its mean of x without its two best days (the two UTC days of t + D with the largest sums of x)
  > 0".

**RL9. The smallest edge (C13).** "√(the days so far ÷ 504)" does not say which days, and it is printed for
the money's SE alone, the error H1 found too small. *Wording:* "(2.43 + 0.8416) × SE × √((END_E − M₀) ÷
(END_S − M₀)), and the same with SE′".

**RL10. C18 lacks numbers the text fixes; and the frozen file must hold no open marker.**

*Wording,* rows to add:

> | switch hour | 2025-07-27T08:00:00.000Z |
> | exact digits of sz and startPosition | 15 |
> | choice best days left out | 2 |
> | concentration best days, top traders' share, top traders | 2 0.01 10 |
> | worker heap cap GB | 20 |
> | float residue bounds | 1e-9 1e-6 |
> | venue fee a side, Binance | 0.0005 |

and in C17: "`tools/copyh-freeze.cjs --final` refuses this file while it holds `[SET BEFORE THE FREEZE` or
`[OPEN Q`."

**RL11. Three small clarities (C1, C3, C15 (c)).**

- C1's table gives S's Mondays as 2026-06-01 → 2026-11-09; the note below it is right. *Wording,* in the
  cell: "2026-06-01 → 2026-11-09 (an entry of its first three days has M = 2026-05-25)".
- `coins.json` keeps `isDelisted` "as read", on 2026-11-25, which is inside FRESH-2's months. No rule reads
  it. *Wording:* "No rule reads the flag: a delisting is the Settlement record (C6)."
- The rehearsal should show what the Settlement rule costs. *Wording,* added to C15 (c) 1: "each coin's first
  Settlement instant, and its market trades and MAIN's entries after it".

**RL12. The closure's equality needs its date (C0; the supervisor's Q9).** "Each equal, byte for byte, to its
line in that program's own freeze list": once the paper is re-frozen, which list? *Wording:* "to its line in
that program's freeze list at COPY-H's freeze commit".

**RL13. "About half" (C9).** The tool reads once every 6 s, at most 44 weight a read: 440 of 1,200 a minute.
*Wording:* "at most half of the published 1,200 weight a minute".

## 2. The brief's eight checks

| # | Check | Result |
|---|---|---|
| 1 | Faithful to the sources | **Yes.** Nothing missing. One fix weakened (H1's fix 7 has no reader: RM8). Section 2.1 |
| 2 | No choosing month judges; no outcome before the freeze | **Holds,** with two limits: S's direction is public for a filter by side (RM3); the file should close when the rehearsal's counts are seen (RM8) |
| 3 | The verdicts complete and computable | **MAIN's: yes.** A filter's on S and on FRESH-2: gaps (RM1) |
| 4 | The paper's rules mapped without a silent change | **Yes.** One mapped rule may hide a bias on this venue (RM4); the known-answer test misses d and the market object (RM6). Section 2.4 |
| 5 | Every number fixed, or set by a fixed rule | **Two of the three set values, yes.** EVENTS_MAX is not (RH1 b). Seven rows are missing from C18 (RL10) |
| 6 | The 13 provisional rulings | Agree with eleven, two of them with an addition (Q2, Q6); change one (Q1); Q13 is replaced by the store's ruling 11. Section 3 |
| 7 | What the builders wrote | Twenty-three mismatches, most of them parts not built yet. Section 5 |
| 8 | Simplicity | Three places. Section 6 |

### 2.1 Faithful to the sources

COPYH-RULES' `progress.md` holds no table of where each fix landed, and the decisions entry points to its
report, which I was not given. So I checked each fix against the text itself.

| The source | Where it is | Exact? |
|---|---|---|
| H1, fixes 1–6 and 8 | the intro; C10 (x′); C12 (the pair, SE′, the sentences, "what the money's SE is"); C13; C14 | yes |
| H1, fix 7 | C15 (c) 4 | the counts, yes; their reader, no (RM8) |
| H2 (a) | C0 and C14, the owner's sentence letter for letter; the stop rule "after COPY-H's step 2" | yes |
| M1 | C3 (market trades, both records of a trade), C9, C10, C13 (the cascade print) | yes |
| M2 | C16, reason 2; C15 (c) 3; C9's switch at 0.5% | yes (RL3) |
| M3 | C5; C15 (c) 7 and 8 | yes (RL4) |
| M4 | C2; C4; C15 (c) 5; the engine's guard | the case is named; its measure is not sound (RH1 b) |
| M5 | C14: no try from the wave's family; z 2.99 at k = 18; Holm's m = 2; "the trader's usual hold at M" | yes |
| M6 | C9 (thin legs); C12's third sign condition; C13 | yes |
| M7 | C7 (DELAY0, LAST, no SPEED); C9 | yes |
| M8 | the intro: 28 copies, $42, ±$183, 75 weeks; 141, $212, ±$410, 15 | yes (recomputed) |
| M9 | C15 (c) 10; seal 1 | yes |
| L1–L9 | C1; C2 and C3; C3, C4 and C5; C15 (a); C0; C9; C15; C13; C14 | yes |
| The owner's rulings 1–8 | throughout; 6 in C9 and C12; 7 in C1 | yes |
| The plan review's 2.1 (the mended sentence) | C1, "The looks" | yes |

**Added without a source, each sensible and each named here:** the stop on a funding file (RH1 e); MAIN's
removal set for the lines made of MAIN's copies; WITHHELD at the confirmation and at the seal (RM1); the
sealed rehearsal store; five TOO FEW sentences where H1 asked for one; each line's own d; and a try as
compiled code, where the plan had only "declares its tries" (section 6, S1).

### 2.2 No month that chooses judges, and no outcome before the freeze

- **MAIN:** frozen 2026-11-12 on Polymarket's weeks; judged on E, then on E ∪ S; a KEEP confirmed on FRESH-2
  alone. Its three set values come from counts (RH1 b and c mend two of their rules).
- **A try:** chosen on E after look 1 is recorded; confirmed on S alone; judged on FRESH-2 alone. C1's
  sentence says it plainly.
- **Before the freeze** only WAVE-H's raw store is opened. Seal 1 and C15 (c) hold: every rehearsal print is
  a count of instants, sizes, labels and memberships, or two prices of one moment. The one priced
  computation is in memory and gives a hash.
- **FRESH-2:** no key at or after END_S is read; the funding fetch ends at END_S; `coins.json` is today's
  `meta`, whose delisting flag no rule reads (RL11).
- **The reproduction** prices Polymarket's weeks before the cut, whose answers are on record: no new look.
- **Two limits:** RM3 and RM8.

### 2.3 The verdicts

- **C12:** WITHHELD, then no error, then DROP, then KEEP, then TOO FEW. I listed all 32 states of (each
  upper bound under +10, each lower bound above 0, the sign conditions): every one has a reading, and none
  is without a sentence. "No bound is reached" is exactly: both upper bounds at +10 or more and both lower
  bounds at 0 or less. DROP before KEEP is the paper's Q-G. A disagreement between the money and the edge
  over the market always reads TOO FEW, with its case named (RL8 prints every case).
- **Holm (Q8):** s = min(m ÷ SE, m′ ÷ SE′) is the right order. A try passes only when both bounds pass, so
  its p-value is the larger of the two, which is the smaller ratio. RM1 writes the order's ties and the
  readings.
- **The error budget:** 2.5% × 2.5% = 0.0625% for one useless try, as C14 says; for two chosen tries
  together at most 2.5% × 5% = 0.125%. It rests on SE′ being honest, which is why the pair matters; and it
  does not hold for a filter by side on S (RM3).
- **One thing to know; I ask no change.** Where the week's error is the larger one, S gives it about 24
  clusters and FRESH-2 26. A normal bar is then a little generous: by Student's t, 1.25% reads 1.75%, 2.5%
  reads 3.1% and MAIN's 5% reads 5.6% (section 9). The bars are the owner's, and the look prints R14's t
  band beside.

### 2.4 The paper's rules, mapped

| The paper's rule | COPY-H | My check, against the kit's code |
|---|---|---|
| R3 fills, "covered" | C3 | Mapped. The archive holds every trade, so a window is covered; holes make gap copies. The store's eight wordings: section 4 |
| `normFill` | C3 | Faithful. The kit keys an event by the *text* of prevS, so one value must have one text: the store's ruling 5 gives that |
| R4 | C4 | Unchanged. `entryId` holds the iid; D lies in [62.14 s, 95.44 s) |
| R5 | C5 | "From the fills before M only" kept. The 90-day capture is given with `oldest` at or before M − 14 d, so the classifier's window is whole (`classifier.mjs`, line 99). **The pnl proof holds:** the churner rule needs 5 fast trips and a share of 0.5; the gray rule 3 and 0.25 (`classifier-v1.json`) |
| R6 | C6 | Mapped: "on or before t's UTC day" is kept, look-ahead and all, as in the paper. RM4 |
| R7 | C7 | MAIN word for word |
| R8 | C8 | Unchanged: `planCopyThrough` takes END as its parameter |
| R9 | C9 | **Changed, and declared:** fee, spread, marks, funding |
| R10 | C10 | Unchanged, on market trades only. `removalOf` keys a trade by (tid, iid, t), as C10 says. The voted formula is the paper's |
| R11 | C11 | Unchanged; the third gap case is rightly gone. RM4 |
| R12 | C12 | Extended as ruled. 2.81 and 2.43 are the paper's L1 and L2 |
| R13 | C7 | As written there (RL2 names the code) |

- **`marketThrough` in place of `marketFrom`.** The kit's `marketFrom` refuses an end after its cut, so the
  paper's form is the right one. The draft does not call the paper's function; it builds the object in
  `markets.ts` "step for step". That is the right choice (the paper's function cannot take the 60-minute
  rule, and would pull two more files into the closure), and it is why RM6 asks for the test that holds the
  two equal.
- **The 90-day bound** binds at 40 of E's 48 Mondays, from 2025-08-25, and at all four check Mondays. At
  about 434 accounts a true difference rate of 0.5% passes one Monday 93% of the time, 0.7% 81%, 1.5% 22%.
  The check is strict the safe way: a failure only returns the label to R5's own capture.
- **The 1,700.** Decisions 2026-11-12: "FIND-6-EXITS 1,700 of 1,700 non-holdout copies equal with 0
  difference (exits copied, held 24 h, D = 0; the 218 others are holdout accounts, never opened)";
  FIND-6-EXITS's record names 1,918. So 1,700 is right and the plan's 1,918 was not (Q10).

### 2.5 The numbers

- **Recomputed** (section 9): every z; the instants' weekdays; M₀ as the first Monday with 30 days before
  it; 333.08, 170.92 and 504 days; 182 days and 4,368 files for FRESH-2; M8's line.
- **The settlement mark's switch** is set by a count before any price, and the 60-minute rule changes no
  copy the kit's rule prices: it only prices more. It cannot be tuned.
- **The heap** is a ceiling and changes no output (RH1 c).
- **EVENTS_MAX** has no written rule (RH1 b).

## 3. The supervisor's 13 provisional rulings

| Q | The ruling | My view |
|---|---|---|
| 1 | EVENTS_MAX: twice the largest P1 account's count on E, within one part | **Change.** A count of events does not bound the kit's work, and the ruling does not say what follows when the largest account does not fit one part. Count the kit's own work, the exit rows, against a number fixed now (RH1 b) |
| 2 | The heap: twice the rehearsal's peak, at most 20 GB, parts cut smaller above that | **Agree,** with one addition: the rehearsal sees E alone, so a later step may raise the ceiling by a setting, never lower it (RH1 c) |
| 3 | A failed label check reads the whole capture (R5); no second bound | **Agree.** It returns to the paper's own rule, and a second bound would be a number chosen on a count. Its cost is machine time: about three times the label step's work over 72 weeks (section 9) |
| 4 | Every engine part runs twice in separate processes, held equal | **Agree.** This PC has flipped bits; the review's other option covers only the buckets a reviewer picks |
| 5 | The slice is 0 mod 32 | **Agree.** Any slice named now; this one is eight whole buckets of the 256 |
| 6 | Taker records printed by `dir` and method in the rehearsal; any vault taker leaves the tape like ADL, ruled before the freeze | **Agree with the rule; write it now.** A netting inside the protocol's vault is no public trade, whatever its count. *Wording* for C3's market trades: "… and its `dir` is none of 'Auto-Deleveraging', 'Settlement' and 'Net Child Vaults'", and the `[OPEN Q6]` marker leaves. The rehearsal still prints the counts |
| 7 | RANK's fifth is the top ⌈n ÷ 5⌉, ties by address | **Agree.** Add "the smaller address first" |
| 8 | Holm orders by min(m ÷ SE, m′ ÷ SE′) | **Agree** (section 2.3). RM1 adds the ties and the readings |
| 9 | COPY-H's list never changes; it runs from its own tag's build | **Agree.** A changed closure file changes what COPY-H computes, so only COPY-H's own defect route may bring it in. RL12 dates the equality |
| 10 | 1,700 of 1,700 | **Agree** (section 2.4). RM6 adds "at D = 0" and d |
| 11 | FRESH-2's reads are asked of the owner only when needed | **Agree.** New network use is the owner's under Iron Rule 1, and nothing is fetched unless a yes needs confirming |
| 12 | `coins.json` from the funding fetch's first stored `meta` | **Agree.** One stored reply with its instant and hash; the index is Hyperliquid's own asset id. RL5 covers a coin it lacks |
| 13 | The sample days: three on E, two on S | **Replaced** by the store's ruling 11 (section 4, D11): more days, cheap |

## 4. COPYH-STORE's 15 differences, each against the rule's purpose, with its wording

The supervisor ruled all 15 as the builder recommends. **I agree with all 15.** Two need a consequence
written beside them (D7, D8), and one needs its dates (D11).

**D1. The three outcome fields are cut from the bytes before `JSON.parse` (C3, the boundary).** The purpose
is that no object ever holds `closedPnl`, `fee` or `builderFee`. A cut before the parse is at least as
strong, if both paths are pinned. *Wording,* in place of the boundary's second bullet:

> - **`closedPnl`, `fee` and `builderFee` never reach an object:** each is cut, key and value, from a
>   record's bytes before `JSON.parse`; a record whose text the cut cannot settle is parsed with a reviver
>   that drops the three at any depth. So no line of COPY-H can read them. On either path an `oid` or `tid`
>   of 16 digits or more is read from its digits (`context.source`). A record that then does not parse fails
>   the boundary.

The test's words become "both paths drop the three fields before any object holds them". `schema.ts`
(`cutText`, `parseFast`, `parseSlow`) does this.

**D2. The switch hour's duplicate key gains side and `crossed`; a dropped duplicate market taker stops the
build (C3, "Kept").** The two more fields keep apart the two legs of a trade an account made with itself.
The stop can only fire in the switch hour, which is in E, so before the freeze. *Wording,* in place of the
bullet's last sentence:

> In the switch hour's two files a record found in both (the same user, coin, `tid`, `time`, `side` and
> `crossed`) counts once, the first file's kept, and is counted. If it is a market trade's taker record the
> build stops (exit 5) for a ruling before the freeze: the files were measured disjoint (external-apis,
> EXTRACT-BUILD's checks), and a dropped taker would change a minute's bar.

**One point on its scope.** COPYH-STORE's working tree (`merge.ts`, not committed at 21:14Z) drops such a
second record wherever it stands, not only between the switch hour's two files. Outside that hour there is
one file an hour and no second format, so the same six fields twice are two records the archive wrote. I
recommend the rule's scope, the switch hour's two files: the stop can then fire only in E, before the
freeze, and RH1 gains no eighth case. If the wider scope is kept, the rule must say so and write what a
"market taker twice" in S may lead to.

**D3 and D4. Chains are taken in the order of `startPosition` along the order's side, and the head is
computed when an account is read (C3, "Chain heads").**

- D3 agrees with the draft wherever the archive lists a chain in its own order, and also links one listed
  out of order. That serves the mapping's purpose, one order event a matching event, and the rule no longer
  hangs on the file's order. Two chains with one head value still merge in the kit either way (its key holds
  no time): unchanged.
- D4: a matching event's fills share their user and `time`, so one bucket and one month hold them all, and
  the head read there is the same. The engine's twin covers the computation.

*Wording,* in place of the bullet's text from "one **matching event**'s fills" to "Every fill takes its
chain head's `startPosition`.":

> one **matching event**'s fills — the same user, `oid`, coin and `time` — are split into chains when the
> account's fills are read (`chains.ts`; the store keeps each fill's own `startPosition`, never its head's).
> The event's fills are taken in the order of their `startPosition` along the order's side (rising for "B",
> falling for "A"; the pass's order where two are equal). A fill b follows a fill a that no fill follows yet
> and whose `startPosition` plus its signed size (+`sz` for "B", −`sz` for "A") equals b's `startPosition`
> **exactly, as decimal numbers (scaled integers, never floats)**; when two could precede b, the one earlier
> in the pass's order does; otherwise b heads a new chain. Every fill takes its chain head's
> `startPosition`.

The chain test gains "a chain the archive lists out of order". The store's `fills` bullet loses "and its
chain head's". `chains.ts` and `normalize.ts` do this; the draft's "the earliest earlier fill" is the code's
"the one earlier in the archive" only in the pass's order, so the wording above says it the code's way.

**D5. `startPosition` is stored as a double, checked at parse to at most 15 significant digits (C3).** The
kit keys an event by the *text* of prevS (`fills.mjs`, `entries.mjs`), so "1.0" and "1" would be two events;
one text a value is safer than the archive's own text. Fifteen digits is the limit under which decimal text
and a double give each other back exactly. *Wording.* The boundary: "`sz` is unsigned decimal text and
`startPosition` signed decimal text, each of at most 15 significant digits (a record with more fails the
boundary), so a double holds each exactly". "Normalized": "**prevS = the chain head's `startPosition` as the
shortest text of its double** (one text a value, so that the kit's event key cannot split one position in
two), prev = Number(prevS)". The store: "`startPosition` as a double (exact: the boundary's 15 digits)".
`schema.ts` has the check (`exactInDouble`) beside its schema; what a record with more digits then does is
in the pass, not yet written, and the wording above settles it.

**D6. The pass's order is kept by the rows' order and a file column (C3, the store).** The readers of that
order are the chain's ties, inside one user and `time`, and the kit's own stable sort; the bars' ties and
the pairs are made in the pass itself. Enough. *Wording,* at the end of the `fills` bullet: "an account's
rows in `time` order, equal times in the pass's order (files in time order, records in file order), each
with its file".

**D7. No minute and no pair is shared by two stores (C1, C3).** Each store keeps only records timed in its
own window. The cost is the fills timed in E's last seconds that sit in S's first file (and S's in
FRESH-2's): a few records at each boundary, kept by no store. The gain is that E's store at step 2 is
step 1's, byte for byte, with no join. I agree, with the consequence written. *Wording.* C1's bullet:

> - **A fill file holds its writer's hour** (WAVE-H's rules, H1), so a fill timed in a stage's last seconds
>   can sit in the next stage's first file. Each store keeps the records of its own files timed in its own
>   window, so such a fill is kept by no store: it is counted when that file is read, the stage's last
>   minute's mark lacks it, and its account's next event shows a chain break (a gap copy, C11). Every exit
>   leg lies at least 62 s after its exit (C4's D), so nothing else of a copy can change.

C3's store, last bullet: "No minute and no pair is shared by two stores (C1)."

**D8. The pairs stay "consecutive in `time`, ties in the pass's order", with a guard on an out-of-order
market taker across files (C9).** Agreed; the guard needs its outcome (RH1 f). *Wording,* added to the spread
bullet:

> The build takes each file's records in `time` order and joins the files in order. A file whose first
> market-trade taker record of a coin is timed before that coin's last one in the file before it stops the
> build (exit 5): the code then cannot give the pairs and the last prices this rule defines, which is a
> defect, fixed by C0's route with a sort across the two files.

(The working tree's `merge.ts` has the guard coin by coin, as worded here.)

**D9. Exit 3, "not finished, run again" (C15).** Agreed. A step now takes many runs, so "a second step
refuses" needs its clause. *Wording.* The exit codes gain "3 not finished: its minutes are spent or a closed
window began; run it again". The "Parts" bullet becomes:

> - **Parts and runs** (the plan's question 8): every heavy command is a chain of resumable parts, each
>   written whole (`.tmp`, then renamed). A run starts no new part once 14 minutes are spent or a closed
>   window has begun, so that with the work in flight it ends inside 15, and exits 3; the next run resumes
>   from the whole parts. A crash loses at most the part it was in, and a resumed command's output equals an
>   unbroken one's. A step is run again after each exit 3 until its `result.json` exists; from then on it
>   refuses (exit 5). **A run that crashes before its result exists is not a look.**

**D10. The heap: three times the synthetic peaks until the rehearsal, twice the rehearsal's largest at the
freeze (C15).** Agreed; what holds before the freeze is no rule of the test. *Wording,* inside the heap's
bracket: "until the rehearsal, three times the peaks measured on synthetic data at full size". After the
freeze: RH1 (c).

**D11. The integrity's sample days: the analyzer's G6 days on E, and S's monthly 15th (C15, C18).** Agreed:
more days, cheap, and days that an earlier program already re-read. **The dates must stand in the frozen
file.** The analyzer's list in the code (`src/polish/gates.ts`, `WAVEH_EXPECTED.sampleDays`) holds 15 days,
and the ruling says 14 (question 6). *Wording.* C15, step 1, 3: "the sample days re-read cell by cell by an
independent reader (`reread.ts`, sharing no code with the pass): the analyzer's G6 days (C18)". Step 2, 2:
"its sample days the 15th of each of S's months (C18)". C18:

> | sample days, E | 2025-05-31 2025-06-01 2025-06-15 2025-07-27 2025-08-15 2025-09-15 2025-10-10 2025-11-15 2025-12-15 2026-01-15 2026-02-15 2026-03-15 2026-04-15 2026-05-28 2026-05-29 |
> | sample days, S | 2026-06-15 2026-07-15 2026-08-15 2026-09-15 2026-10-15 2026-11-15 |

(the E row less the day the ruling leaves out).

**D12. The integrity counts matching events with more than one chain; the engine counts lib-exits'
`chainBreaks` (C15).** Agreed: `chainBreaks` needs the kit's events, which only built accounts have (M4).
*Wording.* C15 (c) 1: "the holes; the matching events with more than one chain (C3)". Step 1, 3: "C3's
counts, the holes and the matching events with more than one chain". Step 1, 4: "… and the legs' instants;
the chain breaks (lib-exits' `chainBreaks`) of the accounts it builds".

**D13. `design.ts` holds every number; `instants.ts` only C1's functions.** Agreed: one home, as C18 already
says. *Wording,* C1's last bullet: "To be built in `src/copyh/instants.ts` (an instant's stage, Monday, UTC
day, week and month; the instants themselves are `design.ts`'s, C18)".

**D14. The closure also names WAVE-H's three files and lz4js's three (C0).** Agreed. I found each of the
eleven files below in its own program's list: the experiment's lines 8, 19 and 25; the exam's lines 26 and
36; WAVE-H's lines 12, 13, 16 and 72–74. `keys.js` imports `instants.js`, and `lz4.js` loads lz4js. *Wording,* in place of the
sentence that begins "Named now:":

> Named now: `dist/paper/copy.js` (`planCopyThrough`, and R13's `stopInstant`, `DAYS7_MS` and `jumpRatio`),
> `dist/paper/stats.js` (`twoWay`, `dailyEValue`, `smallestEdge`; also in MARKET-1's list) and
> `dist/paper/research.js` (the kit's loader and fingerprint check), in `experiment/FROZEN.sha256`;
> `dist/polish/lz4.js` (the pass's LZ4 decoder) and `dist/polish/tables.js` (the store's table format), in
> `polish/FROZEN.sha256`; `dist/waveh/keys.js` and `dist/waveh/instants.js` (`keyDate`, the one parser of a
> key's date) and `dist/waveh/lz4.js` (the independent reader's decoder, C15), in `waveh/FROZEN.sha256`;
> and lz4js's three files (`node_modules/lz4js/lz4.js`, `util.js`, `xxh32.js`), as WAVE-H's and the exam's
> lists name them.

(`dist/polish/tables.js` is the working tree's addition at 21:14Z; it is the exam's line 36 and imports
nothing.)

**D15. One exception to seal 5, for the paper's seed (C0, C15 (a)).** Agreed. The seal as committed
(`74dec98`) is stronger than the draft's list: it refuses every path outside the run's own folders, so the
seed is one folder more for one command, not a gap in a list. The rule should say it the code's way.
*Wording,* in place of seal 5:

> 5. **Always:** every reader refuses a path outside the run's roots, the folders its settings name, by its
>    name and then by its real path; and inside them the analyzer's folders (`…\ANALYZER\`: the exam's
>    stores, look 1's outputs, the `liq` table that holds `closedPnl`). So the collector's data, the paper
>    experiment's and MARKET-1's run folders and logs, the kit's holdout files and everything of
>    polymarket-lab are never reached. One command has one root more: `reproduce` reads the paper's seed
>    folder (`PAPER_SEED`), each file held to its line in `experiment/seed.sha256` before it is parsed.

The seal's test list gains "a path outside the roots; a junction inside a root that leads out of it". The
kit's panel needs no root of its own if the kit reads it where the kit keeps it (question 7).

## 5. Mismatches between the rules and what the builders wrote

Read only where a rule's wording must match (C0–C3, C9, C15, C16). I do not judge the code. Most of these
are parts not built yet; each is named so that the rule and the code end equal.

**`src/copyh/gate.ts`**

1. **The closure.** The code lists `dist/waveh/instants.js`, `dist/waveh/keys.js` and lz4js's three files; C0
   lists the paper's three and `dist/polish/lz4.js`. D14 makes the rule the union of both.
2. **The kit's check.** The gate does not call `checkKit()` or hold lib-exits to its hash; C0's gate does
   ("and the kit's `checkKit()` returns its fingerprint and lib-exits its hash").
3. **The step's list.** The gate accepts any `copyh-freeze-<n>` for either step, and `sealOf` opens S for
   step "2" on any verified list. C15 puts step 1 "at `copyh-freeze-1`" and step 2 "at `copyh-freeze-2`".
   RM2's wording is the one to build: S opens only under a list that holds `copyh/look1.sha256` and
   `copyh/choice.json`.
4. **Two steps only.** Nothing yet lets the rounds run beside the list step 1 ran under (C14), or FRESH-2's
   stage run (RM7).

**`src/copyh/seal.ts`**

5. FRESH-2's folder and every key at or after END_S are refused "always"; seal 4 says "until FRESH-2's
   freeze" (RM7's wording).
6. Seal 5 is built another way than it is written. The rule lists the folders never opened; the code
   (`checkInside`) refuses every path outside the run's roots, by name and then by real path, and keeps
   only FRESH-2's and the analyzer's folders as names. The code's way is the stronger one, and D15's
   wording takes it. The reproduction then needs its seed folder as a root, which is not there yet.
7. The seal knows S by its folders' names (`…\FRESH\store`, `…\COPY-H\S`); the rules name settings. No
   conflict. Seal 2's rule for funding rows ("whose hour is before END_E") is not built yet.

**`src/copyh/run.ts`**

8. Exit 3 exists; C15 has none (D9). C15's exit 2 (bad settings, a heap flag), the idle priority and the
   heap are not there yet.
9. The settings are COPYH_ROOT, WAVEH_STORE, COPYH_FUNDING and FRESH_STORE, each held to its folder's name.
   C15 also names PAPER_SEED and the kit's panel, C14 FRESH2_STORE, and RH1 (c) COPYH_HEAP_GB.

**`src/copyh/range.ts` and `design.ts`**

10. A third range, `burnin` ([ARCHIVE_START, M₀), 850 files), which no rule names (question 9).
11. "A store keeps the records of its own files whose `time` lies in its window" against C3's shared-minute
    bullet (D7 settles it the code's way).
12. `design.ts` holds the five instants, the switch hour, the closed windows, the part minutes and the
    store's numbers (the record-failure limit, the buckets, a hole's 60 s, a pair's 2 s, the 15 digits);
    the rest of C18 is to come. The switch hour and the 15 digits are in the code and not
    in C18 (RL10). It names the two `dir` values and the method that make a trade no market trade; Q6's
    rule adds "Net Child Vaults" (section 3).

**`tools/waveh-fetch.cjs`, its funding mode (`a0c7b9e`)**

13. Funding from M₀ in 26 windows of 20 days, split at END_E; C9 and C18 say from 2025-05-25 (RM5 moves
    the rule to the code).
14. The store's `funding.sha256` is written when a run ends, whatever is `left`; C9 says "every window's
    file" (RM5 has the freeze tool refuse a list that lacks one).
15. The tool's check of a reply (the coin asked, stamped in its window, in time order, no more rows than
    hours) is not C9's reader (the schema, and a nominal hour once). Both are needed; the reader's place is
    the freeze (RM5).

**The tests**

16. `test/copyh-instants.test.ts` pins `design.ts`'s instants and `range.ts`; C1 names `instants.ts` (D13).
    `test/copyh-run.test.ts` exists and no rule names it; C15's `copyh-steps.test.ts` is not written yet.

**The files of COPYH-STORE's second commit** (`a021779`: `schema.ts`, `chains.ts`, `normalize.ts`,
`coins.ts`, `dirs.ts`, `tools/copyh-freeze.cjs`, `copyh/data.sha256`)

17. `chains.ts`: when two fills could precede b, the code takes the one earlier in the archive; the draft
    says "the earliest earlier fill" (D3's wording follows the code).
18. `schema.ts`: `exactInDouble` stands beside the schema. The working tree's `scan.ts` counts a record
    with more than 15 significant digits as "refused", apart from the boundary's failures. D5's wording
    counts it with them, so that the day's 1% limit sees a format that changed.
19. `dirs.ts`: `dirs.json` holds each value and its kind, no count. C3's "values and counts only" reads as
    if the file held counts. *Wording:* "(written before the freeze from the rehearsal's count of each
    value, C15 (c); the file holds each value and its kind)".
20. `coins.ts`: `coins.json` also keeps each coin's `szDecimals`, which no rule names. Harmless; C3 can say
    "with its `szDecimals` and its `isDelisted` flag as read".
21. `tools/copyh-freeze.cjs` has `--data` only so far; C0's `--final`, C14's `--rounds` and `--fresh2`, and
    the freeze test's cases are to come.

**COPYH-STORE's working tree at 21:14Z** (the pass, the merge, the writers: `scan.ts`, `pass.ts`, `part.ts`,
`merge.ts`, `writers.ts`, `store.ts`, `market-trades.ts`; not committed, read by search only, and it may
still change)

22. `merge.ts` drops a second record of one (account, `time`, coin, `tid`, side, taker) wherever it stands;
    C3 and D2 speak of the switch hour's two files (D2's point on scope).
23. `gate.ts`'s closure now also holds `dist/polish/lz4.js` and `dist/polish/tables.js` (D14 names both).

**Equal, and worth saying:** `copyh/data.sha256` holds 8,845 and 4,102 lines from the two frozen lists, no
data file opened, as C3 says; the boundary's fields in `schema.ts` are C3's, one for one; `normalize.ts`
gives the kit's fields as C3 lists them; a coin's form (`coins.ts`) is C3's three tests. In the working
tree: a trade is read as C3 says (`market-trades.ts`; "Net Child Vaults" is not there yet, Q6); rows lie by
account and `time`, ties in the pass's order (D6); a record outside its store's window is counted, never
kept (D7); the guard on files out of time order is there, coin by coin (D8); the bars' last price takes
the later file on a tie.

## 6. Simplicity

**S1. A try can be data, not code (C14, C0, C15).**

- The plan said only that a round "declares its tries in `copyh/tries.md`". The draft made each try a
  compiled file under `dist/copyh/tries/`. That is new code that runs after the freeze, under a gate that
  must make an exception for it, on priced copies, before any fresh worker reads it.
- "A pure function of a copy's covariates" is what a list of conditions is. Nothing the rule allows is
  lost, and a try can then be nothing but a filter.

*Exact wording,* in place of C14's bullet that begins "At most **3 rounds**":

> - At most **3 rounds**, of at most **8, 6 and 4 tries** (18 in all). Each round declares its tries in
>   `copyh/tries.json` and is committed before it runs. **A try is data, never code:** its line (MAIN or
>   BROAD), its conditions, all of which must hold, and why, in words. A condition is a covariate's name, one
>   of ≥, >, ≤, <, = and "one of", and a constant or a list of constants. The frozen program reads them
>   (`dist\copyh.js tries --round <n>`): it refuses an uncommitted `tries.json`, a round before the one ahead
>   of it has been written, a fourth round and a try over the caps. No code is added after the freeze: the
>   rounds run under the gate of the list in force, which then allows, beside its list, only
>   `copyh/tries.json`; and the rounds' freeze adds only `copyh/tries.json`, `copyh/choice.json` and
>   `copyh/look1.sha256`.

`dist/copyh/tries/` then leaves C14 and C15, and the rounds' freeze holds no compiled file.

**S2. Two of the three values set from the rehearsal can go.** RH1 (b) fixes the kit's limit now, by a count
of the very work that breaks. RH1 (c) makes the heap a ceiling that may rise. Only the settlement mark's 5
or 60 minutes is then left to the rehearsal, by a rule that cannot be tuned.

**S3. The calibration against the books (C13, C15 (c) 11) is the costliest print.** It needs a reader of
book files in the frozen program, for a print that decides nothing; the `asset_ctxs` print already gives
every coin's mark and impact prices for every minute of E. I would keep it only if WAVE-H's book reader
serves it unchanged; the plan review's section 2.7 also named it as one to drop (question 10).

RL2 belongs here too: five functions of the frozen paper code serve C7's and C13's lines as they are.

## 7. Questions, each with a recommendation

1. **For the owner — copies still open when their coin is delisted (RM4):** value them at the settlement
   price, or drop them as the paper does? **Recommended: value them** (wording (a)). It is the price a
   follower would have had, it costs a few lines, and it removes a bias nobody can size before the look.
2. **For the owner — filters by side (RM3):** allowed or not? **Recommended: not allowed** (wording (a)).
   Longs and shorts stay printed apart. If you want them, wording (b) reads them against a null of their
   own side, at the price of one more column.
3. **EXITS_MAX in place of EVENTS_MAX (RH1 b), at 20,000,000?** **Recommended: yes.** If the count of events
   is kept instead, three things must still be written: its formula, what follows when the largest account
   does not fit one part, and what follows when an account under the bar breaks the kit at step 2.
4. **Tries as data (S1)?** **Recommended: yes.**
5. **d in the known-answer test (RM6):** as a comparison with the kit run directly on the seed?
   **Recommended: yes.** FIND-3's 1,086 as a further anchor only if its script is at hand: it used FIND-3's
   own removal set, which COPY-H's rule does not.
6. **The sample days on E (D11):** the ruling says 14, the analyzer's list holds 15. Which is left out?
   **Recommended:** write the dates into C18; keep all 15 unless one was dropped on purpose.
7. **The kit's panel for the reproduction:** from the kit's own path, or from the paper's copy?
   **Recommended: the kit's own path,** each file held to the kit's pinned hash as the kit does. The kit
   then reads it itself, the seal needs no root for it, and "the kit's panel" leaves C15's settings.
8. **H1's measured ratio (RM8):** who computes it, and when does this file close? **Recommended:** the
   build's fix-check computes it; the file closes at the rehearsal's first run on real months.
9. **The `burnin` range in `range.ts`:** **Recommended:** C15 says in one line what it is (a timing run on
   the five weeks that judge nothing), or it leaves the program before the freeze.
10. **The calibration against the books (S3):** **Recommended:** keep it only if WAVE-H's book reader serves
    it unchanged.

## 8. What I read, and what I did not

- **In full:** my brief; CLAUDE.md (the session's copy); code-rules; `copyh/rules.md`; COPYH-RULES'
  `progress.md`; the plan; the plan's review; decisions' fourteen entries of 2026-11-25, and of 2026-11-12
  the freeze, the favourites, the two fresh reviews' calls, PAPER-BUILD's calls and four questions, the plan
  approved, APPROACH-REVIEW accepted, the way forward and FIND-6-EXITS's result; FABLE-REVIEW's section 6;
  `experiment/rules.md`; external-apis' AWS and Hyperliquid sections; the kit's `fills`, `entries`, `labels`,
  `panel`, `returns`, `nulls` and `constants`, lib-exits, the classifier's `features` and `classify`; the
  paper's `copy.ts`; COPYH-STORE's ten source files and its freeze tool, as committed (`74dec98`,
  `a021779`); the funding mode's change to `tools/waveh-fetch.cjs` (`a0c7b9e`).
- **In part:** the paper's `market.ts` (`marketThrough`) and `stats.ts`; `polish/rules.md` (P0 and P1's
  freeze route); `waveh/rules.md` (H1 and H9, for two references); the three programs' freeze lists (for
  the closure's lines); `src/polish/gates.ts` (the sample days); the builders' tests, by their titles;
  COPYH-STORE's `progress.md`, the one section the coordinator named.
- **Not opened:** any data; HANDOVER, WORKFLOW, LESSONS and every other worker's folder; HL-FOLLOW-FACTS and
  the look's report (their facts are taken from decisions and external-apis); the planner's and the plan
  reviewer's scripts.
- **What this limits.**
  - COPYH-RULES' table of where each fix landed was not in the two places my brief names, so section 2.1 is
    my own reading.
  - RM3's loading and RM4's size are arithmetic, not measurements; no count of copies open across a
    delisting exists yet.
  - RH1 (b)'s 20,000,000 rests on my estimate of about 100 B an exit, which the rehearsal measures.
  - I did not read the supervisor's earlier rulings on COPYH-STORE's plan; I took them as its section and
    the coordinator's message state them.
  - D1 and D3 to D5 are checked against COPYH-STORE's committed code. Its pass, merge and writers stood in
    its working tree at 21:14Z, not committed: I searched them for what D2 and D6 to D8 word, and did not
    read them whole. They may still change.
  - The seal changed between my first reading and its commit (a list of folders became "inside the run's
    roots"); section 5 and D15 describe the committed one.

## 9. My arithmetic

Two scripts in my scratchpad (`…\scratchpad\COPYH-RULES-REVIEW\`), copied whole into my `progress.md` with
their outputs. Neither reads data.

| Script → output | What | SHA-256 |
|---|---|---|
| `q1-checks.mjs` → `q1-checks.out` (17:34Z) | the calendar; every z; M8's line; the label check's resolution; C12's 32 states; a side filter's loading; the kit's exit rows | `aa329cfb…c0a1` → `20e4dde6…c820` |
| `q2-t.mjs` → `q2-t.out` (17:53Z) | Student's t at the rules' normal bars, for the weeks S and FRESH-2 hold | `bd1037b3…f5de` → `1e585234…3945` |

- **The calendar.** M₀, END_S and END_F2 are Mondays; M₀ is the first Monday with 30 days of the archive
  before it. E is 333.08 days, S 170.92, together 504; FRESH-2 is 182 days, 26 weeks, 4,368 files. The
  Mondays: 48 in E, 24 in S, 26 in FRESH-2. The fill files: 8,845 for E, 4,102 for S, 850 before M₀. The
  four label-check dates are Mondays where the bound binds; it binds from 2025-08-25, at 40 of E's 48.
  Funding windows of 20 days from M₀: 17 in E and 9 in S.
- **The bars** (the normal's upper tail by Simpson's rule, the quantile by bisection): 2.8070 and 2.4324
  (two-sided 0.5% and 1.5%); 2.9913 (one-sided 2.5% ÷ 18); 2.2414 (1.25%); 1.9600 (2.5%); 1.6449 (5%);
  0.841621 (80% power). 2.5% × 2.5% = 0.0625%.
- **Student's t at those bars** (its density by Simpson's rule; the check: 2.064 on 24 degrees gives 2.499%):
  with 24 weekly clusters, 2.24 is one-sided 1.75% and 1.96 is 3.11%; with 26, 1.96 is 3.06% and 1.645 is
  5.62%. With S's 171 day clusters 2.24 is 1.32%; look 1's 48 weeks put 2.81 at 0.36%, against 0.25%.
- **M8's line:** 28.2 copies at +15 bps on $1,000 is $42 a week against ±$183 (345 bps a copy), 75 weeks to
  two errors; 141 copies give $212, ±$410 and 15 weeks. Equal to the rules' intro.
- **The label check.** "Under 1%" of n accounts allows ⌈n ÷ 100⌉ − 1 to differ: 0 at 100, 4 at 434. At 434
  accounts and a true rate r, one Monday passes with the Poisson chance of at most 4: 100% at 0.2%, 93% at
  0.5%, 81% at 0.7%, 22% at 1.5%.
- **C12's states.** With U and U′ for "the upper bound is under +10", L and L′ for "the lower bound is above
  0" and S for the sign conditions, the 32 states give: DROP when U and U′; else KEEP when L, L′ and S;
  else TOO FEW. No TOO FEW state is without a case. Ten hold two: (a) or (b) with (c), (d) or (e). "No bound
  is reached" is the one pattern with none of U, U′, L, L′.
- **A side filter's loading.** The null is long with the long share p, so it carries 2p − 1 of the move. A
  long then carries 1 − (2p − 1) and a short −1 − (2p − 1): +0.68 and −1.32 at p = 0.66; +0.40 and −1.60 at
  0.8. Weighted by p and 1 − p, the two sum to 0 at every p.
- **The kit's exit rows.** An account never flat on one coin, with n order events, appends between about
  n² ÷ 8 exits (adds and trims in turn) and n² ÷ 4 (every add first): 9.9 million at 6,300 by the second,
  100 million at 20,000, 2.5 billion at 100,000. So 20,000,000 is met at about 9,000 to 13,000 events.
- **The delisting arithmetic** (RM4): a share s of copies at a result r moves the mean by s × r: 0.001 ×
  −3,000 bps = −3 bps; 0.003 × −3,000 = −9.
- **The label step without the bound** (Q3): the capture at the k-th Monday holds k + 5 weeks, so 72 Mondays
  hold 2,988 capture-weeks against about 900 with the 90-day bound: about three times.
