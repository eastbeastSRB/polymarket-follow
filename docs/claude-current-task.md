# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`) and runs daily; MARKET-1, the forward paper test of the
liquidation wave, is FROZEN (2026-11-13, tag `market1-freeze-1`) and runs
daily at 10:30Z. WAVE-H, MARKET-1's wave tested once on Hyperliquid's
history, is FROZEN (2026-11-16, tag `waveh-freeze-1`) and its one look says
NOT SETTLED (2026-11-17). The polishing (a sharpened rule chosen on WAVE-H's
10 months, then one exam on FRESH's months) is approved (2026-11-17): its
extraction is built, reviewed, fixed and checked (2026-11-18) and runs from
a separate build of the checked commit once FRESH's download ends; its
exploration is built (2026-11-18, POLISH-EXPLORE, -2 and -3), not run.** The
plan is the plan page (docs/claude-master-plan.md); what exists is
architecture.

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **The collector is live** (architecture, "The collector").
- **The paper experiment** (architecture, "The paper experiment"): frozen,
  `apps/poller/experiment/FROZEN.sha256`, 61 files, `d04d3cd8…f31c`; its
  daily task at 04:00Z; looks 2026-12-19, 2027-02-06, 2027-05-08.
- **MARKET-1** (architecture, "MARKET-1"): `dist/market1.js`; frozen,
  `market1/FROZEN.sha256`, 64 files, `b9e17505…2f1d`; its daily task at
  10:30Z.
- **WAVE-H** (architecture, "WAVE-H"; decisions 2026-11-17, "WAVE-H — the
  one look's result"): frozen, `waveh/FROZEN.sha256`, 74 files,
  `864990da…8dd2`; its data `waveh/data.sha256`, 9,975 files; the one look
  NOT SETTLED, reproduced by its Final review.
- **FRESH, the months after WAVE-H's data** (architecture, "WAVE-H's data
  download"): downloading since 2026-11-17 18:23Z into
  `F:\polymarket-follow-research\FRESH\store\`, never opened until a
  sharpened rule is frozen; slowed by the network path to AWS (decisions
  2026-11-18).
- **The polishing** (decisions 2026-11-17, "THE POLISHING PLAN APPROVED"):
  - the extraction (architecture, "The analyzer"): `dist/polish.js`
    `extract`, `gates`, `explore`; checked (decisions 2026-11-18,
    "EXTRACT-FIX-CHECK accepted"); it runs from a detached worktree build
    of the checked commit, `E:\coding\polymarket-follow-polish-run`, digest
    `88c6efb0…` (decisions 2026-11-18, "POLISH-EXPLORE's plan approved");
  - the exploration (architecture, "The exploration"; decisions
    2026-11-18, "the exploration built"): `explore --step features | e |
    choice | c | beside`, from main's build, after the gates pass.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07). The
  analyzer reads only local files.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **The extraction run on the 10 months, by the supervisor, once FRESH's
   download has ended**, from the run's worktree, as ruled (decisions
   2026-11-18, "POLISH-EXPLORE's plan approved"): `extract`, then `gates`
   (all of G0–G6 must pass), then `explore` (the frame). Detached at idle
   priority, outside 02:30–06:00Z and 10:25–11:15Z, no heap flag; the
   settings `WAVEH_STORE=F:\polymarket-follow-research\WAVE-H\store`,
   `ANALYZER_ROOT=F:\polymarket-follow-research\ANALYZER\WAVE-H` and, for
   `gates`, `WAVEH_ROOT=F:\polymarket-follow-research\FIND-SLOTS\WAVE-H-BUILD-rehearsal`.
2. **The exploration's five steps, by the supervisor**, from
   `E:\coding\polymarket-follow\apps\poller` (main's build, a clean tree
   after `pnpm verify`), the same three settings, one at a time, each after
   the last exited 0; after each, its output's SHA-256 into the supervisor's
   notes before the next starts; a measured peak above 10 GB stops the run:

   | Run | Command | Writes (in `ANALYZER_ROOT\explore\`) | Time (estimate) | Peak (estimate) |
   |---|---|---|---|---|
   | 1 | `node dist\polish.js explore --step features` | `features.json`, `cuts.json` | 20–40 min | 3–6 GB |
   | — | the cuts commit: `explore\cuts.json` copied as it is to `apps\poller\polish\cuts.json`, committed by name with `pnpm verify` (no `dist` change) | | | |
   | 2 | `… explore --step e` | `e-positions.jsonl.gz`, `e.json` | 30–60 min | 4–8 GB |
   | 3 | `… explore --step choice` | `choice-positions.jsonl.gz`, `choice.json` | 10–25 min | 3–6 GB |
   | 4 | `… explore --step c` | `c-positions.jsonl.gz`, `c.json` | 20–45 min | 3–6 GB |
   | 5 | `… explore --step beside` | `beside.json` | 20–40 min, plus the book prints (slice 0's held book files from `WAVEH_STORE`: about G3's book reading, each file scanned once a leg, 5 legs a position against G3's 2) | 4–8 GB |

   Exit codes: 0 done; 1 a crash; 2 bad settings or a heap flag; 4
   WAVE-H's freeze; 5 not ready; 6 a check failed. The log:
   `ANALYZER_ROOT\logs\polish-<day>.log` (copy it; pruned after 30 days).
3. **POLISH-EXPLORE's report** (`docs/reviews/polish-explore-<date>.md`),
   its Final review (steps 2–4 recomputed by independent code from the
   positions files), the owner's ruling on the nominee, then the exam's
   rules, reviews and freeze, then look 1 on FRESH.
4. **MARKET-1's daily runs** (10:30Z): no paper command by hand while a
   MARKET-1 run is live (rules.md M2).
5. **The daily runs:** the supervisor checks each program's log, budget and
   page; no running number is read as evidence before a look.
6. **D1** (the classifier v2's blind test, after 2026-11-21) and **D2**
   (R8's B2 confirmation, after 2026-11-30), each with its own share of the
   remaining 80 a minute.
7. **MARKET-1's second arm** after the polishing's freeze, with the
   polished rule (decisions 2026-11-17, the polishing plan's answers, 7).
8. **Small collector follow-ups, when convenient:** drop the boards'
   `consistent` flag; a coverage mark for books that arrive late; the
   backup task's trigger from UTC; the page's fee-category alarm.
9. **The v1 plan** (the plan page), early December.

## Last session (2026-11-18, POLISH-EXPLORE-3)

The exploration's build finished, on POLISH-EXPLORE's brief and the
supervisor's rulings: `8c2f479` the breaks round (234 breaks of
`src/polish/tries/` and `main.ts`'s explore branch; 156 killed at once, 4
equivalent, the other 74 killed by new tests; `steps.ts` `CUTS_FILE`),
`5f3f13f` the two book prints (`tries/books.ts`: the tape against the book
by delay and the $10,000 and $50,000 walks, on slice 0's held books
through WAVE-H's own book code; 24 breaks, all killed), and these docs.
Each with `pnpm verify` green in the same command (at `5f3f13f`: 76 + 1
files, 689 + 5 tests) and the three freezes verified after. No outcome on
any real data; the run's worktree untouched. Decisions 2026-11-18, "the
exploration built".
