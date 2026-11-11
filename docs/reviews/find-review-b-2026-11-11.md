# FIND-REVIEW-B — the Final review of FIND-5-10, FIND-7 and FIND-9

FIND-REVIEW-B (Fable 5.2, max), 2026-11-11 22:17Z – 22:53Z (UTC, every
stamp from `date -u`; the last clock read before the commit), for polymarket-follow's supervisor: the independent
Final review of three of round 2's FIND studies — entries 5 and 10
(`find-5-10-2026-11-11.md`), entry 7 (`find-7-2026-11-11.md`) and entry 9
(`find-9-2026-11-11.md`) — all of which found nothing. Evidence: the
supervisor folder `workers/FIND-REVIEW-B/` (`progress.md`, `scripts/`,
`out/`; paths below are relative to it). **The blind store held:** nothing
stamped at or after 2026-11-07T00:00:00Z was read (my readers stop on such a
row), the collector's recordings, database and run folder were never opened,
no API call was made. I changed no study's file and ran no study's look. A
review decides nothing: the supervisor verifies and the owner decides.

## For the owner, in one page

*Words.* A **bp** is 0.01%. A **look** is the one run in which a study
computes its result. **Recomputed** means: I wrote my own program from the
rule book's words, without using the study's program or the shared toolbox's
code, ran it on the same raw data, and compared every single number.

**The question you asked: could a mistake have hidden a real effect? In
these three studies, no.** I recomputed all four results from the raw data.
Every one came out the same, to the last printed digit: 1,249 entries, 387
entries, 14,311 runs and 138 moments, each compared one by one. I then
checked the things that could silently flatten a result — a wrong side, a
wrong market, a clock off by a second or an hour, a price read at the wrong
moment, entries wrongly left out — and found none.

