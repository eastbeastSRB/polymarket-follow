# COPY-H's copy engine: the plan (part 3), 2026-11-26

*Written by COPYH-ENGINE (Opus 5.5, max), 08:48–09:25Z 2026-11-26, in its
progress file; filed here by the supervisor on 2026-11-26 so that the
rules' references "(the engine's plan, Qn)" point into the repository.
Approved with the supervisor's rulings: decisions 2026-11-26, "COPY-H's
PART 3, THE COPY ENGINE: ITS PLAN APPROVED" (`6efe390`), and "THE CAPS
MUST NEVER LEAVE OUT AN ACCOUNT THE MACHINE CAN HOLD" (`0ec4835`); Q9
later withdrawn in favour of C9's text (`c4947ab`). The text below is the
worker's, unchanged.*


- **Rules:** `copyh/rules.md` C0–C18 as committed (`5a80af5`). Where I read a
  rule one way and it could be read another, it is a question in section 16,
  never decided silently.
- **The kit and lib-exits run unchanged,** loaded by `dist/paper/research.js`
  (`loadResearch`, `checkKit()` and lib-exits' hash at every load). Every kit
  function the engine calls is already typed there: `normFill` fields,
  `toEvents`, `toCycles`, `buildEntries`, `entryId`, `delayOf`, `maxDelay`,
  `labelAt`, `habitsAt`, `marketFrom`, `markAtMinuteEnd`, `tradesAt`,
  `fundingBetween`, `leg`, `removalOf`, `dAgainstNull`, `cr1Test`,
  `tCritical`, `exitsOf`, `liquidationKeys`, `priceCopy`, `unpricedReason`,
  `chainBreaks`, `crossesBreak`, `winLoss`, `quantile`.
- **The store (parts 1–2)** gives: `fills/<bucket>/<YYYY-MM>/` rows by
  (account, `time`), ties in the pass's order, with `flags` (taker, own
  liquidation, backstop, MARKET), `dir`, `method`; `bars/<iid>/<YYYY-MM>/`
  per minute (trades, Σ sz, Σ px·sz, last, pair gap/count, left-out takers,
  Settlement Σ sz / Σ px·sz); `files.jsonl` (each file's minute spans, from
  which `holesOf` gives the holes exactly as K3 does); the manifest's
  `counts.coins` (each coin's first Settlement time) and `counts.vaults`.
  `normalize.ts` (`normOf`) and `chains.ts` already map rows to the kit's
  `normFill` fields with chain heads.
- **END and the stage window are parameters everywhere** (design.ts gives the
  steps theirs). So the same code runs step 1 (END_E), step 2 (END_S),
  FRESH-2 (END_F2), the rehearsal's fortnight (END 2025-07-14, in memory),
  and small synthetic worlds in tests.

## 1. The shape: seven phases of parts

Every phase is a list of parts fixed by the inputs; each part is computed
**twice, in two separate OS processes** (copy a, copy b), written whole
(`.tmp`, then renamed), and the phase is closed by a record holding each
part's SHA-256 only when a and b are byte-equal (else exit 7). Later phases
read copy a, each file held to the record's hash.

| Phase | Part = | Reads | Writes (no file of prices before PRICES) | Rules |
|---|---|---|---|---|
| LABELS | (bucket, block of 8 Mondays) | the bucket's fills of the block's window | per Monday: label counts; the P1 accounts | C2, C5 |
| BUILD | bucket | the bucket's fills, all months; its P1 accounts | plans (entries, exits, D, legs' instants, flags, covariates without prices), account facts, removal emissions | C2–C8, C10 (members), C11 (gap) |
| REMOVAL | coin | every BUILD part's emissions of the coin | per (coin, line) minute counts | C10 |
| TRIPWIRE | bucket group (16) | plans, the bars' trade counts, funding hours | counts by reason, projected copy ids | C16 |
| PRICES | bucket group (16) | plans, bars, funding, removal tables | priced positions (JSON lines, by entry id), rank inputs | C8–C11, C7's variants |
| RANK | one | rank inputs | RANK's accounts per Monday | C7 |
| RESULT | one | priced positions, RANK, counts | result/report contents, the positions lines' hash | C12, C13 |

Why two passes over accounts: d needs each week's removal table across every
bucket (a trade's two records sit in two buckets), and the tripwire must
finish over MAIN's whole set before any price (the plan review's 2.8 said the
same).

## 2. Modules (new files in `src/copyh/`, by rule)

