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
(2026-11-18) and wait for that download to end.** The plan is the plan page
(docs/claude-master-plan.md); what exists is architecture.

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
  2026-11-18, EXTRACT-BUILD's technical calls): `dist/polish.js` with
  `extract`, `gates` and the frame of `explore`. A one-day timing ran on
  2025-10-10 into `F:\polymarket-follow-research\ANALYZER\timing-2025-10-10\`
  (about 3 GB with the fsync check's copies; left for the supervisor to
  delete); the whole run is about 70 minutes.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07): the
  collector's share 50 and 15, the experiment's 120 and 15; MARKET-1 reads
  nothing from the API; WAVE-H, FRESH and the analyzer read no Polymarket
  endpoint (the analyzer reads only local files).
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **EXTRACT-REVIEW** (fresh): the extraction's code review, its fixes and a
   fix-check if needed (plan section 6, step 4).
2. **The extraction run on the 10 months, by the supervisor, once FRESH's
   download has ended** (step 5): from `E:\coding\polymarket-follow\apps\poller`
   on a clean tree after `pnpm verify`, detached through WMI at idle
   priority (a `.cmd` that sets the settings, as WAVE-H's look), outside
   02:30–06:00Z and 10:25–11:15Z, starting at least 45 minutes before a
   window for `gates`:
   - `extract`: `WAVEH_STORE=F:\polymarket-follow-research\WAVE-H\store`,
     `ANALYZER_ROOT=F:\polymarket-follow-research\ANALYZER\WAVE-H`,
     `node --max-old-space-size=16384 dist\polish.js extract`: about 70 min,
     at most about 6 GB of memory, about 47 GB of parts and 23 GB of store
     on F:; it resumes from its parts if stopped; its log in
     `<ANALYZER_ROOT>\logs\`;
   - `gates`: the same two and
     `WAVEH_ROOT=F:\polymarket-follow-research\FIND-SLOTS\WAVE-H-BUILD-rehearsal`,
     `node --max-old-space-size=16384 dist\polish.js gates`: about 30 min;
     `gates\gates.json`; exit 6 when a gate fails;
   - `explore`: the same, `dist\polish.js explore`: a minute; it prints the
     store's identity and counts and stops ("no try is defined");
   - exit codes: 0 done, 1 a crash, 2 bad settings, 4 WAVE-H's freeze does
     not verify, 5 not ready, 6 a gate failed;
   - after EXTRACT-REVIEW closes, the supervisor deletes `parts\` (Q4).
3. **POLISH-EXPLORE** (step 6): the tries, the try log, the choice rule;
   then its Final review, the owner's ruling, the exam's rules and freeze.
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

## Last session (2026-11-17/18, EXTRACT-BUILD, then EXTRACT-BUILD-2)

The polishing's extraction, on EXTRACT-BUILD's approved plan, each commit
gated on `pnpm verify` with the three freezes verified after each (61, 64,
74): EXTRACT-BUILD's six (`b40a3a4` the LZ4 decoder … `1f2b892` the program
and `extract`), then EXTRACT-BUILD-2's: the one-day timing and the fsync
measurement; `9b0fce1` the parts and columns without fsync; `5a5588f` the
counted fills, the legs, the gates G0–G6 and `gates`; `161f01f` the frame
of `explore`; `f914b17` tests for the breaks' survivors (70 breaks in a
scratch copy: 47 killed in round one, the 23 survivors and one re-aimed
break killed in round two); and these docs. At the end `pnpm verify` was
green: 64 files + 1 skipped, 584 tests + 5 skipped (decisions 2026-11-18,
EXTRACT-BUILD's technical calls).
