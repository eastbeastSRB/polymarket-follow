# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`) and runs daily; MARKET-1, the forward paper test of the
liquidation wave, is FROZEN (2026-11-13, tag `market1-freeze-1`) and runs
daily at 10:30Z. WAVE-H, MARKET-1's wave tested once on Hyperliquid's
history, is FROZEN (2026-11-16, tag `waveh-freeze-1`) and its one look says
NOT SETTLED (2026-11-17: +82.6 bps a position, SE 40.9, 1,289 priced); its
Final review reproduced it exactly. The polishing (a sharpened rule chosen
on WAVE-H's 10 months, then one exam on FRESH's months) is approved
(2026-11-17); FRESH's download runs since 2026-11-17 18:23Z; the
analyzer's extraction, its gates and the frame of `explore` are built
(2026-11-18), their Final review's findings fixed (EXTRACT-FIX); the
fix-check comes next, then the run once FRESH's download ends.** The plan
is the plan page (docs/claude-master-plan.md); what exists is architecture.

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **The collector is live** (architecture, "The collector").
- **The paper experiment** (architecture, "The paper experiment"; decisions
  2026-11-12, from "APPROACH-REVIEW accepted" to "the freeze"): frozen,
  `apps/poller/experiment/FROZEN.sha256`, 61 files, `d04d3cd8…f31c`; its
  daily task at 04:00Z; looks 2026-12-19, 2027-02-06, 2027-05-08.
