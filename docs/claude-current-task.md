# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) is built, Final-reviewed
and records around the clock; research round 2's FIND stage is done and
nothing passed; the forward paper experiment is built to "rules ready"
(PAPER-BUILD, 2026-11-12) and waits for its fresh rules review, the freeze and
the owner's deploy.** The plan is the plan page (docs/claude-master-plan.md);
what exists is architecture.

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **The collector is live** (architecture, "The collector"): books and trades
  of every market, the minute reads, the nightly passes, the rule book, health
  and `status`, the daily backup. Its code now sends the generic User-Agent
  `data-collector/1.0` (REST and WebSocket) and `once.js` is gone; the live
  copy changes at its next deploy (the owner's).
- **Research:** R1–R8 closed; R8 FAILS; round 2's FIND: nothing passes; the
  exploring check with exits copied leaves every group losing (decisions
  2026-11-12). The reports: `docs/reviews/`.
- **The paper experiment** (decisions 2026-11-12: APPROACH-REVIEW accepted;
  the paper experiment runs daily and gets a page; its plan approved with its
  review's fixes; PAPER-BUILD's technical calls): built in `apps/poller`
  (`dist/paper.js`, `src/paper/`, the vendored kit and lib-exits in
  `research/`, `experiment/rules.md`), parts 0–5, `pnpm verify` green (32
  files, 248 tests). The seed and the pre-cut panel are in
  `F:\polymarket-follow\paper\`. The reproduction on the old weeks matches
  (FIND-6-EXITS, X3, FIND-3's d, the kit's labels, the main line's counts);
  the live checks on pre-cut windows match. **Nothing after the cut has been
  read; the program's gate refuses it until `experiment/FROZEN.sha256`
  exists.** The draft list: `experiment/FROZEN.draft.sha256`
  (`23f0e343…f4fd4`, 60 files). Not built: MAKER and VWAP (Q-D).
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07, wave 1
  closed); the collector's share is 50 a minute and 30 in 5 s; the
  experiment's 120 and 15.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes.

## Next up — IN ORDER

1. **The supervisor answers PAPER-BUILD's questions** (its closing message
   and `workers/PAPER-BUILD/progress.md`): Q2 d's removal set (as built: the
   line's accounts at M), Q3 a Monday's facts from the fills before M (as
   built), Q1 and Q4 (the reproduction's scope).
2. **A fresh rules review** of `apps/poller/experiment/rules.md` and the code
   (a different model), verdict "may run".
3. **The freeze:** the owner's favourites into `experiment/favourites.txt`
   (`from <F0>`, ≤ 20 addresses), `pnpm verify`, `node tools/paper-freeze.cjs
   --final`, the commit tagged `paper-freeze-1`, the list's SHA-256 in
   decisions.
4. **The owner's deploy and registration:** `tools\deploy.ps1` (the collector,
   for its User-Agent), `tools\deploy.ps1 -Program paper`, then
   `tools\register-tasks.ps1` elevated once (adds "polymarket-follow paper",
   daily 04:00Z); the first run reads the backlog (16–26 h).
5. **Small collector follow-ups, when convenient:** drop the boards'
   `consistent` flag; a coverage mark for books that arrive late; the backup
   task's trigger computed from UTC as the paper's is.
6. D1 and D2 after the freeze, each with its own share of the remaining 80 a
   minute.

## Last session (2026-11-12)

PAPER-BUILD built the forward paper experiment, parts 0–5 (commits
`51724ca` … `08147f5`): the vendored kit and lib-exits; the client with a
route table, burst and User-Agent per instance; the experiment's reads, gate,
loop, holes, alarm and files; the seed and the panel join, checked against
the kit and live on pre-cut windows (777 calls, 5,060 tokens); the scorer,
statistics, verdict, page, look and entry point (45 of 45 mutants killed);
the reproduction on the old weeks and a rehearsal page; rules.md final, the
draft freeze list, deploy.ps1 `-Program paper` and the paper task in
register-tasks.ps1, tested on a scratch run root only.