| Idea | Its result | Is the "no" beyond doubt? |
|---|---|---|
| 5 — the first minute after a top trader enters | the price does not move their way (about 0 bps); it points the other way against random trades | **Yes.** Recomputed exactly. The random trades' own +2 bps move, which you asked about, is real and not a clock error (below) |
| 10 — the "US open" cell | the top 50's entries at 12:00–16:00 UTC did the same as random trades (+0.05 / +0.02 of a day's move) | **Yes.** Recomputed exactly. The earlier −38 bps came from how the random trades were signed, as the study shows step by step |
| 7 — following an algorithm that works a large order | a follower loses about 10 bps a trade, which is the cost; the price does not continue | **Yes — and now also for the busiest algorithms**, which the study had left out. I priced them: the same loss |
| 9 — three unlinked traders agree | nothing (−0.07 / +0.02 of a day's move) | **No sign of an effect — but only a large one is ruled out.** With 130 moments the study could see about 60 bps a day or more; a small edge could be neither seen nor excluded |

**Three things worth knowing**

1. **Idea 5's yardstick.** After a random public trade the price moves about
   2 bps in that trade's direction within 10 seconds; after a top trader's
   entry it does not. You asked whether that is a timing mistake. It is not:
   the traders' fills and the public trades carry the same clock to the
   millisecond (3,407 of 3,407 matched), and the price series is read at the
   right second. It is also not what the study guessed (that random trades
   are mostly big, pushing orders): the top 50's orders are the bigger ones.
   The public tape is simply full of traders who buy seconds before the
   price ticks up — fast, automated flow. The top 50 are not that. This
   says nothing a follower could use: nobody acts within 10 seconds.
2. **Idea 7's busiest algorithms.** The study had set aside the 94 busiest
   accounts — more than half of all such runs — because our copy of their
   history is cut short. Their runs are whole all the same, so I priced
   6,529 of them (a look outside the frozen rules: it decides nothing). A
   follower loses 12 bps there too. These algorithms *do* move the price —
   5 to 6 bps in the minute of their fifth order — but all of it before a
   follower can act, none after.
3. **Idea 9 is the one "no" with wide error bars.** Nothing in it points to
   an effect, and nothing was done wrong. It is closed for want of any
   sign, not because a small effect was excluded. If it ever matters, months
   of the collector's data are where a small one could show.

**The programs** are careful and do what the rules say. What I would change
is for the next batch, not this one: three studies each wrote the same
pieces again (section 6).

Nothing here is trading advice.

---

## 1. Verdicts

| Study | Verdict | The independent recomputation | Corrections marked in place |
|---|---|---|---|
| FIND-5-10, entry 5 | **stands**, with corrections of wording | 1,249 of 1,249 entries equal (largest difference 0); the line −1.4483 / −3.0022 bps, p 0.02960 — the look's | F1, F2, F4 — `3bfac81` |
| FIND-5-10, entry 10 | **stands** | 387 of 387 entries equal to 1e-15; the line +0.0515 / +0.0240 risk units, p 0.8311 — the look's | none |
| FIND-7, entry 7 | **stands**, with two notes | 14,311 of 14,311 runs rebuilt equal; 5,459 priced runs equal to 1e-17; the line −9.74 / −10.79 bps — the look's | F5, F6 — `3e8f76e` |
| FIND-9, entry 9 | **stands**, with one correction on what it could see | 138 of 138 events rebuilt equal; scores within the file's rounding; the line −0.0728 / +0.0190 risk units, p 0.8748 — the look's | F8 — `4fe538b` |

**Nothing must be re-run.** No high finding. No error found that flattens an
effect.

## 2. Findings by severity

**Medium**

- **F5 — FIND-7 priced none of its 94 busiest accounts** (7,314 runs, 57% of
  the 12,792 from the launch week), and its owner's page says "no" without
  saying so. Entry 7's FIND data is "every pool account's captured fills
  (for the busiest, only what their 5,000-fill cap holds)"; rules §3.2 set
  those runs apart by the classifier's coverage rule (the capture reaching
  14 days before the week), which a run does not need: a capture holds an
  account's newest fills whole, so a run is complete when its chain starts
  more than 10 minutes after the capture's first fill. The departure is
  stated (rules §9.2, report §7), and RULES-REVIEW did not raise it.
  **Priced now, exploring, deciding nothing** (`out/f7-recompute.txt`):
  6,529 complete runs of 89 such accounts on 67 days, primary-cell markets.

  | | day means (se, p) | account means (se, p) |
  |---|---|---|
  | net30, the statistic | −12.13 bps (2.21, 7e-7) | −11.25 (2.94, 0.0002) |
  | net30 without the competition's days (2,567 runs) | −12.26 (2.34) | −17.98 (7.36) |
  | the gross move over the 30 minutes | +0.06 (2.21, 0.98) | +0.98 (2.93, 0.74) |
  | P and these runs together (10,534): net30 | −10.19 (1.28) | −10.96 (1.91) |

  The same "no". The unknown the report names is closed, as exploring
  evidence only.