- **MARKET-1** (architecture, "MARKET-1"; decisions 2026-11-13, from "the
  market lead" to "MARKET-1 — the freeze"): `dist/market1.js`, rules in
  `apps/poller/market1/rules.md`; frozen, `market1/FROZEN.sha256`, 64 files,
  `b9e17505…2f1d`, tag `market1-freeze-1`; START 2026-11-11; its daily task
  at 10:30Z.
- **WAVE-H** (architecture, "WAVE-H"; decisions 2026-11-16, "WAVE-H — the
  freeze"; 2026-11-17, "WAVE-H — the one look's result" and "WAVE-H's Final
  review accepted"): frozen, `waveh/FROZEN.sha256`, 74 files,
  `864990da…8dd2`, tag `waveh-freeze-1`; its data `waveh/data.sha256`, 9,975
  files, `b66a9bb0…676c`; the one look NOT SETTLED (band −23.0 to +188.1 bps
  at z 2.58), reproduced by the Final review
  (`docs/reviews/wave-h-look-2026-11-17.md`).
- **FRESH, the months after WAVE-H's data** (architecture, "WAVE-H's data
  download"; decisions 2026-11-17, "FRESH-FETCH verified"): started
  2026-11-17 18:23:01Z by the supervisor, 4,102 + 170 files, 161.3 GB
  planned, about 27 h; into `F:\polymarket-follow-research\FRESH\store\`,
  never opened until a sharpened rule is frozen.
- **The polishing** (decisions 2026-11-17, "THE POLISHING PLAN APPROVED";
  the plan `docs/reviews/wave-polish-plan-2026-11-17.md`, section 6's steps):
  step 3, the extraction, is built (architecture, "The analyzer"; decisions
  2026-11-18, EXTRACT-BUILD's technical calls) and its Final review
  (`docs/reviews/extract-review-2026-11-18.md`) fixed in one round
  (decisions 2026-11-18, EXTRACT-REVIEW's findings, and EXTRACT-FIX's
  calls). Two one-day timing stores of 2025-10-10 exist under
  `F:\polymarket-follow-research\ANALYZER\`: `timing-2025-10-10\` (the
  reviewed code; the fix-check compares against it) and
  `timing-2025-10-10-b\` (the fixed code); both left for the supervisor to
  delete.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07): the
  collector's share 50 and 15, the experiment's 120 and 15; MARKET-1 reads
  nothing from the API; WAVE-H, FRESH and the analyzer read no Polymarket
  endpoint (the analyzer reads only local files).
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **EXTRACT-FIX-CHECK** (fresh, Sonnet): the 20 unbacked survivors die,
   the new gates pass on the synthetic world and on the rebuilt one-day
   store, EXTRACT-REVIEW's `indep2.cjs` finds 0 differences on
   `timing-2025-10-10-b\` (decisions 2026-11-18, EXTRACT-REVIEW's findings,
   Q7).
2. **The extraction run on the 10 months, by the supervisor, once FRESH's
   download has ended** (step 5): from `E:\coding\polymarket-follow\apps\poller`
   on a clean tree after `pnpm verify`, detached through WMI at idle
   priority (the `.cmd` files in the supervisor folder's
   `workers\EXTRACT-FIX\run\`), outside 02:30–06:00Z and 10:25–11:15Z,
   starting at least 45 minutes before a window for `gates`, **with no heap
   flag** (`dist\polish.js` refuses one, exit 2; the program has its own
   16 GB, each pass worker 4 GB):
   - `extract`: `WAVEH_STORE=F:\polymarket-follow-research\WAVE-H\store`,
     `ANALYZER_ROOT=F:\polymarket-follow-research\ANALYZER\WAVE-H`,
     `node dist\polish.js extract`: about 70 min, at most about 6 GB of
     memory, about 47 GB of parts and 23 GB of store on F:; it resumes from
     its parts if stopped; its log in `<ANALYZER_ROOT>\logs\` (copy it:
     logs older than 30 days are pruned);
   - `gates`: the same two and
     `WAVEH_ROOT=F:\polymarket-follow-research\FIND-SLOTS\WAVE-H-BUILD-rehearsal`,
     `node dist\polish.js gates`: about 40 (G6 about 5 min on 2025-10-10, about 10 GB of heap) min; `gates\gates.json`;
     exit 6 when a gate fails;
   - `explore`: the same, `node dist\polish.js explore`: a minute; it
     prints the store's identity and counts to its log and stops ("no try
     is defined");
   - exit codes: 0 done, 1 a crash, 2 bad settings or a heap flag, 4 WAVE-H's
     freeze does not verify, 5 not ready, 6 a gate failed;
   - after the run is accepted, the supervisor deletes `parts\` (Q4).
3. **POLISH-EXPLORE** (step 6): the tries, the try log, the choice rule;
   then its Final review, the owner's ruling, the exam's rules and freeze.
   Its library: `library.ts` and `legs.ts` (`knownAt` for any decision at
   an instant; architecture, "The analyzer").
4. **MARKET-1's daily runs** (10:30Z): no paper command by hand while a
   MARKET-1 run is live (rules.md M2).
5. **The daily runs:** the supervisor checks each program's log, budget and
   page; no running number is read as evidence before a look.
6. **D1** (the classifier v2's blind test, after 2026-11-21) and **D2**
   (R8's B2 confirmation, after 2026-11-30), each with its own share of the
   remaining 80 a minute (and a burst share: decisions 2026-11-13, Q12).
7. **MARKET-1's second arm** after the polishing's freeze, with the polished
   rule (decisions 2026-11-17, the polishing plan's answers, 7).
8. **Small collector follow-ups, when convenient:** drop the boards'
   `consistent` flag; a coverage mark for books that arrive late; the
   backup task's trigger from UTC takes effect when the tasks are next
   registered; the page's fee-category alarm.
9. **The v1 plan** (the plan page), early December.

## Last session (2026-11-18, EXTRACT-FIX)

EXTRACT-REVIEW's findings, M1–M4 and L1–L12, fixed in one round, one fix a
commit, each gated on `pnpm verify` with the three freezes verified after
each (61, 64, 74): `2ca3ae4` the split of gates.ts (a pure move), `86ab8ef` M1, `e53d123` M3, `d3de0ef` G5 exact across a file boundary, `940dc51` M2, `a440a63` L2, `819a890` L1, `62f7719` M4, `27e067a` L11, `b1e659d` L3, `b728ca9` L5 (the launcher: no heap flag), `914e39b` L6, `b48db4c` L7, `3e4aebf` L8, `ba5099e` L12, `7a9b386` L9, `6e8b8aa` the tests' cleanup limit, and these docs. Breaks in a scratch copy: 49 of 49 killed by their tests (EXTRACT-REVIEW's 20 unbacked survivors and S2–S5, and 25 of the new checks). The
one-day store `timing-2025-10-10-b\`: 52 s (the pass 44 s, the merge 7 s), a peak working set of 2,670 MiB, the program's heap ceiling 16,576 MB and each pass worker's 4,288 MB, every counter 0, every file's `unpaired` empty, every row conserved; G6 on 2025-10-10 against it: 331 s, a 10.4 GB working set (8.9 GB of heap), nothing differing but the 350 contexts at 23:59 a timing store cannot have. At the end `pnpm verify`
was green: 64 files + 1 skipped, 610 tests + 5 skipped (decisions 2026-11-18, EXTRACT-FIX's calls).
