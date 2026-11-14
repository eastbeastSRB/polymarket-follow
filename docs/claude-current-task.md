# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`) and runs daily; MARKET-1, the forward paper test of the
liquidation wave, is FROZEN (2026-11-13, tag `market1-freeze-1`) and runs
daily at 10:30Z. WAVE-H, MARKET-1's wave tested once on Hyperliquid's
history, is being built (WAVE-H-BUILD, 2026-11-14): the reproduction holds,
the rehearsal and the look are code and tested; the rehearsal passed (M =
147, `waveh/sizing.json`, a draft freeze list); H10's marks change is
decided (decisions 2026-11-14, the supervisor's Q5 and Q6); nothing is
frozen or run on TEST.** The plan is the plan
page (docs/claude-master-plan.md); what exists is architecture.

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
- **WAVE-H** (architecture, "WAVE-H" and "WAVE-H's data download";
  decisions 2026-11-14, "WAVE-H's plan approved" and both WAVE-H-BUILD
  entries):
  - the rules `apps/poller/waveh/rules.md` (H0–H15 with R1–R10; M = 147 and
    SIZING's R9 counts written in); `dist/waveh.js` with `rehearse` and
    `look`; the reproduction through WAVE-H's own mapping: 727 = 695 + 32
    counted fills, 153 entries;
  - the download (`tools/waveh-fetch.cjs`): the sizing months and their 560
    book files complete; the test months downloading since 2026-11-14
    14:28Z (pid in `store/fetch/waveh-fetch.pid`), stored unopened, done
    about 2026-11-15 evening;
  - the rehearsal passed (run 2, 2026-11-14 14:29–15:43Z, exit 0): SIZING's
    425,433 counted fills, M = 147, 566 legs all priced at the book, 7 of
    290 positions without a funding mark (Q6); `sizing.json` (`5ac401a`);
    the draft list, 71 files, `4c08ef95…9056` (`c1fbeb8`);
  - not yet: H10's change and the rehearsal's third run (they supersede run
    2's `sizing.json` and draft), `data.sha256`.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07):
  - the collector's share is 50 and 15;
  - the experiment's is 120 and 15;
  - MARKET-1 reads nothing from the API; WAVE-H reads Hyperliquid and
    AWS only, never Polymarket.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **WAVE-H's test months** downloaded (the supervisor), then
   `waveh-freeze.cjs --data` (`data.sha256`, R3 (i)'s short files).
2. **WAVE-H's fresh rules and code reviews** after the owner's usage reset
   (2026-11-16), told that H10's change is decided; one fix round builds
   H10's change with the findings and runs the rehearsal a third time (M
   must stay 147); a fix-check; the freeze (the supervisor); then the one
   look (H15's two steps, `--max-old-space-size=8192`).
3. **MARKET-1's daily runs** (10:30Z): the first decided legs confirm the
   book level's unit (decisions 2026-11-13, call 11); no paper command by
   hand while a MARKET-1 run is live (rules.md M2).
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
8. **The v1 plan** (the plan page), early December.

## Last session (2026-11-14)

WAVE-H-BUILD built WAVE-H in two sessions (the first stopped at its context
limit). The reproduction holds through WAVE-H's own mapping. The gate seals
every store file dated from 2025-08-01 until WAVE-H's freeze verifies; every
reader takes it, and each refusal is tested. The rehearsal (`rehearse`) and
the one look (`look`, H15's two steps, its lines beside and prints through
MARKET-1's own code) are built and tested in synthetic stores, with
deliberate breaks in scratch copies. `pnpm verify` is green, and both
freezes still verify (61 and 64 files). The rehearsal waits for the sizing
download.