- **F8 — FIND-9's "no" is "nothing seen", and its owner's page did not say
  how little it could see.** 130 events: the day test's standard error is
  0.1526 risk units (20.95 bps). By A.0-13 (k = 2.01 + 0.84 = 2.85 on 49
  degrees of freedom) FIND could see only about 0.44 risk units — about 60
  bps over 24 h [my arithmetic on the look's standard errors]. The 95% range:
  −0.38 to +0.23 risk units by the day mean (−63 to +22 bps), −0.22 to +0.26
  by the trader mean. An edge of 10–20 bps a day would not have shown.
  Every print, placebo and leave-one-out is flat, so nothing points to one.

**Low**

- **F1 — entry 5: the report's "likely reason" for the yardstick's move is
  not the reason, and the capture can separate it** (report §6, §7, §8 and
  its note for the plan page). Section 4 below.
- **F4 — entry 5: the clocks, "not proven to the second" in the report, are
  proven to the millisecond.** Section 4.
- **F2 — entry 5:** "+0.46 (day)" [arithmetic] is +0.45.
- **F6 — FIND-7's owner's page:** "+1 bp more than after a random trade" is
  the day mean of the gross d (+1.31); the account mean is −1.74.
- **F7 — the kit's `runsOf` puts all of an account's fills with order id 0
  into one order.** 1,130 such fills in 177 accounts, 816 of them not forced
  (`out/order-ids.txt`). No effect: none of the 816 is a taker fill, so that
  order is never a taker order; my rebuild, which leaves them out, gives
  the same 14,311 runs. For the kit's next version.
- **F3, F9 — code:** section 6.

## 3. The independent recomputations

**My code** (`scripts/rb-lib.mjs` `897b9010…f210`, `rb-seconds.mjs`
`c7cc7ad7…93fb`): my own readers of the fills, the panel, R8's one-second
replies and R8's tape; pricing by the minute; the exact matched null; the
risk unit; a taker's costs with funding; the map read from its break-even
columns; A.0-7; the competition; R8's delay; A.0-6's two t-tests with
Student's p by direct integration of the density. It imports nothing of the
kit's code and nothing of a study. It reads the kit's *data files* (the
price table, the rule book, the map, the pool's list, R8's selection) and,
for entry 9, the kit's stored index of entries — which I rebuilt from the
raw fills first (below). Every unit was compared, not a sample; the seeded
sample the brief asks for (seed 20261111; 120, 120, 150 and 100 units) is
printed beside in each output.

### 3.1 The foundations all three studies stand on

| What | How | Result | Evidence |
|---|---|---|---|
| The entries (openings and flips) | rebuilt from every pool account's raw fills by A.0-1's words | 126,033 mine, 126,033 in the kit's index; market, instant, type and side equal in all. R8's stored look: 1,276 of 1,276 found | `out/entries-check.txt` |
| The minute's mark ("at the end of the minute") | the panel's mark of a minute against the one-second marks | equal to the minute's *last* second in 156,851 of 156,851 minutes; to its first second in 4.5% | `out/panel-vs-seconds.txt` |
| The null's weights (trades a minute) | the panel's count against the stored tape, hour by hour | equal in 61,979 of 61,980 minutes of 1,033 whole hours (one minute: 337 against 321) | `out/panel-vs-tape.txt` |
| R8's delay D | recomputed from the entry id | the stored follow instant equals t + D in 1,249 of 1,249 | `out/e10-recompute.txt` |
| The 50's long shares (entry 10's null, entry 5's coin) | the share of long ones among each account's openings and flips in the 30 days before T0 | 50 of 50 equal to R8's selection | `out/longshare-check.txt` |
| Sides | each entry's fills against its recorded direction | 1,249 of 1,249 (entries 5, 10) and 465 of 465 (entry 9's participants): a fill of the account at the instant, on the entry's side | `out/e5-recompute.txt`, `out/f9-recompute.txt` |

### 3.2 Entry 5 (`out/e5-recompute.txt`, `out/e5-entries.tsv`)

All 1,249 entries of R8's cell from R8's look, R8's draws and R8's
one-second replies, with my own one-second reader.

| | mine | the look |
|---|---|---|
| The line (1,241 entries, 47 traders, 42 days), day means | −1.4483 bps (se 0.6425, p 0.02960) | −1.45 (0.64, 0.0296) |
| … trader means | −3.0022 (se 0.8631, p 0.001114) | −3.00 (0.86, 0.0011) |
| (a) without the competition's days (1,041) | −0.9196 / −1.9058, p 0.1597 | −0.92 / −1.91, 0.1597 |
| (b) without its boosted markets (1,220) | −1.4509 / −2.9761, p 0.03099 | −1.45 / −2.98, 0.0310 |
| The placebo on random trades | −1.9021 / −2.0059, p 0.002405 | −1.90 / −2.01, 0.0024 |

Unit by unit against `look5-entries.jsonl.gz`: 0 of 1,249 differ in E, in
N_own or in d; the A.0-7 flag, the competition flags and the first event's
kind differ in 0. The first fill's price sits +2.30 bps (mean; 69% above
zero) on the entry's side of the mark of its second for the 1,089
taker-first entries: the market, the instant and the side join correctly.

### 3.3 Entry 10 (`out/e10-recompute.txt`, `out/e10-entries.tsv`)

