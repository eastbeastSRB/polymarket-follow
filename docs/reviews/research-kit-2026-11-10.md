# RESEARCH-KIT — round 2's one-minute panel, research kit and first measurements

RESEARCH-KIT (Opus 5.5, max), from 2026-11-10 14:37Z (UTC, every stamp from
`date -u`), for polymarket-follow's supervisor: foundation 2 and Appendix A.1
of IDEAS-REVIEW's report (decisions 2026-11-10, round 2's rules and the
collector approved). Evidence: the supervisor folder `workers/RESEARCH-KIT/`
(`kit/`, `scripts/`, `out/`, `progress.md`; paths below are relative to it)
and `F:\polymarket-follow-research\KIT\`. **The blind store held:** every
input ends at 2026-11-07T00:00:00Z; nothing about markets or accounts after it
was read (section 5).

**STATUS: IN PROGRESS** — committed early by the brief's rule. The panel's
pull runs (about 13 hours from 15:05Z); the proof's pricing parts, first
measurements 5, 7 and 8 and the final sections follow it. Figures below are
final where marked done.

## For the owner, in one page

*(written last)*

## 1. The panel

- **What:** one-minute marks (`mark-history`, 1 m), one-minute klines (volume,
  trade count) and hourly funding of 91 markets (90 enabled, plus KIOXIA-USD,
  retired 2026-09-28) from each market's first trading day (2026-05-06 for the
  first) to the cut. No stock split before the cut (`stock-splits` empty,
  2026-11-10 14:55Z).
- **Cost, stated before the pull** (`out/plan-cost.txt`): 19,409 calls, at most
  107,325 weighted tokens (marks 57,885, klines at most 28,880, funding
  20,560), 11.9 h of calls at 150 tokens a minute plus the 77-minute quiet
  window; foundation 2 had allowed at most 246,000.
- **How it pauses and resumes:** see `progress.md` ("THE PULL'S COST").
- *(coverage, the manifest's hash: after the pull)*

## 2. The kit

*(parts, fingerprint, proof, mutants — being written)*

- **Proof part 1 — done:** the kit's entry builder returns R8's entries
  exactly: 1,272 openings and flips of the primary arm (47 accounts), and all
  1,946 groups of both arms with the adds, each with the same account,
  instrument, first-fill instant, type and side; the delay equal for 1,919 of
  1,919 (`out/proof-entries.txt`).
- **Mutants — done for this version:** 52 of 52 killed (`out/mutation.txt`).

## 3. The first measurements

*(1, 2, 3, 4, 6 counted; 5, 7, 8 after the pull)*

## 4.–9. and the evidence list

*(to follow)*
