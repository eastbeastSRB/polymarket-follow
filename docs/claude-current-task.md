# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`) and runs daily; MARKET-1, the forward paper test of the
liquidation wave, is FROZEN (2026-11-13 14:29:11Z, tag `market1-freeze-1`),
deployed (14:33:39Z) and runs daily at 10:30Z. WAVE-H, MARKET-1's wave tested
once on Hyperliquid's history, is planned and reviewed; its download tool is
built, passed its smoke test and waits for the supervisor's start; its rules
wait for the owner.** The plan is the plan page (docs/claude-master-plan.md); what
exists is architecture.

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **The collector is live** (architecture, "The collector").
- **The paper experiment** (architecture, "The paper experiment"; decisions
  2026-11-12, from "APPROACH-REVIEW accepted" to "the freeze"):
  - frozen: `apps/poller/experiment/FROZEN.sha256`, 61 files,
    `d04d3cd8…f31c`;
  - its daily task at 04:00Z;
  - looks 2026-12-19, 2027-02-06, 2027-05-08.
- **MARKET-1** (architecture, "MARKET-1"; decisions 2026-11-13, from "the
  market lead" to "MARKET-1 — the freeze"):
  - `dist/market1.js`, with its rules in `apps/poller/market1/rules.md`;
  - frozen: `market1/FROZEN.sha256`, 64 files,
    `b9e17505d8d4dfc87101b35c4908929b4ed18c6dd401cf723dfbab0c15452f1d`,
    commit `4832a6a`, tag `market1-freeze-1`;
  - START 2026-11-11; looks at the paper experiment's dates;
  - its daily task at 10:30Z.
- **WAVE-H** (decisions 2026-11-13, the owner's ruling, and 2026-11-14,
  "WAVE-H's download spec"):
  - the plan, `docs/reviews/wave-h-plan-2026-11-13.md`, and its fresh
    review, `docs/reviews/wave-h-plan-review-2026-11-14.md` (download: safe
    after D1–D8; plan: approvable after R1–R10);
  - the download tool `tools/waveh-fetch.cjs` and its start script
    `tools/waveh-fetch-start.ps1` (architecture, "WAVE-H's data download";
    decisions 2026-11-14, WAVE-H-FETCH's technical calls): built, tested
    with no network, its smoke test passed (3 requests); not yet run on the
    store;
  - the rules (H0–H15) and R1–R10 wait for the owner.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07):
  - the collector's share is 50 and 15;
  - the experiment's is 120 and 15;
  - MARKET-1 reads nothing from the API; WAVE-H reads Hyperliquid and
    AWS only, never Polymarket.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **WAVE-H's download, the first session** (decisions 2026-11-14, the
   spec's point 8):
   - WAVE-H-FETCH's smoke test passed (2026-11-14 06:02Z: one listing,
     one sizing file whose MD5 equals its ETag, one `fundingHistory` read,
     all HTTP 200; external-apis, "Other venues");
   - the supervisor reads the tool against D1–D8, then starts it:
     `tools\waveh-fetch-start.ps1 -SizingOnly` (about 35 GB, the sizing
     months), with one mid-file kill and restart;
   - then the supervisor's check of the collector's day (its price audits
     and warnings) and the tool's log, before the test months
     (`tools\waveh-fetch-start.ps1`, the full run);
   - each morning: `-Check`, `fetch\problems.jsonl`, the collector's log.
2. **MARKET-1's daily runs** (10:30Z): the first decided legs confirm the
   book level's unit (decisions 2026-11-13, call 11); no paper command by
   hand while a MARKET-1 run is live (rules.md M2).
3. **The daily runs:** the supervisor checks each program's log, budget and
   page; no running number is read as evidence before a look.
4. **D1** (the classifier v2's blind test, after 2026-11-21) and **D2**
   (R8's B2 confirmation, after 2026-11-30), each with its own share of the
   remaining 80 a minute (and a burst share: decisions 2026-11-13, Q12).
5. **MARKET-1's second arm** about 2026-11-20 (decisions 2026-11-13, the
   owner's rulings after the deploy).
6. **Small collector follow-ups, when convenient:**
   - drop the boards' `consistent` flag;
   - a coverage mark for books that arrive late;
   - the backup task's trigger from UTC takes effect when the tasks are next
     registered;
   - the page's fee-category alarm (a naming mismatch in the collector's
     fees document).
7. **The v1 plan** (the plan page), early December.

## Last session (2026-11-14)

WAVE-H-PLAN planned WAVE-H, and a fresh review agreed the download "safe
after D1–D8". The supervisor wrote the download's spec into decisions.
WAVE-H-FETCH built the tool to it:
- the plan's keys only, hashed as they come, never read back;
- one request at a time at 2 MB/s, the pause windows, the error ladder;
- the watch on the collector's heartbeat, failing closed;
- the F: floor, the cap, a lock, a stop file, `--plan`, `--sizing-only`;
- a detached start through WMI at idle priority.

Its 37 tests run with a fake clock and a fake bucket. The deliberate breaks
ran in a scratch copy (decisions, WAVE-H-FETCH's entry). `pnpm verify` is
green, and both freezes still verify.
