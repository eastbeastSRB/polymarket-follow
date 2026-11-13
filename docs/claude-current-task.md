# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`) and runs daily; MARKET-1, the forward paper test of the
liquidation wave, is FROZEN (2026-11-13 14:29:11Z, tag `market1-freeze-1`),
deployed (14:33:39Z) and runs daily at 10:30Z.** The plan is the plan page
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
  - frozen: `market1/FROZEN.sha256`, 64 files,
    `b9e17505d8d4dfc87101b35c4908929b4ed18c6dd401cf723dfbab0c15452f1d`,
    commit `4832a6a`, tag `market1-freeze-1`;
  - START 2026-11-11; looks at the paper experiment's dates;
  - its daily task at 10:30Z once registered.

  Before the freeze:
  - two fresh reviews, the owner's ruling, MARKET-FIX's calls 1–12, a fresh
    fix-check, and MARKET-FIX-2's M0 wording and seven pinned breaks;
  - 240 of 249 deliberate breaks caught;
  - the old weeks reproduced byte for byte (153 entries, +309.7 ± 67.7);
  - `pnpm verify` green with and without the list (380 tests).
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07):
  - the collector's share is 50 and 15;
  - the experiment's is 120 and 15;
  - MARKET-1 reads nothing from the API.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **MARKET-1's second run (2026-11-14 10:30Z), the first with decided
   legs.**
   - The first run (2026-11-13 14:33:59–14:39:02Z, exit 0) passed its format
     check (F7 (c)): 3 days closed and checked; 52 hour files, the 20 missing
     being 11-10 before recording began; 12,095,293 lines, 0 failed; no
     alarm day, no unreadable coverage, no changed file.
   - Every non-P position entered on 11-12, so its legs wait for 11-13 to
     close (F3).
   - The book level's unit (decisions 2026-11-13, call 11) is confirmed from
     the first decided legs: depth-short legs must be rare.
   - No paper command by hand while a MARKET-1 run is live (rules.md M2).
2. **The daily runs:** the supervisor checks each program's log, budget and
   page; no running number is read as evidence before a look.
3. **D1** (the classifier v2's blind test, after 2026-11-21) and **D2**
   (R8's B2 confirmation, after 2026-11-30), each with its own share of the
   remaining 80 a minute (and a burst share: decisions 2026-11-13, Q12).
5. **Small collector follow-ups, when convenient:**
   - drop the boards' `consistent` flag;
   - a coverage mark for books that arrive late;
   - the backup task's trigger from UTC takes effect when the tasks are next
     registered;
   - the page's fee-category alarm (a naming mismatch in the collector's
     fees document).
6. **The v1 plan** (the plan page), early December.

## Last session (2026-11-13)

MARKET-FIND sharpened the small-coin lead into the wave. MARKET-PLAN planned
MARKET-1, and MARKET-BUILD built it. Two fresh reviews (rules and code) said
"after these fixes", and the owner approved the batch.

MARKET-FIX made the fixes:
- the page's freeze date;
- the book lookup's JSON spacing;
- the settings' refusals;
- a pure verdict function;
- the verdict box after a verdict;
- dead code out;
- many new tests.

A fresh MARKET-FIX-CHECK found every finding closed and asked for M0's
wording; MARKET-FIX-2 applied it word for word and pinned seven more
breaks. The supervisor verified each step on its own path and froze
MARKET-1 at 14:29:11Z.
