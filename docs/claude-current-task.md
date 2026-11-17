# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`) and runs daily; MARKET-1, the forward paper test of the
liquidation wave, is FROZEN (2026-11-13, tag `market1-freeze-1`) and runs
daily at 10:30Z. WAVE-H, MARKET-1's wave tested once on Hyperliquid's
history, is FROZEN (2026-11-16, tag `waveh-freeze-1`) and its one look says
NOT SETTLED (2026-11-17: +82.6 bps a position, SE 40.9, 1,289 priced); its
Final review reproduced it exactly, so the answer is final. The download of
the months after WAVE-H's data (FRESH), for one real test of a sharpened
rule, is built and waits for the supervisor's start.** The plan is the plan page
(docs/claude-master-plan.md); what exists is architecture.

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
  - frozen: `market1/FROZEN.sha256`, 64 files, `b9e17505…2f1d`, commit
    `4832a6a`, tag `market1-freeze-1`;
  - START 2026-11-11; looks at the paper experiment's dates;
  - its daily task at 10:30Z.
- **WAVE-H** (architecture, "WAVE-H"; decisions 2026-11-16, "WAVE-H — the
  freeze"; 2026-11-17, "WAVE-H — the one look's result" and "WAVE-H's Final
  review accepted"):
  - frozen: `waveh/FROZEN.sha256`, 74 files, `864990da…8dd2`, commit
    `9f99a0b`, tag `waveh-freeze-1`; its data `waveh/data.sha256`, 9,975
    files, `b66a9bb0…676c`;
  - the one look: **NOT SETTLED**, band −23.0 to +188.1 bps at z 2.58;
  - the report and Final review (`docs/reviews/wave-h-look-2026-11-17.md`):
    independent code reproduces every position, price and the verdict; its
    notes are kept for the next tests' rules.
- **FRESH, the months after WAVE-H's data** (architecture, "WAVE-H's data
  download"; decisions 2026-11-17, the owner's go and FRESH-FETCH's calls):
  - `tools/waveh-fetch.cjs --fresh`: `node_fills_by_block` hours from
    2026-05-29 02h, `asset_ctxs` days from 2026-05-29, both before
    `FRESH_END` 2026-11-16T00:00Z, and 342 funding reads, into
    `F:\polymarket-follow-research\FRESH\store\`, stored unopened until a
    sharpened rule is frozen;
  - listed 2026-11-17 17:10Z: 4,102 + 170 files, 161.3 GB planned (cap
    164.6 GB), about 27 h at 2 MB/s with the pause windows;
  - not started yet.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07):
  - the collector's share is 50 and 15;
  - the experiment's is 120 and 15;
  - MARKET-1 reads nothing from the API; WAVE-H and FRESH read Hyperliquid
    and AWS only, never Polymarket.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **FRESH's download, started by the supervisor:**
   - `node tools\waveh-fetch.cjs --fresh --plan --store
     F:\polymarket-follow-research\FRESH\store --heartbeat
     E:\polymarket-follow-run\var\heartbeat.json` (14 listings);
   - then `powershell -NoProfile -ExecutionPolicy Bypass -File
     tools\waveh-fetch-start.ps1 -Fresh`, and `-Fresh -Check` to watch it;
   - stop: `New-Item -ItemType File
     F:\polymarket-follow-research\FRESH\store\fetch\waveh-fetch.stop`.
2. **The polishing** (the plan page, "after WAVE-H's Final review"): a
   sharpened rule chosen on the 10 months already seen, frozen, then its
   one test on FRESH's months; the review's notes go into its rules.
3. **MARKET-1's daily runs** (10:30Z): no paper command by hand while a
   MARKET-1 run is live (rules.md M2).
4. **The daily runs:** the supervisor checks each program's log, budget and
   page; no running number is read as evidence before a look.
5. **D1** (the classifier v2's blind test, after 2026-11-21) and **D2**
   (R8's B2 confirmation, after 2026-11-30), each with its own share of the
   remaining 80 a minute (and a burst share: decisions 2026-11-13, Q12).
6. **MARKET-1's second arm** about 2026-11-20 (decisions 2026-11-13, the
   owner's rulings after the deploy).
7. **Small collector follow-ups, when convenient:** drop the boards'
   `consistent` flag; a coverage mark for books that arrive late; the
   backup task's trigger from UTC takes effect when the tasks are next
   registered; the page's fee-category alarm.
8. **The v1 plan** (the plan page), early December; the backlog's ideas
   after WAVE-H's answer.

## Last session (2026-11-17, FRESH-FETCH)

`tools/waveh-fetch.cjs` extended to FRESH's range, each change gated on
`pnpm verify` with the three freezes verified after each (61, 64, 74):
`54f77fb` the `--books` cap counts its own keys only; `153fead` a pause's
end judged only on a reading taken at or after it; `263a6bf` the rate steps
back after 30 clean minutes, doubled up to the full rate; `0525e22` the
FRESH range (`--fresh`); `5a28c47` one store per range and one download on
the line, and the start script's `-Fresh`; `89dcca8` tests for the breaks'
six survivors. 58 breaks in scratch copies, 52 killed in round one and the
other 6 in round two. At the end `pnpm verify` was green: 57 files + 1
skipped, 527 tests + 5 skipped. The start script was proven on scratch
stores without a heartbeat, so no request could start (decisions
2026-11-17, FRESH-FETCH's technical calls).
