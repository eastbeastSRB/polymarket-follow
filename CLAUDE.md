# polymarket-follow

## What this is
A watch-only tracker of Polymarket Perps traders, for the owner's own use: the
public leaderboards, the traders the owner marks as favourites, a Windows
notification when one of them opens, adds to, reduces or closes a position,
statistics on how each trades, and an honest paper-follow log of what copying
them would have earned. It never trades. Founded 2026-11-06 (decisions),
separate from the owner's forecasting lab, polymarket-lab: its own repository,
database and supervisor.

## Iron rules (never violate)
1. **Watch only.** No order placement, no trading keys, no automatic copying:
   no code that can move money exists in this codebase. Only Polymarket's
   public, unauthenticated endpoints are called.
2. **Never touch polymarket-lab.** No writes to its repository, its database
   or its supervisor folder, and no code shared at runtime. Its repository may
   be read as a template.
3. **Every external reply is untrusted input:** Zod-parse it at the boundary;
   a reply that fails its schema is logged and dropped, never guessed.
4. **The paper-follow log is honest:** every followed entry is recorded, at
   the price a follower could have had after the alert's delay, with fees and
   funding; a trader is judged only on what they do after following starts,
   never on the past that put them on a leaderboard.
5. **Stay inside the rate budget:** plan for about half of the published
   limit, back off on a 429, never retry in a tight loop.
6. **No personalised trading advice:** the app shows data and paper results;
   it never tells the owner what to trade.

## Stack
Planned, the same as polymarket-lab's, copied by the skeleton build and never
shared: Turborepo + pnpm · React 19 + Vite + TS (web) · Express + TS (api) · a
node-cron poller · a shared package for Zod schemas and constants · MongoDB,
its own database (native driver, Zod is the schema) · pino · vitest. **Built so far
(2026-11-13): the collector, the paper experiment's program and MARKET-1's,
all in `apps/poller` in a pnpm workspace (TypeScript, Zod, pino, the MongoDB
driver, vitest; the experiment a second entry point, `dist/paper.js`, frozen
and deployed 2026-11-12; MARKET-1 a third, `dist/market1.js`, frozen
2026-11-13 (tag `market1-freeze-1`), not yet deployed; no Turborepo, web, api or
shared package yet — decisions 2026-11-11, COLLECTOR-BUILD's technical calls;
2026-11-12, PAPER-BUILD's; 2026-11-13, MARKET-BUILD's;
docs/claude-architecture.md):** check package.json before trusting
this line. Ports are set by the v1 plan, clear of the lab's 3000 and 4000.

## Structure & docs
docs/claude-current-task.md — where we are, what is next.
  READ always, second. REWRITE every session; keep it under ~10 KB.
docs/claude-architecture.md — what the system IS now.
  Read when touching structure. Update when the shape changes; no history.
docs/claude-decisions.md — WHY, append-only, newest first, each entry dated.
  Read when a choice looks odd. Append on every real decision; never edit.
docs/claude-code-rules.md — how code is written here + gotchas.
  READ BEFORE writing code. Append when a rule is set or something bites.
docs/claude-master-plan.md — the owner's plan page: every item under a status
  marker, the backlog by status. Read a section on demand.
docs/claude-external-apis.md — what we have VERIFIED about every external API,
  each fact dated and sourced. Read before calling one; append what you
  learn. Never trust an undated claim about someone else's API.
docs/reviews/ — research reports, plans, audits, build reviews: dated
  evidence, never edited (a Final review's corrections are marked in place),
  indexed in its README. A review decides nothing: what it concludes is
  copied into the files above, or it does not exist.

The supervisor's folder, outside the repo:
`E:\coding\Claude\supervisor\polymarket-follow\` — HANDOVER, WORKFLOW,
LESSONS and the subagents' briefs. A subagent opens only its own
`workers/<NAME>/` there.

current-task is the only file loaded every session, so durable content goes
in the others, never there.

## WHO EDITS WHICH DOC
- **The plan page and code-rules: the supervisor only.** A build session
  reports what belongs there in its closing message.
- **architecture: a build may update it** when the shape changes.
- **decisions: append your own entry,** newest on top; never edit one.
- **current-task: rewrite it at session end.**
- **Never set a status marker on your own work** in the plan page: report
  "done"; the supervisor marks it after verifying.

## Developer preferences (IMPORTANT)
- Show a plan first; implement only after approval.
- Minimal targeted changes; no speculative abstractions or unasked refactors.
- Explain the why briefly before the how.
- The simplest good solution, following current best practices. Consult
  official documentation or the web to check an approach or its usage (the
  owner's standing approval); read the primary source, not a summary.
- One fact, one home: write a fact once and point to it; every number
  carries its date.
- Every session ends with: **`pnpm verify` green** (build + lint + test +
  format:check, in CI's order, once the skeleton exists), a **docs sweep**,
  docs/claude-current-task.md rewritten, work committed by name on main (the
  owner pushes). The sweep: search every doc (docs/*.md but decisions and
  reviews, plus CLAUDE.md and `apps/poller/experiment/rules.md`) for each
  name, value and behaviour the session changed; fix the hits (a hit in the
  frozen rules is listed, never edited); list the rest in the closing
  message.

## External APIs
Polymarket Perps' public API (keyless reads; the IP budget and every endpoint
we use: docs/claude-external-apis.md). Prediction markets later. Keys, if any
are ever needed, in .env only — never in code or docs.

## Current state
→ docs/claude-current-task.md