- `instants.ts` (C1): an instant's stage, Monday, UTC day, week, month; a
  step's Mondays; `votedBy(t, END)` (C10: ⌊t/1h⌋·1h + 1h + the kit's
  `maxDelay()` + 24 h ≤ END, the paper's `votedBy` with the kit's own
  constant).
- `accounts.ts` (C2, C3's reader): a bucket's accounts across the step's
  stores (E, then S, then FRESH-2, joined by address), each account's rows
  in the store's order as `normalize.ts`'s `Row` plus its `market` flag,
  every row through `checkInstant`, every file through `Store.bytes`
  (SHA-256); one month partition held at a time where the phase allows; the
  vault set (C2: the union of the stores' `counts.vaults` up to END_k,
  checked against the rows BUILD reads); a coin's bars across months and
  stores.
- `entries.ts` (C4): `historyOf(fills)` → the kit's events, cycles, groups
  (`buildEntries(events, −∞, ∞, 60 000)`), liquidation keys, chain breaks;
  `exitRows(events)` (the kit's loop with a count in place of each append);
  the EXITS_MAX rule and the naming (exit rows; non-forced OPEN/FLIP events
  in the weeks where it is P1); entries of a stage window; id and D; C4's
  float residues (1e-9 ≤ |prev + net| < 1e-6).
- `labels.ts` (C5): the bounded capture (fills in [max(ARCHIVE_START,
  M − 90 d), M), `truncated` true, `oldest` that start) and the kit's
  `labelAt`; "no fills in window" at once; P1; the habits from the
  whole-history events when no order event straddles M, else from the fills
  before M (counted); a capture argument so part 4 can pass R5's whole
  capture (the reproduction, the label check).
- `lines.ts` (C7): the account-level conditions at M (P1, MAIN, TEN, DAY;
  BROAD = P1), taking the coverage booleans as inputs (COPY-H's are true from
  M₀; the reproduction passes the paper's); each entry's lines (primary
  market a predicate passed in); RANK's ranking; SLICES (the address's last
  hex digit mod 4); SIDES; MONTHS (UTC month of t); JUMP's split.
- `markets.ts` (C6, C9): the coin's first Settlement and end; the primary
  rule; the two market objects (VWAP, last price) built "the kit's
  `marketFrom`, step for step, with END" and the settlement-mark rule as a
  parameter; thin legs; the cascade print's per-minute c.
- `setting.ts` (C9): c(coin, d) from day d − 1 with both fallbacks; the
  taker setting (fee 0.00045, spread c); the cascade setting; Binance's
  venue setting (fee 0.0005).
- `money.ts` (C8): the plan (`planCopyThrough` with END or the coin's end;
  `settled`), the price (`priceCopy`), in bps; the variants: STOP2/5
  (`stopInstant`), DAYS7 (`DAYS7_MS`), DELAY0 (D = 0, last-price object),
  DELAY+5/+15 (D + 5/15 min), LAST (D, last-price object).
- `judge.ts` (C10): d (`dAgainstNull` × 10⁴), x′ = d − (L.gross − L.net) ×
  10⁴ with L the kit's `leg` at 24 h; the removal: BUILD's emissions, then
  per (coin, week, line) the kit's own `removalOf` over the line's member
  records (market trades only), read back minute by minute into a table.
- `unpriced.ts` (C11): the unpriced reasons (lib-exits'), d's null reasons
  (the kit's three and "no long share"), the gap copy (`crossesBreak`, or a
  hole meeting [t, the last exit used or END while open]).
- `verdict.ts` (C12): the set, m and SE (`twoWay`), m′ and SE′ (the larger
  of `twoWay` by day and `twoWay` by week), the readings in order, every
  sentence, "after the verdict".
- `prints.ts` (C13): report.json's prints.
- `rounds.ts`, `choice.ts`, `confirm.ts`, `fresh2.ts` (C14).
- `tripwire.ts` (C16).
- `engine.ts` (C15's guard): the phases' part lists, the two pools of child
  processes, the records, resume, the budget; `engine-worker.ts`: the child
  process's entry (loads the kit once, computes one part at a time on IPC
  messages, writes it whole, replies with its SHA-256, seconds and peaks).
- `steps.ts` (C15): step 1, step 2, FRESH-2's stage; the identity block
  (C0); the writes' order; `repro.json`'s check (part 4 writes it).
- Changed: `main.ts` (the gated commands call `steps.ts`; options
  `--past-tripwire`, `--workers`, `--minutes`, `tries --round n`), its
  `build`/`integrity` bodies moved into functions step 1 also calls (Q6);
  `seal.ts` (the engine folders, Q7); `range.ts` (FRESH-2's range for
  `fresh2`); the gate test's `PENDING` emptied when `copy.js` and
  `stats.js` are imported.

## 3. How the store feeds the kit

- **Rows → the kit's fills:** `accounts.ts` builds `Row`s (u64 `oid`/`tid` to
  their digits; `dir` → its kind from `dirs.json`; `side`; `crossed`; own
  liquidation from `flags`) → `normOf(rows)` (exists): t = `time`, iid,
  oid/tid as text, **prevS = the chain head's `startPosition` as its
  shortest text**, prev = its value, sgn, px, q, fee 0, pnl 0, taker =
  `crossed`, liq, forced. A matching event (oid, coin, `time`) is never cut
  by a time window, so windowed reads keep chain heads exact.
- **Order:** the store's (account, `time`, the pass's order); across stores
  E then S then FRESH-2. The kit sorts nothing it needs sorted that we do not
  already give sorted (its `readAccount` sorts by t, stable; ours already is).
- **The kit unchanged:** imported from `research/` through `loadResearch`
  (never copied); lib-exits likewise. Frozen helpers that hard-wire the cut
  are not called past it: `planCopy` → `planCopyThrough`, `marketFrom` →
  `markets.ts`'s builder, the kit's `voted` → `votedBy` with END.

## 4. What is reused from `src/paper`, and how

- `copy.ts` (`dist/paper/copy.js`, named in C0's closure): `planCopyThrough`
  (C8's legs; the settled plan with the coin's end as `end`; STOP's and
  DAYS7's `closeAt`), `stopInstant`, `DAYS7_MS`, `jumpRatio` — as is.
  STOP's `until` as the paper's scorer: the last exit's instant when the
  plan closed, else the plan's end.
- `stats.ts` (`dist/paper/stats.js`): `twoWay` for SE; for SE′ by week and
  H1's month print, `twoWay` on items whose `tIn` is replaced by the week's
  Monday (or the month's first instant) — the frozen function unchanged,
  since `dayOf` of a day start is itself; `dailyEValue`; `smallestEdge`
  (C13's (2.43 + 0.8416) × SE × √((END_E − M₀) ÷ (END_S − M₀))).
  Not reused: its `verdict` (the paper's rule, not C12's), `LOOK_Z`.
- `research.ts` (`dist/paper/research.js`): the loader and the types.
- `market.ts` `marketThrough`: **not imported** (Q4). It hard-wires the
  5-minute settlement mark and pulls `seed.js` into the closure;
  `markets.ts` builds the same object step for step with the mark rule as a
  parameter, and tests hold it field for field to the kit's `marketFrom` (a
  made-up panel ending before the cut, C9's test) and to `marketThrough`
  (one ending after it).
- `summary.ts`'s print helpers (drawdown, without the most influential, the
  t band): small, not exported, tied to the paper's record type —
  re-written in `prints.ts`, a test holding them to the paper's
  `lookReport` on made-up copies.

## 5. Markets, funding and the setting (C6, C9)

- **A coin's end:** its first Settlement time from the stores' manifests
  (`counts.coins`); end = the end of that minute when it is before END, else
  END. The Settlement price: that minute's Settlement Σ px·sz ÷ Σ sz (bars).
- **Primary (C6):** no Settlement at or before the end of t's UTC day
  (minute precision suffices: day ends are whole minutes). Entries left out
  so are counted by line (C13).
- **The VWAP object:** from the coin's first market-trade minute to its
  end; marks = Σ px·sz ÷ Σ sz where Σ sz > 0, NaN elsewhere; the Settlement
  minute's mark = the Settlement price; `trades` = the market-trade count,
  `volume` = Σ sz; funding rows `[nominal hour, Number(rate), time]` of
  `copyh/funding.sha256`'s windows for the step (each file held to its line,
  read by `funding.ts`'s `sealedRows`), sorted by hour; the prefix sums at
  the settlement mark: 5 minutes = the kit's `markAtMinuteEnd(mk, hour − 1)`,
  60 minutes = the latest mark among the minute ending at the hour and the 60
  before it. **A step refuses while design.ts's `SETTLEMENT_MARK_MINUTES` is
  null** (Q19); tests and the rehearsal pass 5 or 60.
- **The last-price object:** the same, marks = each minute's last market
  price; the Settlement minute = the Settlement price (Q10).
- **c(coin, d):** per UTC day, the median over minutes with a pair of the
  minute's mean gap (pairGap ÷ pairs), halved; day d uses day d − 1 when it
  has ≥ 30 such minutes, else the latest earlier day with ≥ 30 (flagged),
  else 25 bps (flagged). `spread(iid, t)` looks up t's UTC day.
- **Thin legs (M6):** Σ px·sz over the minute holding x and the five before
  < $1,000 (prefix sums of the bars' notional); a copy is thin-tape when its
  follow instant or any exit leg (the cut leg at END − 1 included; a settled
  copy's last leg not) is thin (Q11).
- **The cascade setting:** c from the leg's own minute (half its mean gap)
  where it holds a pair, else c(coin, d).
- One coin's objects are held at a time in PRICES (~25 MB for E's 530,640
  minutes), so memory does not grow with the coin count.

## 6. Money, d, x′, removal; unpriced, missing, gap (C8, C10, C11)

- **Plan (BUILD):** exits = `exitsOf(g, liquidationKeys(events))`; end =
  min(END, the coin's end); `planCopyThrough({t, D}, exits, end)`; a plan
  with an open part at a coin end before END is `settled` (not "open" or
  "crossing"); voted; gap; the covariates without prices (habits at M, coin,
  size = the first event's notional, the count of prior MAIN copies).
- **Price (PRICES):** `priceCopy(mk, {dir, tIn, legs, setting})` → net,
  gross, fees, funding, hold, full exit, fundingMissing, spreadFallback, in
  bps; unpriced by lib-exits' reason. Each line's d at its own D, marks and
  removal set (MAIN, TEN, DAY, BROAD; MAIN's for STOP2…MONTHS; DELAY0 on the
  last-price object at D = 0, DELAY+5/+15 at D + 5/15 min, LAST on the
  last-price object); x′ for each d. The cascade print and Binance's venue
  print price MAIN's plan once more (money; x′ for the cascade).
- **Removal:** BUILD emits each member account's market-trade records of the
  weeks where it is in a line, with the lines as a mask (MAIN, TEN, DAY,
  BROAD); REMOVAL, per coin, per week and line, feeds them to the kit's own
  `removalOf` (keys `tid|iid|t`, so a trade between two members in two
  buckets counts once) and reads its counts back minute by minute. The
  emission file has one stretch per coin, each held to a SHA-256 in its
  header (the store's part pattern), so a coin's part reads only its slices.
- **Gap:** `crossesBreak(chainBreaks(events), events, g, plan)` or a hole
  [a, b) with a ≤ the span's end and b > t (span's end: END while open, else
  the last exit used), holes from the stores' `files.jsonl` by `holesOf`.
- **Missing funding hours:** `fundingMissing`, counted, never charged.

## 7. The statistic and the prints (C12, C13)

- `verdict.ts` on item lists {addr, tIn, x, x′ or null, thin}: WITHHELD
  (> 2% of the set unpriced) → TOO FEW (SE or SE′ null: < 2 traders, days or
  weeks) → DROP (both upper bounds < +10) → KEEP (both lower bounds > 0 and
  the traders' means, the days' means and the mean without thin-tape copies
  each > 0; a mean over no copy is not above 0) → TOO FEW with cases (a)–(e)
  in order, each that applies, or "no mean result as large as X" with X the
  larger upper bound; R12's line after each; "after the verdict" at a later
  look. Every sentence a function of its numbers, tested on both sides of
  each bound with a margin.
- `prints.ts`: R14's list (Q13), the venues, H1's prints (null mean gross,
  d, x′ with SE′ by day and by week, the money's error by week and month),
  concentration (Q14), SIDES/MONTHS/SLICES with n, m ± SE, m′ ± SE′, the
  settled copies and C6's left-out entries, thin tape, the market trades'
  left-out takers by cause and month (bars), the cascade print, the
  tripwire's counts, vaults, EXITS_MAX accounts, residues, C3's counts, the
  holes, run times and peaks, MAIN on S alone (step 2), the calibration
  copied from `copyh/calibration.json` and held to its hash, FRESH-2's form
  (Q18). No verdict word but MAIN's (a test reads the text).
- **The writes' order:** RESULT's two copies agree on result.json's content,
  report.json's content and the positions lines' SHA-256; the parent writes
  the positions file to a temp inside the sealed engine folder, checks its
  lines' hash, hashes the file, writes `result.json` (naming both hashes),
  renames the positions file into place, then writes `report.json`. Nothing
  about an outcome is logged before `result.json` exists (parts log counts,
  seconds and peaks only).

## 8. The rounds, the choice, the confirmation, FRESH-2 (C14)

- `tries.json` (Zod): rounds of tries {name, line MAIN|BROAD, conditions
  [{covariate, op ≥ > ≤ < = "one of", value or list}], why}; covariates by
  name only (Q16): `closedCycles`, `medianHoldHours`, `longShare`, `entries`,
  `coin`, `sizeUsd`, `priorCopies`, `priorMeanNetBps`; any other name (the
  side among them) refused; a condition on a covariate the copy lacks is
  false.
- `tries --round n`: refuses an uncommitted or changed `tries.json` (git:
  tracked and equal to HEAD), a round whose predecessor's output is missing
  or whose own exists, a fourth round, a round over 8/6/4; reads step 1's
  `positions.jsonl.gz` held to result.json's hash; each try on E (Q15):
  n, traders, days, weeks, m ± SE, m′ ± SE′, m − 2.99·SE, m′ − 2.99·SE′ →
  `rounds\round-<n>.json`.
- `choice`: from the round files alone; the four conditions; at most two by
  m − 2.99·SE (ties: earlier round, earlier try) → `rounds\choice.json`.
- `confirm.ts` (step 2): each chosen try on S's copies voted by END_S; s =
  min(m ÷ SE, m′ ÷ SE′); Holm with m = 2 (2.24, then 1.96 only when the
  first's s exceeded 2.24); the five readings in order, each sentence.
- `fresh2.ts`: the sealed judgment (1.96 a try, 1.645 MAIN's KEEP), the
  readings, the sentences; the stage's run (C14 (4)) through `steps.ts`.

## 9. The tripwire (C16)

Per copy of the projected set, from plans, bars and funding only: reason 1,
the follow instant and every leg instant whose 6 minutes up to the minute's
end hold no minute with a mark — a minute has one exactly when Σ sz > 0 or it
is the coin's Settlement minute (Q12), so a settled copy's last leg is never
counted and the projection equals the pricing's unpriced copies; reason 2,
each funding row's nominal hour in (t + D, the last leg instant] with no such
minute in the 6 (or 61) minutes before it; counts 3–5 (settled, funding hours
missing, gap). Share = copies with reason 1 or 2 ÷ the set. Above 1%: exit 6
unless `--past-tripwire`. Step 2's tries and FRESH-2's sets: see Q2.

## 10. Steps, parts, resume, the twin (C15)

- **step1** (`<COPYH_ROOT>\look1\`): the gate (exit 4, nothing read) → a
  `result.json` refuses (exit 5) → `repro.json` of this program (exit 5) →
  E's two stores `look1\store` and `look1\twin\store` (the pass and merge as
  `build` runs them; Q6) → `builds.json` and `integrity.json`
  (`runIntegrity`) → LABELS, BUILD, REMOVAL → TRIPWIRE (stop) → PRICES, RANK,
  RESULT → the writes (section 7). The fortnight's hash against
  `rehearsal.json` (C15 (c) 10) is part 4's wiring on these functions.
- **step2** (`look2\`): the gate (the rounds' kind) → refusals → step 1's
  three files held to `look1.sha256` → S's two stores and integrity → step 1
  recomputed at END_E from E's store and held to result.json's positions
  lines hash (exit 6) → the engine on E ∪ S at END_S → the tripwire on look
  2's set and each chosen try's set → look 2, the confirmation, MAIN on S
  alone → the writes.
- **fresh2** (`fresh2\`): as C14 (4); FRESH-2's range (`node_fills_by_block`
  [END_S, END_F2), 4,368 files from `copyh/fresh2.sha256`).
- **Parts:** each part's inputs (code fingerprint, store manifests' SHA-256,
  lists' hashes, earlier records, END, window, settlement mark) are in its
  header; a part of other inputs is refused (exit 5: moved aside by hand),
  never reused or overwritten. A run starts no part once its minutes are
  spent or a closed window began (`budgetOf`), waits for the parts in flight,
  exits 3; the next run resumes.
- **The twin:** a pool of `--workers` long-lived child processes
  (`child_process.fork` of `engine-worker.js`, `--max-old-space-size` =
  the worker heap; idle priority inherited) computes the phase's missing a
  copies; then a new pool its missing b copies; a part's two copies are so
  never in one process. Compare → record → next phase. A difference: exit 7
  with the list; a decisions entry moves both copies aside (Q3). Children
  never log outcomes; the parent logs counts, seconds and peaks.
- **The seal:** the engine folders (`look1\engine`, `look2\engine`,
  `fresh2\engine`) are refused by name and by real path to every reader but
  the step's own engine (Q7).

## 11. Heap and part sizes (measured, the owner's margin)

Two measurements, in my scratch copy with its own `dist` (code-rules), never
committed as data, each thread's heap polled every 100 ms. **With commit 2**
(for Q1): the kit's bytes and seconds a fill for `labelAt` on one capture and
for `toEvents` + `buildEntries` on one history, on synthetic market-maker and
whale accounts of 1, 5 and 10 million fills. **With commit 16**, every phase
on synthetic data at full size:
a bucket of E's size (~8 million rows over 13 months, Zipf-like accounts,
one market-maker-shaped account at the capture bound, a directional whale of
3 million fills, one near EXITS_MAX) through LABELS and BUILD; a coin over
530,640 minutes with ~8,000 funding hours and a bucket group of 500,000
copies (a quarter MAIN, up to 20 exits) through PRICES; a BTC-scale coin of
50 million member records through REMOVAL; 8 million positions lines through
RESULT. Then: `WORKER_HEAP_GB` stays 8 if three times the largest peak fits
(D10's rule until the rehearsal), else a decisions entry; part sizes (the
Monday block, the bucket groups) chosen so the measured worst part is under
~3 minutes. These part constants live in `engine.ts` (they decide nothing:
every part is held to its twin). Estimates to be replaced by the
measurement: LABELS ≈ 10 CPU-hours a copy on E (M3's arithmetic), BUILD ≈ 1,
REMOVAL ≈ 0.5, PRICES ≈ 2.5, RESULT ≈ 0.3: ≈ 29 CPU-hours with the twin,
≈ 10 h of wall time on 3 workers, ~40 runs, beside the two store builds.
**The label step's memory for the largest accounts is the open risk (Q1).**

## 12. The synthetic world and the tests (made-up data only)

- **Unit worlds per module**, every output asserted, both sides of every
  threshold with a margin, uneven values (k²/10), level boundaries at the
  walked size (code-rules): instants (1 ms either side of every boundary),
  accounts (mixed case, a vault record in S: in look 1, out of look 2; the
  P1-at-some-Monday set), entries (OPEN, FLIP, ADD merged within 60 s and
  not, forced as exit only, id and D hold iid, `exitRows` equal to the kit's
  exits on made-up accounts, above EXITS_MAX named, the float residue),
  labels (capture start/oldest either side of M − 90 d = ARCHIVE_START, a
  fill at M left out, straddling vs not, the churner reach with pnl 0),
  markets/setting (object = `marketFrom` and = `marketThrough`; 5-minute
  rule; marks from market trades only; end at END and at a Settlement; an
  hour at ±30 min; two rows in an hour stop; both settlement rules; pairs at
  2 s and 2 s + 1 ms, across a minute; the 30-minute and 25 bps fallbacks;
  c from the day before only; thin at $999.99 and $1,000), money (partial
  exits, full close, flip, a liquidation's share, crossing and open at END,
  settled; every bps field on uneven marks with funding), judge (d = the
  kit's; market trades only; a two-bucket trade once; a backstop leg not
  removed; the week cut at END; x′ = d − cost; null exactly when d is),
  unpriced (each reason; gap by break and by hole; a hole after the last
  exit makes none), lines (every threshold; RANK's fifth, its five copies,
  ties; SLICES disjoint and whole; DELAY0/LAST at the last price; DELAY+5
  moved), verdict (every reading and sentence case), tripwire (each reason
  alone; a quiet :54→:59 in a hold of days; settled never unpriced; the 1%
  stop both sides; projection = pricing's unpriced on a made-up world),
  rounds/choice/confirm/FRESH-2 (every refusal, condition and reading).
- **The engine world** (`test/copyh-engine-world.ts`): made-up raw files →
  the real pass and merge → a small store (a short custom window) → every
  phase through real child processes (the built `dist`, 60 s limits) →
  labels, P1, lines, entries, legs, marks, funding, d, x′, the statistic,
  result and report asserted against values written in the test or
  computed there by the kit directly; a resumed run equal to an unbroken one;
  a byte flipped in one copy caught (exit 7); a part of other inputs refused.
- Part 4 drives the same world through every gated step under a synthetic
  tag; part 3 tests the step functions behind the gate.

## 13. The breaks round

Recommended: a fresh worker after commit 15, with its own break list over
everything that decides (labels and P1, lines, entries and plans, markets
and the setting, money, d and removal, unpriced and gap, the verdict and the
rounds' rules, the tripwire, the twin compare and the seals), run in a
scratch lane (`git archive`), each kill recorded with vitest's JSON
reporter; then the gaps closed by tests (the store's COPYH-BREAKS →
COPYH-GUARDS route). I hand it a map of the deciding functions, not breaks.

## 14. The commit sequence (each `pnpm verify` green in the same command; a successor can take over after any)

1. `instants.ts`, `accounts.ts` (+ `test/copyh-accounts.test.ts`, instants
   tests).
2. `entries.ts`, `labels.ts` (+ tests).
3. `markets.ts`, `setting.ts` (+ tests).
4. `money.ts`, `unpriced.ts` (+ tests; first import of `dist/paper/copy.js`:
   the gate test's PENDING loses it).
5. `judge.ts` (+ tests).
6. `lines.ts` (+ tests).
7. `verdict.ts` (+ tests; `stats.js` imported: PENDING empty).
8. `tripwire.ts` (+ tests).
9. `engine.ts`, `engine-worker.ts`, the seal's engine folders (+ tests:
   parts, records, the twin, resume, refusals).
10. The phases LABELS and BUILD on `engine.ts` (+ tests).
11. REMOVAL, TRIPWIRE, PRICES, RANK, RESULT (+ tests).
12. `prints.ts` (+ tests).
13. `steps.ts` step1 and `main.ts` (+ `test/copyh-steps.test.ts`).
14. `rounds.ts`, `choice.ts`, `tries`/`choice` (+ tests).
15. `confirm.ts`, `fresh2.ts`, step2 and fresh2, FRESH-2's range (+ tests).
16. The engine world end to end; the measurement; the part constants;
    architecture's "COPY-H" section.

About 7,000 lines of code and 8,000 of tests; three to four sessions.

## 15. What part 4 needs from these interfaces

- Account-level functions on any `Row[]`/fills, with no store: `normOf`,
  `historyOf`, `exitRows`, the label with a caller's capture (R5's whole
  capture for the 26 Mondays and the label check), habits at M, the
  account-level lines with the paper's coverage passed in, entries, plans.
- Money and d on any market object and setting: the kit's own panel
  (`loadMarket(iid)`, read by the kit where it keeps it, held to its pinned
  hash; it is not in the paper's `Research` type, so a typed extension in
  COPY-H's code) and the kit's `SETTINGS.taker` — for FIND-6-EXITS's
  1,700 of 1,700 (D = 0, exits copied, held 24 h), X3's 1,366 and 1,104 of
  1,104, d and x′ to 1e-9.
- The removal from in-memory member records (the reproduction's line
  accounts at M, the week of M), the same core as the store-scale path.
- The engine at any END and window, PRICES in memory (the fortnight: no
  priced file kept; its lines hashed as the positions file writes them,
  sorted by entry id).
- `PAPER_SEED` (exists in `run.ts`), `repro.json`'s schema (in `steps.ts`,
  checked by step 1), the counts for `rehearsal.json` (plans, exits, labels,
  tripwire under both settlement rules, the survival curve and long share
  from entries and exits, exit rows of the largest accounts, residues, every
  part's seconds and peaks).

## 16. Questions, each with a recommendation

### Needing a ruling before I build

- **Q1 — The largest accounts are beyond what the kit can hold (labels and
  histories).** The kit's `labelAt` builds every event of the 90-day capture
  in memory, and C4 needs the kit's `toEvents` on the whole history before
  EXITS_MAX can even be counted. At ~300 B a fill object plus the
  classifier's events, a capture of 20 million fills needs ~9 GB and of 50
  million over 20 GB (the cap); the CPU is ~1.4 µs a fill a Monday (a
  50-million-fill account: ~70 s a Monday). Hyperliquid's market makers can
  hold tens of millions of fills in 90 days (the top 1% of an hour's
  accounts hold 39–58% of its records; the planner set aside the three
  heaviest of one slice, 5.69 million rows in 37 days). No rule covers an
  account the kit cannot hold for its label, and an out-of-memory part would
  be a stop after the freeze. **Recommended:** (a) the supervisor asks the
  burn-in (counts only, no price) for the largest accounts' kept records
  per 14 and 90 days and per month (the merge's 12-million-row bucket-month
  guard is a first signal); (b) I measure the kit's bytes and seconds a fill
  on synthetic market-maker and whale accounts in my first commits; (c) a
  rule like EXITS_MAX, fixed before the freeze: an account whose capture at
  M holds more than LABEL_FILLS_MAX fills is not run through `labelAt` at M
  (not P1 there; named with its count), and one whose history to END holds
  more than HISTORY_FILLS_MAX is not run through the kit at all (in no line
  and no removal set, named with its count); values from (a) and (b) with
  the owner's margin, the rules file at part 5's touch. Such an account is
  almost surely no directional trader (directional needs under 30 decisions
  a day), and naming them keeps the effect visible. An exact pre-check
  re-implementing the classifier's groups is possible but would be my code
  deciding a kit output: not recommended.
- **Q2 — The tripwire before any price, on a try whose conditions use
  `priorMeanNetBps`.** That covariate is a price of earlier copies, so a
  chosen try's set on S (or FRESH-2) cannot be known before any price.
  **Recommended:** the prior count counts the trader's MAIN copies whose
  follow instant and every leg lie before M, priced or not (price-free;
  RL6's "their count"), and the mean is over the priced ones; the tripwire
  projects such a try over its conditions without the mean-net one (a
  superset), named in the report; the try's own WITHHELD reading on S still
  guards its set after prices.
- **Q3 — The twin's form.** Recommended as section 10: separate OS
  processes in two pools (a, then b), long-lived for a run; exit 7 on a
  difference, both copies moved aside by a decisions entry, then recomputed
  (the stores' route); and the light phases (RANK, RESULT, the tries, the
  choice, the confirmation) twinned the same way, since each decides.

### Readings I will build unless you rule otherwise

- **Q4** `marketThrough` not imported; `markets.ts` builds the object step
  for step with the settlement rule as a parameter, held by tests to the
  kit's `marketFrom` and to `marketThrough`.
- **Q5** The positions hash step 2 holds step 1 to is the SHA-256 of the
  uncompressed lines sorted by entry id (C15 (c) 10's form), named in
  result.json beside the gz file's SHA-256, so a zlib change between steps
  cannot fake a difference.
- **Q6** Step 1's stores in `look1\store` and `look1\twin\store` (E's are the
  rehearsal's); `main.ts`'s `build`/`integrity` bodies become functions that
  both the tools and the steps call.
- **Q7** The engine folders sealed for every reader but the step's engine
  (C15's "every other reader refuses them by name"): a third seal state set
  only by the engine runner.
- **Q8** Vault accounts are left out before labels (C2's population), named
  and counted.
- **Q9** Funding rows stamped at or after a coin's end (a settled coin) are
  left out of its object and counted (`marketThrough` would throw; none can
  fall in a hold).
- **Q10** The last-price object's Settlement minute carries the Settlement
  price, as the VWAP object's ("the same").
- **Q11** Thin legs: the follow instant and every exit leg, the cut leg at
  END − 1 ms included, a settled copy's last leg not (its price is the
  Settlement's, not the tape's).
- **Q12** A minute has a mark exactly when its Σ sz > 0 or it is the coin's
  Settlement minute; the tripwire counts the same minutes (C16's "exact");
  the rehearsal counts zero-size market trades (expected 0).
- **Q13** R14's full list for MAIN, TEN, BROAD and DAY (the paper's
  `lookReport` lines); C12's m, SE, m′, SE′ with n, traders and days for
  every line beside (the paper's `besideLines`, plus m′ and SE′).
- **Q14** Concentration: the top 1% = ⌈traders ÷ 100⌉ by their sums of x;
  the event level's mean with its CR1 error by UTC day; "most copies of one
  trader" over the set.
- **Q15** A try's set is its line's copies of E voted by END_E (a look's
  set); m over the priced, m′ over those with a d; the choice's 100 traders
  and 100 days counted on the priced copies.
- **Q16** The covariate names and units above (hours for the median hold,
  USD for the size, bps for the prior mean).
- **Q17** FRESH-2's integrity sample days are missing from C18:
  recommended the 15th of each of its months, 2026-12-15 → 2027-05-15 (S's
  rule), a C18 row at part 5's touch.
- **Q18** FRESH-2's report: the judged sets' figures (C12's forms, the
  three sign means, unpriced share) and the copies' prints named "COPY-H's
  copies by UTC day/month"; no cascade print, no null mean gross.
- **Q19** A step refuses (exit 5) while `SETTLEMENT_MARK_MINUTES` or any
  set-before-the-freeze value is null.
- **Q20** "The closed copies only" leaves out settled copies (they were open
  when the coin settled).
- **Q21** Docs: I report my technical calls for your decisions entry, as
  the store's builders did, unless you want my own entry.