The 387 entries of the 12:00–16:00 cell; the same 2 (A.0-7), 34 (the map) and
7 (not voted) left out; 344 in the line; none with a short risk window.

| | mine | the look |
|---|---|---|
| The line, day means (39 days) | +0.0515 risk units (se 0.1132, p 0.6521) | +0.0515 (0.1132, 0.6521) |
| … trader means (36 traders) | +0.0240 (se 0.1116, p 0.8311) | +0.0240 (0.1116, 0.8311) |
| (a) (282) / (b) (335), the larger p | 0.2082 / 0.7092 | 0.2082 / 0.7092 |
| Ladder 1, R8's stored d, entry-weighted | −38.35 bps | −38.35 |
| Ladder 2, my minute version of R8's draws, their own direction | −28.11 / −18.46; −37.52 | −28.11 / −18.46; −37.52 |
| Ladder 3, the same trades on R8's coin | −3.96 / +2.08; −21.74 | −3.96 / +2.08; −21.74 |
| Ladder 4g, the exact null, class horizon | −2.00 / +3.32 | −2.00 / +3.32 |

Unit by unit: d at 24 h within 5.6e-17, the risk unit within 2.3e-15, flags 0
differ. The 00:00–04:00 cell (beside) equal too.

### 3.4 Entry 7 (`out/f7-recompute.txt`, `out/f7-runs.tsv`)

The runs rebuilt from the 1,702 accounts' 1,272,487 fills by rules §3.1:
14,311, the same 14,311 as `runs.jsonl.gz` (0 only mine, 0 only theirs);
every selection flag, every delay and every chain start equal. S 5,459; P
4,005 runs of 290 accounts on 68 days in 85 markets.

| net30 | mine | the look |
|---|---|---|
| P, day means | −9.74 bps (se 1.45, p 4.773e-9) | −9.74 (1.45, 4.8e-9) |
| P, account means | −10.79 (se 2.72, p 9.338e-5) | −10.79 (2.72, 9.3e-5) |
| P(a) 2,943 / P(b) 3,943 | −9.80, −9.38 / −9.71, −9.63 | the same |
| X 945 / the pool 4,285 | −37.16, −29.35 / −9.82, −11.19 | the same |

Run by run against `look-runs.jsonl.gz`: the largest difference in net30
over the 5,459 runs is 6.9e-18. Their d30 equals my gross move minus (2 ×
their long share − 1) × my own mean of the hour, to 1.4e-17 (3,931 runs).

### 3.5 Entry 9 (`out/f9-recompute.txt`, `out/f9-events.tsv`)

The events rebuilt by rules §3–§5 with my own agreement, link and
copy-pattern code: 205 on the board, **138 from the launch week on 53 days**
(26 stopped by a link, 487 by an opposite opening; 99 long, 39 short; 88
triggers); the pool 284 / 188 (28, 626) — first measurement 4's counts.
Every trigger's delay and long share recomputed: 0 differ.

| | mine | the look |
|---|---|---|
| The line (130 events, 50 days, 81 triggers), day means | −0.0728 risk units (se 0.1526, p 0.6353) | −0.07 (0.15, 0.6353) |
| … trader means | +0.0190 (se 0.1202, p 0.8748) | +0.02 (0.12, 0.8748) |
| (a) without the competition's days (126) | −0.1313 / −0.0051, p 0.9644 | −0.13 / −0.01, 0.9644 |
| In bps | −20.48 / −6.02; event-weighted −12.58 | the same |
| The whole pool (176) | +0.0583 / +0.0282, p 0.7547 | +0.06 / +0.03, 0.7547 |

Event by event against `look-events.tsv`: 138 of 138 found, the side, the
trigger, the account count, the map's cell and the competition flag equal
in all, d within 0.005 bps (the file is rounded to 0.01).

### 3.6 The reports against their outputs

Every figure of the three reports' owner pages and result sections was read
against `look5.txt`, `look10.txt`, FIND-7's `look.txt`, FIND-9's `look.txt`
and `a2-confirm.txt`: all equal but F2. Each study's frozen list still
hashes as recorded (11 of 11, 9 of 9, 7 of 7; 22:32–22:44Z); every output
hash a report quotes equals its file; each look ran once.

## 4. Entry 5's random-trade placebo: a clock error?

The brief: the placebo repeats the line's sign and size — a random trade is
followed by about +2 bps its own way within 10 s; check that this is the
drawn trades' own push on the book and not a timing or ordering error.
**It is not a timing or ordering error. It is only in small part the
trades' own push.** Evidence: `scripts/e5-timing.mjs` → `out/e5-timing.txt`,
on R8's stored tape (`capture/tape`, the hours R8 read; FIND-5-10 did not
read it) — an exploring run, deciding nothing.

1. **The clocks are one clock.** 3,407 fills at the entries' instants found
   in the tape by trade id: the same millisecond in 3,407 of 3,407. The
   tape's side is the taker's: equal to the fill's side in 3,231 of 3,231
   taker fills, the other side in 176 of 176 maker fills. All 3,723 drawn
   prints are in the tape with the plan's millisecond and side.
2. **The second is read right.** If a bucket holds the last mark of the
   second that starts at its stamp, a print late in its second leaves more
   of its move for the next second. It does: at +1 s, +0.51 bps for prints
   at ms 750–999 against +0.15 at ms 0–249. And in the trade's own second
   the 50's taker entries and the random prints move alike (about −0.6 bps
   at −1 s for both, quarter by quarter): the difference opens after it.
3. **The instrument sees a push where there is one.** The 50's own large
   orders: +3.26 bps at 10 s and +7.53 at 60 s for the 87 taker-first
   entries whose order printed ten times or more. Maker-first entries: −2.50
   at 10 s — the mirror of a random taker's +2.04.
4. **But the per-print draw is not the reason (F1).**

   | Move at +10 s, bps | drawn prints | the 50's taker-first entries |
   |---|---|---|
   | an order of 1 print | +1.75 (2,479) | +0.26 (324) |
   | 2–3 prints | +2.48 (841) | +0.10 (354) |
   | 4–9 prints | +2.65 (329) | +0.34 (112) |
   | 10 or more | +4.00 (74) | +3.26 (87) |
   | followed by no print of either side for 10 s | +1.48 (2,007) | +0.23 (541) |
   | a single print, followed by none | +1.44 (1,443) | +0.26 (236) |

   The line with each drawn print weighed 1 / (the prints of its order):
   −1.23 / −2.94 bps (p 0.053), against −1.45 / −3.00; on single-print
   orders alone −1.20 / −3.22. The 50's first orders are the larger ones
   (median 2,603 USD against 506). What differs is what follows: 2.08
   prints of its own side and 0.50 of the other in the 10 s after a random
   print; 0.15 and 0.52 after a taker-first entry of the 50.

**Reading.** A public taker print is, on average, part of fast flow that
trades just before the mark moves its way — alone or in a burst. The 50's
entries are not. That is a fact about the yardstick's population, as the
report concluded; its guess at the mechanism was wrong, and its "not
separable" is no longer true. Whether the rest is news or the mark catching
up with the book stays unknown (no book before the cut).

## 5. The hunt for what could hide an effect

| What | FIND-5-10 | FIND-7 | FIND-9 |
|---|---|---|---|
| Direction and sign | each entry's fills on its side, 1,249 of 1,249; flips: the new side; R8's direction "below zero" for entry 10, "above" for entry 5 as the entries say | the order's side from its fills; the follower in it; a positive control: the mark moves +1.62 bps the run's way in the trigger's own minute (p 0.0009), +5.27 for the set-apart runs (p 7e-6) | 465 of 465 participants' fills on the event's side; long 99, short 39 |
| Joins (address case, market ids, merged fills) | lower-case addresses throughout; drawn trades of the entry's market only; fills deduplicated by (trade, market, instant) in my reader as in the kit's: the same entries | the same 14,311 runs from my reader; order ids never span two markets (0 cases) | the index rebuilt whole from the fills; the board's 505 accounts found |
| Time (ms, UTC, + D, the minute's end, the cut) | ms everywhere; the day is t's UTC day; the bucket's second verified (section 4); t + D equals R8's stored instant | the minute's end verified (3.1); the follow minute itself holds +0.21 bps (se 0.29) of the run's move — the rule hides nothing | the same reader; the day is t's UTC day |
| The horizon's exit | 60 s by the second; 24 h by the minute, voted so that every leg ends before the cut | 30 minutes from the follow instant; all 4,005 priced | 24 h; 2 events near the cut unscored |
| Left-out and unpriced rows | entry 5: none unpriced; 8 outside A.0-7 (with them: −1.51 / −3.08). Entry 10: 43 of 387 out (2 A.0-7, 34 map, 7 near the cut); without the map and A.0-7, ladder row 5: −2.22 / +4.65 bps | **the 7,314 set-apart runs: F5**; X (A.0-7's markets) −37 / −29 bps, their costs | 6 map-closed (+96.67 bps, 6 events, p 0.09), 2 near the cut, 2 in A.0-7's markets; the beta months +0.32 risk units (p 0.46) |
| The population filters | the 50 and their long shares from R8's selection; the map's open / closed recomputed from its break-even columns | the board's flag from the kit's list; the pool beside the same | the board; P1 at its week from the kit's index (not rebuilt, see below); the pool beside the same |
| The competition prints | flags recomputed, 0 differ; (a) and (b) reproduced | flags 0 differ; P(a), P(b) reproduced | 4 of the line's events in its days, none boosted; (a) reproduced |

**What I could not check.** The notional-board flag and the classifier's
weekly labels are the kit's (`population.json`, `pool-entries.jsonl.gz`); the
pool file behind the flag was read after the cut, so I did not open it. The
price table's and the map's own values are the kit's measurements.

## 6. The code (the owner's Final-review questions)

**How satisfied.** All three do what their rules say; I found no bug. Each
separates the rules (pure functions) from the reading and printing, tests
every rule on synthetic data, kills its mutants, and guards its look (the
kit's fingerprint, the frozen files, once). No unused export in `lib.mjs`,
`find7.mjs` or `lib9.mjs`.

**What I would change — for the next batch; nothing frozen is touched now.**

- **F9, the same thing written three times.** The A.0-6 line with the
  competition rule and leave-one-out (`summary` / `lineStatus` /
  `leaveOneOut`; `lineStats` / `verdict` / `leaveOneOut`; `lineOf` /
  `decide` / `leaveOneOut`, with three names for "passes"); the short risk
  window (`isShortWindow`; `inRiskUnits`); the run slot (`io.mjs`
  `takeSlot`; `slot.mjs` — two lock formats, each parsing the other's).
  Three correct copies today; one definition in the kit before the next
  batch, with R8's one-second and tape readers.
- **F3, leftovers of a ruling (FIND-5-10).** `ENTRY5_YARDSTICK`'s comment
  still says "null until the owner's word"; `look.mjs` still refuses a null
  that can no longer occur; `report5`'s 'matched' deciding branch cannot
  run. Harmless.
- **A placebo that cannot inform (FIND-7).** `randomNet30` "can hardly pass"
  by the rules' own words; it costs a row in every table and a condition in
  the verdict. The telling comparison (`d30`) is beside.
- **Lines of 300–700 characters** in `render.mjs`, `find9.mjs` and
  `look.mjs` (whole reports built in one expression). They are correct;
  they are slow to review and easy to break.
- **F7, the kit:** `runsOf` and order id 0. And `hashU`'s comment says "52
  bits": it takes the digest's first 20 bits and its bits 33–64 (R8's
  construction; my first copy took the first 52 and was 0.03 ms off).
- **A second dry run not repeated (FIND-7):** its last dry run (21:36Z) ran
  the code before a final wording change (`progress.md` says so); the look
  ran clean.

## 7. What stays unknown

- Whether entry 9 holds a small effect (F8).
- Why the mark follows a public print within seconds (news, or the mark
  catching up with the book): the collector's book will show it.
- The busiest accounts before their captures begin (their older runs).
- Anything after 2026-11-07.

## 8. Questions, each with a recommendation

1. **Record the exploring evidence for entry 7 (F5)?** *Recommendation: yes
   — one line in the plan page: "entry 7: not registered; the 94 busiest
   accounts, left out by the frozen rules, priced by the Final review as
   exploring: the same loss". Entry 7 stays closed.*
2. **Entry 9's wording (F8).** *Recommendation: where the plan page records
   entry 9, write "no sign of an effect; FIND could see about 60 bps a day
   or more", not "no effect"; keep the study's own proposal (information on
   the watch page, revisit on months of the collector's data).*
3. **The sentence for code-rules about a random-trade yardstick (F1).**
   FIND-5-10 proposed "… any study of seconds groups prints by order and
   reads the book beside". *Recommendation: record "a random-trade
   yardstick has its own move in the print's direction in the first
   seconds (about +2 bps within 10 s on R8's capture), whether drawn per
   print or per order; a study of seconds reads the book beside the mark".*
4. **The public tape's fast flow as an idea?** A random public print
   predicts the mark's next 10 seconds. *Recommendation: an observation
   only. It is about the tape, not about a trader to follow; no follower
   acts within 10 s; and it was seen while exploring.*
5. **The kit before the next batch (F7, F9).** *Recommendation: one kit
   change with a new fingerprint when a next batch is planned — the line,
   the short window, the slot, the two readers, order id 0 — and none
   before: no study needs it.*
6. **My two exploring looks** (R8's tape for entry 5; the set-apart runs for
   entry 7) are logged here. *Recommendation: count them (A.0-15) if either
   idea ever returns.*
7. **`docs/reviews/README.md`** needs this report's line; I commit reports
   only. *Recommendation: the supervisor adds it.*

## 9. Evidence list

In `workers/FIND-REVIEW-B/`:
- `progress.md` — the findings by severity, the log.
- `scripts/` — `rb-lib.mjs`, `rb-seconds.mjs` (my code); `e5-recompute.mjs`,
  `e5-timing.mjs`, `e10-recompute.mjs`, `f7-recompute.mjs`,
  `f9-recompute.mjs`, `entries-check.mjs`, `panel-vs-seconds.mjs`,
  `panel-vs-tape.mjs`, `order-ids.mjs`, `longshare-check.mjs`;
  `inspect-*.mjs` (shapes only); `with-slot.mjs`.
- `out/` — `e5-recompute.txt` (`a7dce1a1…ea87`), `e5-timing.txt`
  (`7419a86d…b9d0`), `e10-recompute.txt` (`bcf029a5…0a8a`),
  `f7-recompute.txt` (`e7b1362e…2c1b`), `f9-recompute.txt` (`0c114e24…dfa7`),
  `longshare-check.txt` (`41c7669f…ee3d`),
  `entries-check.txt` (`67960fa3…33a4`), `panel-vs-seconds.txt`
  (`fdb04cf4…275f`), `panel-vs-tape.txt` (`ecb07d5a…ef7c`), `order-ids.txt`
  (`96a4feab…f55a`); the per-unit files `e5-entries.tsv`, `e10-entries.tsv`,
  `f7-runs.tsv`, `f9-events.tsv`; each run's `.stdout` and `.log`.
- The corrections marked in place: `3bfac81` (FIND-5-10), `3e8f76e`
  (FIND-7), `4fe538b` (FIND-9).

**Runs:** each 2–15 s; those reading the whole pool or every panel under a
run slot (taken and released each time, 2 GB of heap), the rest at 1 GB.
**Exploring runs (A.0-15), deciding nothing: 2** — R8's stored tape for
entry 5 (`e5-timing.mjs`, 22:28Z, re-run 22:46Z with the tape's windows
enforced), and the set-apart runs for entry 7 (in `f7-recompute.mjs`,
22:38Z, re-run 22:50Z with the path by the minute). **Rules I broke:** one
`node -e` edit of my own script (22:28Z; the re-run's output was
byte-equal). **My own error, found and fixed:** the first copy of R8's hash
(section 6).
