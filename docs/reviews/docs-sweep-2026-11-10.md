# DOCS-SWEEP — everything Polymarket documents about Perps, against what we know

DOCS-SWEEP (Sonnet 5.5, xhigh), plan item P0-3, written 2026-11-09 23:33Z – 2026-11-10 00:12Z, the Final review (§9) included (UTC, every time from
`date -u`) for polymarket-follow's supervisor. **Evidence** is in the supervisor folder
`E:\coding\Claude\supervisor\polymarket-follow\workers\DOCS-SWEEP\` (paths below are relative to it): `docs/pages/`
(144 docs pages as downloaded), `docs/specs/` (current index, specs, changelog), `docs/condensed/` (the same pages
without code samples, which is what I read), `raw/` (every API reply), `scripts/`, `out/`, `notes.md`, `progress.md`.
Each figure names its saved reply or script output, or the page and its fetch time in `out/fetch-log.jsonl` [Final review F9]. No question is open for the supervisor; the owner's questions are in §7.

**Deviations from the brief, listed in place.** (1) The brief lets me open an explorer page for "one address from
the stored pool"; no pool was among my inputs, so I took **one public address from the live day leaderboard**
(rank 1, read 23:43:22Z, `raw/a5-leaderboard-day3.json`) for the single address page. (2) Once I wrote a script
with a shell heredoc (`check-pages.cjs`); it broke on backslashes, I deleted it and rewrote it with the Write tool.
(3) My API scripts ran in separate processes, so the "one request at a time" rule held inside each script and
between them (they never overlapped), and the trailing-60-second total stayed at **48 assumed tokens at most**
(`out/an-calls.txt`: 47 calls 23:41:14Z–00:00:40Z, 45 × 200 and 2 × 400 [two shape probes: `perps-whitelist` without `address`, competition `limit=1000`], 0 calls in 02:35–03:50Z, 0 POSTs, 0 non-`/info/` routes, **0 × 429**).
(4) Unpublished weights were charged 10; the real weights of `stock-splits`, `account-tiers` and `perps-whitelist`
are unknown.

**Headline.**
1. **Nothing in the specs changed since 2026-11-06:** `perps-openapi.json`, `asyncapi-perps.json`, `llms.txt` and
   `rate-limits.md` are **byte-identical** (sha256 equal to the inputs). The live API is ahead of the spec, as R1 said.
2. **Not in the spec but live and public** [Final review F5]: `/v1/info/markets` (a batched snapshot; read live for one
   instrument; "≤ 50 instruments, weight 2" is changelog text), `/v1/info/account-tiers`, `/v1/info/perps-whitelist`,
   `/v1/info/stock-splits` (all three read live 23:42Z), plus the v1/v2 pnl and equity routes R1 already had.
   `/v1/info/builder-stats` is in the changelog only — **I never read it; unverified.** Ticker `long_count`/`short_count`
   is live (read 23:41:12Z) and now has a **definition** (changelog 2026-10-27, text only): accounts with a nonzero net
   position on that side, market makers and funds included. The full status of each item is the table after Q2-A.
3. **The competition leaderboard with `include_unqualified=true` is not capped at rank 1,000** [Final review F1] (offset
   4,700 answered; the main board stops at offset+limit 1,000): about 48 reads of weight 1 list 4,736–4,738 accounts
   (23:45Z–00:03Z; the competition itself reports 10,019 "participants"; the rule that picks the listed ones is not
   stated), each with score, realized and unrealized PnL, volume. **Without that parameter the board holds only the
   qualified accounts: 109 at 23:45Z, 110 later.** It is the cheapest universe seed found, and it exists only while a
   competition has run.
4. **Incentives are large** [Final review F2]: the docs' liquidity-rewards **budget** of $75,000 a day (page undated, fetched
   23:34:50Z) is, over the 7 UTC days from 2026-11-02 00:00Z to 2026-11-09 00:00Z (end exclusive), $525,000 a week against
   **gross positive trading fees of $170,276** for the same days (`/v1/info/exchange-stats`, read 23:46:58Z): 3.1 times; and
   $75,000 against $13,156 on 2026-11-08 alone: 5.7 times. This compares a budget with measured fees, not two payments:
   **who receives the rewards, and how much, is not public** (`/v1/account/rewards` is private). Open-interest rewards (6% a
   year on gross OI) come on top. Leaderboard PnL excludes rewards, so a market maker's true income is on no board.
5. **A fill from a take-profit or stop-loss trigger cannot be told from any other fill** in public data. Liquidation,
   auto-deleveraging and settlement fills **can** be told (flags), backstop liquidations carry extra details.
6. **Chain:** Polygon mainnet (137); the exchange contract is `0xDCa4af75…917d2` (confirmed by `/v1/info/exchange`
   and by Polygonscan: an upgradeable proxy holding $81.64M pUSD); collateral is pUSD `0xC011a7E1…2DFB`. Whether one
   account's deposits and withdrawals can be listed on an explorer is **not confirmed** (§5).
7. **The documentation contradicts itself or the live API in six places** (§1 Q7): maximum leverage, session
   categories, fee-volume window, index constituents, "published premium sample", spec versus live fields.
8. **Two traps for the round-2 method:** a bi-weekly **competition** runs 2026-11-02 → 11-16 with volume boosts and
   a $100K minimum, so the "find" window (to 11-07) and the untouched "confirm" window (after 11-07) differ in
   incentives; and **equity perps can split** (corporate-action channel, `share_unit_version`), which would break
   sizes and prices across a split.

---

## 1. The answers

### Q1. The documentation's map

All pages were fetched 2026-11-09 23:34–23:36Z with `scripts/dl-pages.mjs` (URL, time, bytes and sha256 of each:
`out/fetch-log.jsonl`; 140 pages, all HTTP 200) and four more at 23:46:31Z (`out/dl-extra.txt`) [Final review F9]. **The supervisor can
diff my pages against R1's by hash** (R1's copies are outside my folder, so I could not). "Read" = I read the prose
and tables; code samples (SDK snippets, signing examples) were stripped by `docs/condensed/` and are not read line by
line.

**The index.** `llms.txt` (current) is byte-identical to the 2026-11-06 copy. Its "Perps" part lists 27 pages; the
"API Reference / Perps" index (`docs/specs/api-reference-perps-index.txt`) lists **103** more (72 HTTP, 28 WebSocket,
3 text). `perps/rate-limits.md` exists and is not in the main index (it is the same text as the API-reference
rate-limits page). Chinese pages (223) exist and were not read.

| Page (docs.polymarket.com/…) | Covers | Read |
|---|---|---|
| `perps/overview` | what Perps are; four cards (prices, positions, margin, funding); build ideas | yes |
| `perps/concepts` | instruments, accounts, prices, orders/fills, positions, margin, funding, realtime state | yes |
| `perps/place-your-first-trade` | tutorial: client, deposit (min 10 pUSD), first IOC order | headings and prose only |
| `perps/market-data` | the public reads: instruments (incl. retired ones and `settlement`), tickers (≤10 s old, 503 if the store is down), book depths 10/100/500/1000, candles, mark history, trades, funding history | yes |
| `perps/fund-your-account` | deposit (contracts, min 10 pUSD, relayer), withdraw (typed data), internal transfer (off-chain, no fee), reconcile | yes |
| `perps/authenticated-sessions` | registration check (public), proxy keys, sessions | first half |
| `perps/trading` | orders, TIF, post-only, FOK, reduce-only, TP/SL, modify, cancel, auto-cancel, close, leverage, margin, reconcile, fees | yes (cancel retries skimmed) |
| `perps/account-management` | balances, portfolio, account stats, orders, fills, snapshots, funding, deposits, withdrawals, equity, PnL | yes |
| `perps/builder-codes` | builder fee up to 10 bps, approval, earnings, live receipts | first third, rest by headings |
| `perps/realtime-updates` | public streams: bbo, book, trades, tickers, statistics, candles; timing fields | yes |
| `perps/notifications` | private notification feed | first half |
| `perps/learn-about-trading/overview, architecture, markets` | hybrid exchange, Polygon, state roots; instrument parameters | yes |
| `…/fees` | 7-tier fee table by 30-day volume, fee accounting, builder fee | yes |
| `…/margin` | equity, IM, MM = 0.5/maxLev, margin states, cross/isolated, withdrawal floor 10% | yes |
| `…/liquidation-mechanics` | trigger, order-book liquidation, insurance-fund backstop, ADL, fees | yes |
| `…/funding` | formula, 5 s premium sample, hourly charge, caps | yes |
| `…/mark-price` | median of three candidates, 200 ms | yes |
| `…/index-price` | feeds Pyth, Chainlink Data Streams, Hyperliquid | yes |
| `…/market-sessions` | five categories; only the feed set changes | yes |
| `…/self-trade-prevention` | CancelMaker; **account groups** (one entity, invisible publicly) | yes |
| `perps/liquidity-rewards` | $75,000 a day, scoring formula, 12:00–12:00 UTC periods | yes |
| `perps/referral-program` | 20% of referred fees, weekly, invite limits | yes |
| `perps/trading-competitions` | bi-weekly $50K, score = PnL × √boosted volume | yes |
| `perps/errors` | error identifiers | headings and the retirement section |
| `perps/faq` | 33 questions [Final review F9] | yes |
| `perps/rate-limits` (= API-reference copy) | IP 1,000 tokens/min, actions, WebSocket | yes (unchanged) |
| `changelog/perps` | 2026-06-08 → 2026-11-05, 70,802 bytes | **yes, whole** |
| neighbours: `concepts/pusd`, `resources/contracts`, `resources/blockchain-data`, `trading/bridge/*` (5), `trading/wallets-auth`, `session-keys`, `wallet-activity`, `getting-started/sdks-apis` | collateral token, contract addresses, bridge chains, wallet types, third-party chain data | pUSD, blockchain-data, bridge assets: yes; contracts: searched (Perps, pUSD, wallet factories), not read in full; wallets-auth (fetched 23:46:31Z): searched for address rules; session-keys, wallet-activity saved, not read |

**The 103 API-reference pages.** `scripts/check-pages.cjs` (`out/check-pages.txt`) maps every page to a spec route or
channel: 72 HTTP pages → 72 of the 75 spec operations; 28 WebSocket pages → 28 of 29 channels; 3 text pages
(overview, rate limits, geographic restrictions — read). **Not documented on any page:** the three Backstop
Liquidity Provider routes (`/v1/blp/enrollment`, `/enroll`, `/liquidations`) and the `backstop` channel — the program
exists only in the spec. The 30 **public** HTTP pages (ping, time, exchange, assets, instruments, tickers,
statistics, exchange-stats, leaderboard, 5 competition pages, klines, mark-history, bbo, book, index, trades,
portfolio, fills, position-fills, share-card snapshots [POST, never called], funding, fees, builder, limit-tiers,
invite, registered) I read through the spec inventory (`out/spec-inventory-all.txt`: parameters, weights, response
fields). The 42 private HTTP pages (orders, cancels, leverage, margin, proxy, credentials, balances, account portfolio,
fills, equity, PnL, backstops, funding, withdraw, internal transfer, deposits, withdrawals, stats, limits, rewards,
config, auto-cancel, referral, invite, notifications, builder approvals/earnings) and the 21 private WebSocket pages
(10 order-entry posts, auth, 10 private streams: fills, builder fills, orders, funding, balances, portfolio, deposits,
withdrawals, tpsl, notifications) were fetched and mapped, **not read page by page** — they need a signature and the
brief forbids using them; I read the descriptions of `get-account-rewards`, `get-account-limits`, `get-limit-tiers`
and the BLP entries. Ping and the six public channel pages (trades, bbo, book, klines, tickers, statistics) are public.

### Q2. What we did not know or use

**A. Public routes new to `external-apis` and R1's table** (all `GET`, keyless; "read" = my live read, raw reply in `raw/`):

| Route (weight) | What it gives | Verified |
|---|---|---|
| `/v1/info/exchange` (2) | `chain_id` **137**, `contract` `0xDCa4af75…917d2`, `engine_version` "0.0.86", `cancel_only` (false) — a free **maintenance flag** and **deploy marker** | read 23:41:15Z (`raw/a1-exchange.json`) |
| `/v1/info/assets` (2) | the collateral list: one asset, **pUSD** `0xC011a7E1…2DFB`, 6 decimals, `collateral_ratio` "1.00", `withdrawal_fee` "0.000000" | read (`a1-assets`) |
| `/v1/info/index?asset=` (2) | `index_price` and `ts`; the spec promises `constituents` (source, symbol, weight, price) but **the live array is empty** for BTC, SP500, GOLD, NVDA, SKHYNIX, ANT — index construction is not visible | 6 reads (`a2-index-*`) |
| `/v1/info/limit-tiers` (2) = `/v1/info/account-tiers` (same body) | 4 tiers by 14-day volume: 0 / $1M / $541,800,079 / $10B → 2,000 / 5,000 / 15,000 / 30,000 actions a minute, open orders 1,000 / 1,000 / 3,000 / 6,000; "rate_per_minute" fields are legacy and not enforced; WebSocket fields hold 4294967295 (no limit) | read (`a1-limit-tiers`, `a2-account-tiers`) |
| `/v1/info/invite?code=` (1) | `{valid, error?}`; I used an obviously invalid code → `{"valid":false,"error":"code not found"}`; no use for us | read (`a1-invite`) |
| `/v1/info/competition/widget` (1) | live competition at a glance: `competition_id`, `end_time` (2026-11-16T14:30Z), `min_volume`; with `address` the account's rank and qualification progress (spec text, **not tested**) | read without address (`a1-widget`) |
| `/v1/info/markets` (2; changelog, not in spec) | **batched snapshot**: `instrument_ids` (≤50), `curated_list`, `include=sparkline,totals` → per market mark, open price, volume, 24 sparkline points; `totals` = volume $88.4M, open interest $117.3M, 90 markets | read (`a1-markets`) |
| `/v1/info/stock-splits` (?) | `{"events":[],"sequence":…}` — empty until a split is scheduled | read (`a2-stock-splits`) |
| `/v1/info/perps-whitelist?address=` (?) | `{"status":"ok","whitelisted":false}` for the day-board #1 account (a registered, trading account); I infer it is not the registration gate; meaning unknown. Without `address`: 400 | read (`a2-perps-whitelist`, `a6-whitelist`) |
| `/v1/info/builder-stats?address=&period=` (10 on a miss; changelog) | a builder's users, volume, exchange fee, builder fee per market; periods 1d/1w/1m/1y/alltime (changelog 2026-10-22 text only) | **not read — unverified** (needs a builder address; none known) |

**A2. Verification status of every "live but not in the spec" item** [Final review F5] (I searched both spec files for the
name: 0 hits for each item marked "not in spec"; "tested" = a saved reply in `raw/`):

| Item | In the spec? | Evidence | Status |
|---|---|---|---|
| `GET /v1/info/markets` | not in spec | `raw/a1-markets.json`, 23:41:16Z, `instrument_ids=1&include=sparkline,totals` | tested for one instrument; "≤ 50", `curated_list`, weight 2 are changelog text |
| `GET /v1/info/stock-splits` | not in spec | `a2-stock-splits`, 23:42Z: `{"events":[],"sequence":…}` | tested (empty) |
| `GET /v1/info/account-tiers` | not in spec | `a2-account-tiers`, 23:42Z: same body as `limit-tiers` | tested |
| `GET /v1/info/perps-whitelist` | not in spec | `a2-perps-whitelist` (400 without `address`), `a6-whitelist` (`whitelisted:false`) | tested; meaning unknown |
| `GET /v1/info/builder-stats` | not in spec | none | **unverified** (changelog 2026-10-22 only) |
| `/v1/info/pnl`, `/v2/info/pnl`, `/v1/info/equity` | not in spec | R1 (2026-11-06) | R1's reads; not repeated here |
| ticker `long_count`, `short_count` | not in spec | `a1-tickers`, 23:41:12Z | tested; meaning is changelog text |
| ticker `symbol` filter | not in spec (only `instrument_id`) | none | **unverified** (changelog 2026-10-27); the `instrument_id` filter was tested (`a2-ticker-BTC-t0`, `a3-*`) |
| ticker `pricing_status` | not in spec | absent on all 90 rows | not observed |
| instrument `fee_override`, `funding_multiplier`, `logo` | not in spec | `a1-instruments`, 23:41:15Z | tested (`fee_override` set on ANT-USD only; `funding_multiplier` null on all 90) |
| `limit-tiers` fields `ws_*`, `max_connections`, `connects_per_minute_limit` | not in spec | `a1-limit-tiers` | tested |
| competition rows `instruments_traded`, `top_instrument_ids`, `cohort`, `next_update_at` | not in spec | `a7-comp-lb`, 23:45:45Z | tested |
| `competition/widget?address=` | in spec | none (I read it without an address) | spec text only |
| WebSocket `corporate-actions::<iid>` | not in AsyncAPI | none | **unverified** (changelog 2026-11-05) |
| WebSocket `book::<iid>::50`, `klines` at `1s` | **in** AsyncAPI (`^book::\d+(::(20\|50))?$`, `klines::…::(1s\|…)`) | none | spec text; not tested live |
| statistics `open` = mark at window start | n/a | none | changelog 2026-10-29 only |

**B. Fields and parameters that are new to our records:**
- **Tickers:** `long_count`, `short_count` (live, not in the spec): **accounts with a nonzero net position** on that
  side, market makers and funds included, refreshed every 2 s (changelog 2026-10-27). Read: 7,770 long and 2,944 short
  account-positions across 90 markets; ETH 946/214, BTC 816/323, SP500 445/239 (`out/an-api1.txt`). Counts accounts,
  not size. The `instrument_id` filter works (tested); the `symbol` filter is changelog text, untested. `pricing_status` (changelog 2026-10-20) was present on **none** of 90 rows.
- **Ticker `funding_rate` is the rolling implied hourly rate**, not the last settled one: CASHCAT −0.0001883 →
  −0.00018872 and XRP −0.00002178 → −0.00002157 in ~95 s, 23:41:12Z to 23:42:47Z (`out/api3-t0.txt`) [Final review F9]. 55 of 90 sit exactly on the floor
  (crypto 0.0000125 = 0.0001/8, others 0.00000625), 35 are off it (`out/an-econ.txt`) [Final review F7]. This is the "implied rate published continuously"
  of the FAQ; the FAQ's "5-second premium sample" is in **no** field of either spec.
- **Instruments:** `fee_override` (only ANT-USD, id 97, since 2026-10-29: taker 2.0 bp → 1.0 bp, maker +0.625 bp →
  −0.5 bp by tier), `funding_multiplier` (none now), `logo`, `max_order_count` 200, `price_bounds` 0.02–0.333 (probably the
  trade price band), `liquidation_fee` 0.005 on all, `close_only` false on all, `isolated_only` false on all, risk
  tiers (BTC: 50× to $250K, 25×, 20×, 15×, 12×, 5×, 2× from $10M), `ui_live_time` advisory. Instrument 51 is
  **KIOXIA-USD, retired**: `close_only` true and `settlement` {price 353.87, `insurance_debit` 0,
  2026-09-28T00:33:01Z}, returned only when asked by id (`raw/a10-instrument-51.json`); ids 0, 12, 91–95 and 98 answer `[]`.
- **Fees:** the live schedule has one entry and tiers keyed `min_volume_30d` (`a1-fees`).
- **Competition:** rows add `instruments_traded`, `top_instrument_ids`, `first_fill_at`, `cohort`,
  `next_update_at`; the spec adds `payout_tx_hash` and `paid_at` (prize payouts on chain, empty while live),
  `volume_to_qualify`, `score_to_prize_zone`, `spots_from_prize_zone`; `include_unqualified=true` (a spec parameter,
  default false) widens `competition/leaderboard` from the qualified accounts (`total` 109 at 23:45:45Z) to 4,736 rows
  (23:45:45Z) and 4,737 (23:46:01Z) [Final review F1] — the competition reports 10,019 participants; what selects the
  listed ones is not stated;
  **with that parameter, `limit` ≤ 100 but `offset` has no 1,000 cap** (`out/api8.txt`, `out/an-econ.txt`); competition detail: all markets
  count, boosts ANT 3×, AMD/ARM/SOXL 2×, `requires_positive_pnl`, `count_unrealized`.
- **Fills:** `liquidation_details` {`mark`, `method` "backstop" | "market", `liquidated_user`?} (only backstop fills carry
  it so far), `builder` {address, fee_rate} (hidden on the public surface), `settlement`. R1 had the shapes from the spec.
- **Statistics `open_price`** is the **mark** at the start of the 24 h window since 2026-10-29 (changelog text; not re-read live).
- **Weights from the spec text:** `/v1/info/limit-tiers` 2, `/assets` 2, `/index` 2, `/invite` 1, `/competition/widget` 1,
  `/exchange-stats` 10 (1 cached), `/markets` 2 (changelog).

**C. Mechanisms and rules** (details in Q3–Q5): the liquidation ladder with an insurance-fund backstop and ADL;
Backstop Liquidity Providers; delisting through close-only and a 30-minute index average; fee overrides and funding
multipliers per market; account groups and "rewards entities" (invisible); liquidity and open-interest rewards;
the 20 ms taker delay (2026-06-10); a mark-to-index band of 50 bps by default; maintenance windows with order placement paused
and WebSocket drops; a withdrawal address book (2026-11-05); read-only API keys; stock splits.

**D. WebSocket** (none of it tested live in this sweep). Public channels in the spec: trades, bbo, book, klines, tickers,
statistics (R1 had them and tested them). New to us: `book::<iid>::50` (top 50 levels, 100 ms; in the AsyncAPI spec and
the changelog 2026-09-14), `klines` at `1s` (in the AsyncAPI spec), and `corporate-actions::<iid>` (changelog 2026-11-05
only, **not** in the spec). The spec's `trades` update has **no** `liquidation_details` although the changelog says public
trades carry it for backstops.

### Q3. Orders and stops

**Order types** (docs `perps/trading`, `perps/faq`, read 2026-11-09): limit; market-style (an IOC with no price);
time in force GTC, IOC, FOK; post-only (a GTC with `po`); reduce-only (`ro`); modify (price and total quantity of a
resting GTC; size cut keeps queue place, any other change goes to the back); cancel by id or client id; cancel-all;
auto-cancel (a dead-man's switch, 1,000 triggers per UTC day); **TP/SL**: a *bracket* (one entry plus up to one take-profit and
one stop-loss, dormant until the entry fills in full) or a *position* TP/SL (closes the whole position, market only,
one of each per instrument); a trigger watches the **mark price** (not the last trade) and sends a reduce-only
market or limit order; a fired stop-loss can displace a resting take-profit. A **20 ms taker delay** applies to
orders that match on entry. **Switched off:** TWAP creation (controls exist, creation answers 404), GTD, chase
limits, partial TP/SL closes, trailing stops, synthetic pricing, odds orders.

**Distinguishable in public data?**
- **TP/SL-triggered fill: no.** The public fill has `taker`, `liquidation`, `adl`, `settlement`, optional
  `liquidation_details` — no field for the order's origin. A fired trigger is an ordinary reduce-only order with an
  ordinary `order_id`; its fill is a taker reduce (market) or maker/taker (limit). The `orders` and `tpsl` channels
  are private. H5 can only *infer* stop-like habits (a taker reduce right after the *mark* touched a level).
- **Liquidation: yes.** `liquidation: true`; since 2026-08-11 **both maker and taker** fills inside the account's
  liquidation scope carry it (older rows are unchanged: maker legs read false). The changelog (2026-08-11) says such maker legs are excluded from "leaderboard win counts"; the public leaderboard API has no
  win-count field. The fill also pays an extra liquidation fee: `FillFee = notional × (maker/taker rate +
  0.005)` (`liquidation_fee` "0.005" on all 90 markets, read here as a fraction; the spec does not state the unit).
- **ADL: yes.** `adl: true` on **both** legs since 2026-08-10 (before that the counterparty leg read
  `liquidation: true`). ADL fills have no fee. The `position_deleveraged` notification is private.
- **Settlement: yes.** `settlement: true` on fills and on the tape; no fee, no liquidation fee.
- **Backstop liquidation: yes, partly.** Per the changelog (2026-08-24) fills and trades from backstop liquidations carry an
  optional `liquidation_details` {`mark`, `method` "backstop", `liquidated_user`} on account fills, position fills and public
  trades; the anonymous tape omits `liquidated_user`; the spec's public `trades` row does not list the object. Backstop and ADL fills are
  system-generated with order id 0. None was seen live in this sweep.

**How a liquidation works** (docs `liquidation-mechanics`, `margin`, `faq`):
1. **Trigger:** `MarginRatio = Equity / MM < 1`; cross and isolated are checked separately; `MM = notional × 0.5 / maxLeverage`
   (flat per market: 2.5% on a 20× market, 1% on a 50× one); `IM = notional / leverage`; healthy `Equity ≥ IM`; margin
   call `MM ≤ Equity < IM` (reduce-only); liquidation `Equity < MM`.
2. **While liquidating:** new orders blocked (cross: every market; isolated: that market), resting orders in scope cancelled.
3. **Execution:** reduce-only IOC market-priced orders, no protective spread off mark, one cross position at a time,
   health re-checked between orders; the flag clears when equity recovers.
4. **Insurance-fund backstop:** when equity falls below **two-thirds of MM** the book is skipped and the fund absorbs
   the position (cross: all cross positions plus balance; isolated: that position). Only if the fund stays healthy.
5. **ADL:** otherwise the position is closed against opposite-side traders ranked by `ProfitRatio × Notional / Equity`
   (most profitable and most levered first); a counterparty is only reduced; price = bankruptcy price (isolated) or the
   mark frozen at the start (cross). Insolvent shells with negative cash are settled against the fund automatically.
6. **BLP:** enrolled accounts receive backstop allocations on instruments they subscribe to, at a locked 3× leverage;
   their records do not name the liquidated account (spec only; no docs page).

**What is public of it:** the flags above; the public portfolio (`size`, `entry_price`, `unrealized_pnl`, `equity`)
lets one compute `Equity / Σ(|size| × mark × 0.5 / maxLeverage)` for an account whose positions are **all cross** —
the web app opens **isolated** by default and leverage, margin mode and isolated allocations are private, so for most
retail accounts this ratio is wrong (§4). The account's `adl_index` (0–3) and `fee_tier` are private.

### Q4. Money and incentives

- **Fee tiers** (live `/v1/info/fees`, docs): trailing **30-day** volume, re-evaluated each UTC day: $0 taker 4.00 bp / maker 1.25 bp;
  $1M 3.7 / 1.0; $5M 3.5 / 0.8; $25M 3.0 / 0.5; $100M 2.7 / 0.2; $500M 2.5 / 0.0; $1B 2.0 / **−0.5** (the only rebate).
  Beta accounts sit on the top schedule for now. Fee = |price × quantity| × rate. A per-market `fee_override` replaces
  the schedule inside its window (ANT-USD: about half). Builder fee on top, up to 10 bp, trader-approved. Account
  groups can aggregate volume. *Shows in public data:* every fill's `fee`; **`|fee| / (price × quantity)` might reveal the
  trader's tier** (a rebate would mean top tier or beta) — an inference, **untested on fills** [Final review F10]; use `fee`, not
  `total_fee`; liquidation fills pay an extra fee; override markets differ.
- **Maker rebates:** only the top tier or beta accounts earn them; R1 saw 838 of 4,063 fills with a rebate.
- **Liquidity rewards** (docs `liquidity-rewards`): **$75,000 a day** split evenly over active markets (+$1,000 on a new
  market's first day), periods 12:00–12:00 UTC labelled by the end date, paid in pUSD to the account. Score =
  `maker_score^0.35 × active_liquidity^0.65 × uptime`. Needs ≥ 1% of the trailing seven-day maker volume (entity-wide,
  capped at 25%); only resting quantity within 20 bp of mid counts (weights 1.0 within 5 bp, 0.25 to 10 bp, 0.10 to
  20 bp, $100K cap per tier and side); both sides must quote (harmonic mean). *This makes a maker quote tight,
  deep, two-sided, all day.* Same-entity trades do not count. **Payments are private** (`/v1/account/rewards`; rows appear
  after 12:05 UTC); in public data they can only show as a step in equity, and they are **not** in the leaderboard
  PnL (which is realized − fees + funding) nor in `/v2/info/pnl` (rewards and referral payouts are booked as capital).
- **Open-interest rewards:** 6% a year on the account's full daily-average **gross** open interest, only if its entity
  averages ≥ $5M (was $1M until 2026-09-07). Private, no public trace except equity steps. *My reading: it pays holders of
  large two-sided or hedged books, whatever their PnL.*
- **How big, with units and windows** [Final review F2] (`raw/a9-xstats-7d.json`, `a9-xstats-1d.json`, read 23:46:58Z;
  arithmetic in `out/an-econ.txt`): for the 7 UTC days [2026-11-02 00:00Z, 2026-11-09 00:00Z): matched volume
  $591,101,131; gross positive maker and taker fees $170,275.93 (rebates, incentives and referral payments excluded) =
  2.88 bp of volume. The docs' rewards budget for 7 days is 7 × $75,000 = $525,000, **3.08 times** the fees. For
  [2026-11-08 00:00Z, 2026-11-09 00:00Z): volume $39,712,771, fees $13,155.66 (3.31 bp), budget $75,000, **5.70
  times**. Caveats: the budget is the docs' sentence, not a payment record; reward periods run 12:00–12:00 UTC while the
  windows are UTC days; the recipients are not public. If the volume is counted once per trade, one percent of a week's
  volume is $5,911,011 — the order of the maker-volume floor.
- **Referral:** 20% of the fees of referred traders, weekly, one code per account, 10 → 25 → 100 → 250 → 500 invites by
  volume. Private; a payout is capital in `/v2/info/pnl`. Makes referrers promote, not trade.
- **Builder program:** a builder account earns up to 10 bp on orders routed through its app; public traces: `builder_fee`
  on fills (0 on all 4,063 R1 fills), `/v1/info/builder`, `/v1/info/builder-stats`. Changelog 2026-09-27 said attribution
  was not enabled; the current page describes it as usable; live status not verified.
- **Competitions** (docs; `/v1/info/competition*`): bi-weekly, $50,000 for the top 50 (10,000 for first), score = PnL ×
  √boosted volume on competition markets, $100K minimum volume, positions open at the start excluded, unrealized PnL
  counts, positive PnL required, boosted markets (now ANT 3×; AMD, ARM, SOXL 2×); wash trading, self-trading and
  multi-accounting disqualify all linked accounts; `row_state` live | provisional | disqualified | final | paid. *Makes a trader churn
  volume on boosted markets.* The day-board #1 account reads `disqualified` (`a7-comp-acct`), as R1's all-time #1 did —
  a free flag for any address at weight 1 (reason not given). `/v1/info/competitions` (23:41:16Z) lists only this one (number 1), so no earlier competition shows in the API; one outside
  that list cannot be ruled out [Final review F10].

### Q5. Markets

- **Sessions** (page fetched 23:34:49Z): Regular, Overnight, Weekend, Disrupted, Halted. They change **only** which external feed
  set builds the index and the C3 mark candidate (if a category has no feed set, the overnight set is used); funding,
  margin, leverage tiers, matching and liquidation triggers run unchanged. No hours or zones are given, and **no
  session field is public** (`pricing_status` absent on 90 tickers). The changelog (2026-09-21) says the page was changed
  to Regular, Premarket, Postmarket, Overnight, Halted, Unknown, Weekend, Closed and *drops* "Disrupted" — the current
  page still has "Disrupted": **the two disagree**.
- **Index:** weighted average of external feeds after dropping stale or outlying prices, published every 200 ms; feeds
  named: **Pyth, Chainlink Data Streams, Hyperliquid** (since 2026-09-14 the Hyperliquid lane uses the *oracle* price,
  before the venue mark which carried a 60–70 bp basis on WTI and Brent). The index survives the loss of one source.
  `/v1/info/index` returns only the price (constituents empty).
- **Mark:** `median(C1, C2, C3)` every 200 ms; C1 = index + 150-second EMA of (book mid − index); C2 = median(best bid, best
  ask, last trade if recent); C3 = external mark feeds. The mark-to-index band is 50 bp by default (the tighter of
  that and 1/maxLeverage). TP/SL, margin and liquidation use the mark. All fall back to the index.
- **Funding:** premium sampled every 5 s on 1,000 quote notional per side, averaged over the hour,
  `F8h = scale × (P + clamp(0.0001 − P, ±0.0005))`, `rate/h = clamp(F8h / 8, ±4%)`, scale 1.0 crypto and 0.5 other,
  settled hourly, no protocol cut, per-market multiplier possible. **The clamp cancels any average premium between −4
  bp and +6 bp**, so the rate is then the fixed interest leg: 0.0000125 per hour for crypto (10.95% a year, longs pay
  shorts) and 0.00000625 for the rest (5.48% a year, simple); 55 of 90 markets show exactly that now (`out/an-econ.txt`). Funding settles even for a position
  closed just before.
- **Listing and delisting:** listing rules are not documented (a new market gets a $1,000 reward bonus on day one, an
  advisory `ui_live_time`, possible fee override and funding multiplier). **Delisting:** operator sets close-only
  (reduce-only; needs ≥ 30 continuous minutes), then settles at the trailing 30-minute time-weighted index, no fee;
  fills have `settlement: true`; `insurance_debit` records the fund's cost. One happened: KIOXIA-USD, 2026-09-28T00:33:01Z.
  The instrument list shows `close_only` as a warning sign.

### Q6. The chain

- **Chain and contracts:** Polygon mainnet, chain id 137 (`/v1/info/exchange`, 23:41:15Z; docs `architecture`). Exchange
  contract `0xDCa4af75705dbB50f62437045afF9921947917d2` — an **ERC-1967 proxy** (implementation `0xF92018Ee…0cCE5`,
  verified) that holds **81,671,523.51 pUSD** (≈ $81.64M) with 194,750 transactions; its latest 25 calls were
  "Process Withdraw…" (operator `0x8b8035a9…6Cb5c082D`) and "Commit State Root" (operator `0x5cA1eB09…9e239b3fb`)
  (Polygonscan, 23:43Z, through a summarising fetch tool; **the page itself was saved at 00:05:59Z** as
  `docs/explorer/contract-0xDCa4af75.html` and confirms the proxy type, the implementation address, both operators' full
  addresses and the two method names; at 00:05:59Z it shows 81,675,089.32 pUSD [$81,667,738.56] and 194,766 transactions)
  [Final review F8]. **Collateral:** pUSD `0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB`, an ERC-20, 6 decimals, USDC-backed;
  the bridge converts deposits from 15 chains into pUSD on Polygon. The deposit contract is on **no** docs contracts page,
  only on `fund-your-account`.
- **Deposits** are on chain: the user's Polymarket smart wallet (Deposit Wallet since 2026-05-04; older Proxy or Safe
  wallets) approves pUSD and calls the contract with `to` = the **signer address** of the Perps account (min 10 pUSD, via the
  relayer, gasless). **Withdrawals** are signed off-chain, executed on chain by the operator (status pending → confirmed,
  or removed by a reorg, or failed and re-credited); an owner who enrolled in the **address book** can withdraw only
  to listed addresses (2026-11-05). **Internal transfers** between Perps accounts are off-chain, free and invisible; the
  state root (balances) is committed periodically.
- **Visible on an explorer?** The contract's transactions are public by nature. For **one** account I could not confirm
  it: the address page loaded but its "2 token transfers" were not rendered by my fetch tool (§5). It did show the
  account's *own wallet* holds 15,759.49 pUSD outside the exchange and 0 POL (incidental, from a summarising fetch tool, not saved; **not a data path for H13 unless the owner rules**, see the rule below).
- **Same address elsewhere?** The Perps account is **the signer's EOA** (FAQ, fetched 23:34:53Z: "Your account is keyed by your EOA base address, the externally-owned account that signs `createProxy`, not a Safe smart-contract wallet address.");
  an EOA has the same address on every EVM chain (the page showed a 29-chain portfolio). Polymarket's prediction markets
  use a **derived smart wallet** (Deposit Wallet / Proxy / Safe) controlled by that signer — a different address that the
  SDK "derives"; the link formula is not documented and not verified. Hyperliquid and other EVM-keyed venues would show
  the same address — a privacy line for the owner (§7), not tried.
- **The H13 rule** [Final review F6]: only public, pseudonymous data (an address, its transactions on the exchange contract, what
  Polymarket's public API says about it); **never an attempt to find who is behind an address** — no name, ENS or social-media
  search, no tracing of who funded it, no clustering by funder; and **nothing beyond what the owner rules**. This sweep's
  mandate was one explorer look at one contract and one address; reading an address's own-wallet balance, linking it to its
  prediction-market wallet or to other venues is **not covered** until the owner rules (§7 question 2).

### Q7. Changes since 2026-11-06

- **Specs, index, rate limits: no change** (sha256 identical, `docs/specs/` against `inputs/`). The changelog's newest
  entry is 2026-11-05, so I found nothing newer. I could not diff the human pages (R1's copies are not mine to open).
- **Live API against the spec** (the real differences, new to our records): the routes in Q2-A; ticker counts; instrument
  `fee_override`/`funding_multiplier`/`logo`; limit-tier WebSocket fields; competition fields; empty index constituents.
- **Six places where two sources disagree** [Final review F4] (both quoted, with when I read each; "page" times are the
  fetch times in `out/fetch-log.jsonl`; which source is right is stated only where a live read decides):

  | # | Source A | Source B | What decides |
  |---|---|---|---|
  | 1 | FAQ (`perps/faq`, 23:34:53Z): "For crypto, SP500, Oil, Gold and Silver we offer up to 20x leverage, RWA in general up to 10x leverage." | live `/v1/info/instruments` (23:41:15Z): `max_leverage` **50** for BTC-USD, ETH-USD, SP500-USD, NAS100-USD; 20 for 8 markets; 10 for 64 | the live read: the FAQ sentence does not describe these four markets (it may be older; it carries no date) |
  | 2 | sessions page (`…/market-sessions`, 23:34:49Z): "Regular", "Overnight", "Weekend", "Disrupted", "Halted" | changelog 2026-09-21 (`changelog/perps`, 23:34:07Z): "The sessions page now lists `Weekend` and `Closed` alongside Regular, Premarket, Postmarket, Overnight, Halted, and Unknown, and drops `Disrupted`, which never existed in the engine." | nothing public: no session field exists (`pricing_status` absent on 90 tickers, 23:41:12Z); unresolved |
  | 3 | fees page (`…/fees`, 23:34:44Z): "tiered by an account's trailing 30-day trading volume"; live `/v1/info/fees` (23:41:15Z): tiers keyed `min_volume_30d` | changelog 2026-09-27: "Your 14-day volume for tier assignment becomes the group's combined volume" (for account-group aggregation); live `/v1/info/limit-tiers` (23:41:15Z) is keyed `min_volume_14d` (for action limits) | the fee schedule is 30-day by two sources; whether group aggregation uses 14 days is unknown |
  | 4 | spec (`perps-openapi.json`, 23:34:03Z), `GET /v1/info/index`: "Get index price and the list of constituents for an asset." (rows of source, symbol, weight, price) | live `/v1/info/index?asset=` (23:42:16Z–23:42:18Z, six assets): `"constituents":[]` | the live read: the list is empty today |
  | 5 | FAQ (23:34:53Z): "A rolling 5-second premium sample and its implied 8-hour rate are published continuously through public market data." | specs (23:34:03Z, 23:34:05Z): the word "premium" occurs 0 times; live ticker (23:41:12Z): `funding_rate` (an hourly rate that moved between reads) and `next_funding`, no premium sample, no 8-hour rate | the live read: only an hourly rolling rate is public |
  | 6 | changelog 2026-10-27 and 2026-10-29: "`docs/http/http.json` documents the ticker counts and filter" (and the fee override, funding multiplier) | the public spec `/api-spec/perps-openapi.json` (23:34:03Z): `long_count`, `fee_override`, `funding_multiplier` occur 0 times; live replies (23:41Z) carry all three | the live reads: the public spec file lags the file the changelog names |
- **Server state now:** engine 0.0.86, not in cancel-only mode, 90 enabled instruments, one live competition
  (ends 2026-11-16T14:30Z), 6,768 accounts on the day board (23:43Z).

### Q8. For round 2 — what the docs add to each study

- **H1 weak persistence (D2):** nothing changes the test; add a covariate: the competition (2026-11-02 → 16) boosts and
  needs $100K volume, so weeks inside a competition are not like earlier weeks. Board PnL excludes rewards.
- **H2 long records:** `/v1/info/pnl` and `/equity` give months cheaply; `/v2/info/pnl` only for accounts that began after
  2026-10-20; the **competition leaderboard with `include_unqualified=true` lists about 4,737 accounts at ~48 tokens**
  [Final review F1]; a fill's fee rate might give a 30-day volume bracket for every period (an inference, untested).
- **H3 quality score:** leaderboard `pnl` = realized − fees + funding, so it includes maker rebates and excludes rewards
  and referral income; `account_value` is a census value up to minutes old (≤ 8,192 accounts per 60 s). Fee tier changes
  costs over time (a tier-0 follower pays 4 bp taker).
- **H4 style as a filter:** instrument category (equity, index, commodity, crypto) and `top_instrument_ids`; equities and
  indices trade off-hours on fallback feeds (sessions) — a slow style meets different marks than a fast one.
- **H5 risk discipline:** TP/SL are invisible (Q3); liquidation (maker and taker since 2026-08-11), ADL (both legs) and settlement
  flags are public; mark-based triggers can be tested against the 1 s mark series; cross-margin accounts' margin ratio
  is computable (Q3); a liquidation costs +0.5% on every flagged fill.
- **H6 which trades:** unusual size needs equity at the time — the hourly `/v1/info/equity` series; `previous_size` from fills.
- **H7 consensus:** accounts of one **entity/group** count as one party and are invisible; independence cannot be proved
  (competition `disqualified` is the only public hint); `long_count`/`short_count` give crowd breadth for free.
- **H8 why #47 could not be copied:** a maker with top-tier fees earns rebates inside PnL that a tier-0 follower cannot
  (a follower pays taker 4 bp); compute the rebate and maker share of #47's PnL from `fee` and `taker`.
- **H9 market context:** exchange stats (volume, fees, OI, 31-day windows), `long_count`/`short_count`, funding (rolling
  and settled; baseline floor), `cancel_only` and `engine_version` as exclusion markers, sessions, competition boosts;
  liquidation waves are visible on the tape only for backstops.
- **H10 big players:** the reward formulas say what a rewarded maker's book looks like (two-sided within 5/10/20 bp,
  ≥ 1% of weekly maker volume ≈ $5.9M if volume counts once per trade); OI rewards pay gross holders ≥ $5M per entity ("pnl > 0, notional 0" rows);
  entities are hidden; "algorithm" is not "no skill" but its income may be rewards.
- **H11 AI:** nothing in the docs; Iron Rule 6 stands.
- **H12 account-level check:** the paper log can use the documented margin law: liquidation when loss exceeds
  `notional × (1/leverage − 0.5/maxLeverage)` (fees and funding aside); liquidation fee 0.5%; reversals reserve margin at the
  worst price; withdrawals keep 10% of notional.
- **H13 on-chain** [Final review F6]: Q6 and its rule (public, pseudonymous data only; no attempt to identify anyone; nothing beyond what the
  owner rules). Paths that stay inside the rule: net capital from `/v2/info/pnl` (existing API, accounts after 2026-10-20), and the
  exchange contract's calls and events by account (third-party indexers named by the docs: Dune, Goldsky, Allium, CryptoHouse) —
  the latter **unconfirmed** for one account. Internal transfers and groups stay invisible.

---

## 2. Variations weighed

- **Universe seed:** the main leaderboard (16 boards × 1,000, weight 5) against `competition/leaderboard` with
  `include_unqualified=true` (about 4,737 listed accounts, weight 1 a page, only while a competition has run) [Final review F1].
  *Both*: the first is permanent, the second adds accounts below rank 1,000.
- **Funding as a feature:** the settled hourly history (weight 10 per 100 rows) against the ticker's rolling rate (weight
  2 for all 90 markets) — the ticker is the cheap one for live context, the history for studies.
- **Depth of the explorer check:** one contract page and one address page only (the brief), against also opening
  a transaction page (more evidence, outside the limit). I stayed inside.
- **Where to take the explorer address:** a leaderboard address (done) against waiting for the pool. The pool was not mine to open.
- **Reading the private pages:** page by page against mapping them to the spec. They are signed routes we never call.
- **Settling the "rolling funding" question:** a second ticker read minutes later (cheap, shows it moves) against waiting for
  a settlement (shows it converges). I did both: 23:59:50Z rolling rate against the 00:00Z settled rate, 2 markets
  (`out/api4.txt`) — the gaps are 5e-8 (CASHCAT, 0.026%) and 4e-8 (XRP, 0.195%) an hour (`out/an-econ.txt`) [Final review F3].

## 3. Possibilities found

1. `/v1/info/competition/leaderboard?include_unqualified=true` pages 100 rows at weight 1 with no 1,000 cap: about 4,737 listed
   accounts (of 10,019 "participants"), score, PnL split, volume, instruments [Final review F1] — and `competition/account`
   gives any address's unrealized PnL, fees and funding. Without the parameter the board lists only the 109–110 qualified accounts.
2. `/v1/info/markets` for 50 instruments at weight 2 (with sparkline) — cheaper than separate tickers and statistics.
3. Ticker `long_count`/`short_count`: free crowd breadth on 90 markets every 2 s.
4. `/v1/info/exchange` (weight 2): `cancel_only` and `engine_version` mark maintenance windows and deploys; the changelog
   says order placement pauses and WebSocket connections drop at each rollout.
5. Fee rate per fill → the trader's volume tier and beta status (an inference, untested) [Final review F10].
6. `exchange-stats` per day: volume, fees, open interest — the context series for H9.
7. Retired markets by id (`instrument_id=51` returns the settlement); `close_only` as an early delisting flag.
8. Public portfolio → approximate cross-margin ratio (isolated accounts excluded).
9. Rolling implied funding (ticker `funding_rate`; the WebSocket `fr` is presumably the same, untested) tracked the next settlement closely
   in two markets: 10 s before the hour it read −0.00019312 (CASHCAT) and −0.0000206 (XRP); the hour settled at −0.00019317
   and −0.00002056 at 00:00:00.09Z (`raw/a4-funding-*.json`; gaps 5e-8 and 4e-8 an hour, 0.026% and 0.195%) [Final review F3].
   The baseline floor means most majors charge longs 10.95% a year (crypto; 5.48% for the rest).
10. WebSocket `book::<iid>::50`, 1 s klines (both in the AsyncAPI spec) and the `corporate-actions` channel (changelog only) — none tested live [Final review F5].
11. The exchange contract's pUSD balance (explorer: $81.64M at 23:43Z, $81.68M at 00:05Z) is a public number worth recording over
    time. Setting it against exchange open interest ($116.6M one-sided notional at 2026-11-08 23:59:39Z) is loose — different
    dates, and open interest is notional, not collateral — so it is no solvency ratio [Final review F2].
12. `/v1/info/competition/widget?address=`: qualification progress of one address, weight 1.

## 4. Potential problems, and how each would be handled

| Problem | Handling |
|---|---|
| The spec lags the live API (routes and fields) | Keep the plan's spec-diff test (R1 §8); parse live replies with non-strict Zod; log unknown keys once a day |
| Docs contradict the live API (leverage, sessions, fee window, index) | Trust the live read, date it, record the contradiction in external-apis; never code a number from a docs sentence |
| A competition changes behavior (boosts, $100K minimum, positive-PnL rule) | Log competition dates and boosted markets with the data; test H1–H7 inside and outside competition windows |
| Equity perps can split (`share_unit_version`, `corporate-actions`) | Poll `/v1/info/stock-splits` daily; flag fills, positions and marks across a split; never join sizes across it |
| Maintenance windows (cancel-only, deploys): order placement pauses, sockets drop, 503 | Read `exchange.cancel_only`; reconnect and resubscribe; mark gaps as maintenance, not as a trader's silence |
| `liquidation` meaning changed on 2026-08-11 (maker legs) and `adl` on 2026-08-10 | Treat flags before those dates as taker-only; do not mix periods in one count |
| `long_count`/`short_count` count accounts, include market makers, say nothing of size | Use as breadth only; pair with open interest |
| Margin ratio from the public portfolio is wrong for isolated positions (web default) | Compute it only when the account's positions fit the cross case; otherwise show "unknown" |
| `fee_override` (ANT now) and beta top-tier accounts break fee-rate → tier | Exclude override markets; treat rebate rows as "top tier or beta" |
| Entities/groups hide that several accounts are one party | State it in every consensus result; do not claim independence |
| The `include_unqualified=true` competition list exists only while or after a competition has run, and its size drifts (4,736 → 4,738 in 18 minutes) | Keep the main boards as the base seed; record the date and `total` with every pass |
| `account_value` is a census value (≤ 8,192 accounts a minute) | Use `/v1/info/portfolio` for the exact equity of a followed account |
| The terms (R1 §13) are unchanged; scraping bans stay | Stay at half the budget, personal use |

## 5. What stays unknown, and what would settle it

- **Whether one account's deposits and withdrawals are listed on an explorer.** My single address page did not render its
  two token transfers. *Settle:* one transaction page of a "Process Withdraw" or deposit call (its event logs show the
  account), or one Dune/Goldsky query; needs the owner's word to exceed the "one contract, one address" limit.
- **Whether rewards show as an equity step** around 12:05 UTC. *Settle:* one `/v1/info/equity` read of a known market maker (~15 tokens).
- **Whether `liquidation_details` ever appears on the live tape or public fills.** *Settle:* a scan for a backstop event (none seen).
- **What `perps-whitelist` gates**, the weights of `stock-splits`, `account-tiers`, `perps-whitelist`, and a builder-stats read.
- **The session of each market** (hours, current category) and the index constituents: no public source.
- **How the smart-wallet address is derived from the signer** (H13's link to the prediction markets): *settle* by computing it
  for a pair polymarket-lab already knows.
- **Whether R1's saved pages differ from today's:** a hash diff by the supervisor.
- **Whether the ticker rate matches the settled rate in every market:** two markets: the rolling rate 10 s before the hour differed from the settled rate by 5e-8 and 4e-8 an hour (0.026% and 0.195%; `out/an-econ.txt`) [Final review F3]; a
  scan of all 90 around one settlement would settle it (weight 2 + 90 × 10 for the history, or the WebSocket `fr` plus one funding read each).

## 6. Beyond the brief

- **If the budget is paid in full, rewards outweigh fees** [Final review F2]. The docs' budget is 3–6 times the gross fees of
  the windows in Q4; the payments themselves are private. If so, part of the boards' tops may be paid for presence rather than
  direction — consistent with R2's finding that the tops are algorithms and market makers, which this does not prove.
- **The baseline funding is a one-sided bet.** With zero premium longs pay 10.95% a year on crypto and 5.5% on the rest; a
  paper follower who holds long for weeks pays it; one who holds short is paid. Funding is in the paper log's rules already;
  this says how big the floor is.
- **The weekly Monday 00:00Z reset, the 12:00Z reward cutoff and the 00:00Z funding settlement** are three clocks that
  shape behavior around the hour; study windows should avoid straddling them blindly.
- **Public wallet balances** (outside the exchange) are readable for any EOA on any explorer. They are pseudonymous but sit close to identification; the sweep did not need them and the H13 rule (Q6) keeps them out unless the owner rules.
- **Cancel-only windows are announced in the changelog's "Rollout" notes**, so gaps in the collector's tape can be explained after the fact.
- **A competition prize winner** gets a `payout_tx_hash`: an on-chain event tied to an address (empty until 2026-11-16 +5 days).

## 7. Questions for the owner

1. **May the collector read `competition/leaderboard` with `include_unqualified=true` beyond rank 1,000 to grow the universe?** It is
   the same public API at weight 1 a page (without the parameter it lists only the 110 qualified accounts). *Recommendation:* yes, once
   a day while a competition runs, inside the budget.
2. **Where is the line for study H13?** Fixed: only public, pseudonymous data, never an attempt to identify a person. Open, for you
   to rule: (a) deposits and withdrawals of a favourited address on the exchange contract; (b) that address's own Polygon wallet
   balance; (c) the same EOA on other venues (e.g. Hyperliquid) and its derived Polymarket prediction-market wallet.
   *Recommendation:* allow (a) only; leave (b) and (c) out until you rule. Nothing beyond your ruling will be read.
3. **May a second small explorer step settle Q6?** One transaction page of the exchange contract. *Recommendation:* yes — it shows the logged account.
4. **Should the collector read `/v1/info/exchange` every minute** (2 tokens) to record maintenance and engine version?
   *Recommendation:* yes.
5. **Should competition dates and boosts be recorded as a covariate in the hypothesis register?** *Recommendation:* yes, before H1–H7 are registered.

## 8. For external-apis

Each fact: date, source. (UTC; reads from my IP, user agent `polymarket-follow-research`.)

- **2026-11-09 23:34Z, spec/docs:** `llms.txt`, `perps-openapi.json`, `asyncapi-perps.json`, `rate-limits.md` byte-identical to the 2026-11-06 copies (sha256 `e62083f3…`, `55b198ce…`, `685bae5e…`, `9970a029…`). The spec has 69 paths / 75 operations; 3 of them (`/v1/blp/*`) and the `backstop` channel have no docs page. The perps API-reference index has 103 pages.
- **2026-11-09 23:41:15Z, live `GET /v1/info/exchange`:** `{"name":"Polymarket","version":"1","chain_id":137,"contract":"0xDCa4af75705dbB50f62437045afF9921947917d2","cancel_only":false,"engine_version":"0.0.86"}`, `cache-control: public, max-age=0`.
- **23:41Z `/v1/info/assets`:** pUSD `0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB`, 6 decimals, collateral_ratio "1.00", withdrawal_fee "0.000000".
- **23:41Z `/v1/info/limit-tiers` = `/v1/info/account-tiers`** (23:42Z): 4 tiers (`min_volume_14d` 0, 1,000,000, 541,800,079, 10,000,000,000), actions/min 2,000 / 5,000 / 15,000 / 30,000, open orders 1,000 / 1,000 / 3,000 / 6,000; WebSocket fields 4294967295; no cache-control header.
- **23:41Z `/v1/info/fees`:** one entry (category equity), tiers keyed `min_volume_30d` — matches the docs table; the changelog (2026-09-27) says "14-day volume" for group aggregation; the two are different uses and which applies to groups is unknown [Final review F4].
- **23:41Z `/v1/info/instruments` (81 KB, 90 rows):** keys also `fee_override`, `funding_multiplier`, `logo`, `max_order_count` 200; `max_leverage` 50 for SP500, NAS100, BTC, ETH, 20 for 8, 10 for 64, 5 for 9, 3 for 5 (the FAQ sentence "up to 20x" does not describe these four markets) [Final review F4]; `isolated_only` and `close_only` false on all; `liquidation_fee` "0.005" on all; ANT-USD (id 97, `pre_ipo`) has a `fee_override`; no `funding_multiplier` set. `instrument_id=51` → KIOXIA-USD retired, `settlement` {sequence 55959926771, timestamp 1790555581797 (2026-09-28T00:33:01Z), price "353.87", insurance_debit "0"}; ids 0, 12, 91–95, 98 → `[]` (23:47Z).
- **23:41Z `/v1/info/tickers`:** also `long_count`, `short_count` (accounts with a nonzero net position on that side, incl. market makers, changelog 2026-10-27); sums 7,770 / 2,944; `funding_rate` is the rolling implied hourly rate (moves within the hour); `next_funding` 2026-11-10T00:00Z for all; no `pricing_status`.
- **23:41Z `/v1/info/markets?instrument_ids=1&include=sparkline,totals`** answers (weight 2): `markets[]` {instrument_id, symbol, display_symbol, logo, max_leverage, quantity_decimals, mark_price, open_price, volume, sparkline[24]}, `totals` {volume "88407923.5", open_interest "117349872.26", market_count 90}.
- **23:42Z `/v1/info/index?asset=BTC|SP500|GOLD|NVDA|SKHYNIX|ANT`:** `{asset, index_price, constituents: [], ts}`; cache `public, max-age=1`.
- **23:42Z `/v1/info/stock-splits`:** `{"events":[],"sequence":101602959840}`. **`/v1/info/perps-whitelist`:** 400 `invalid query parameters: missing field `address``; with an address: `{"status":"ok","whitelisted":false}`, `cache-control: private, max-age=30`.
- **23:41Z `/v1/info/competition/widget`, `/competitions`; 23:45Z `/competition`, `/competition/leaderboard`, `/competition/account`:** competition 1 (2026-11-02T14:30Z → 2026-11-16T14:30Z), `competition/leaderboard` `total` 109 without `include_unqualified` (23:45:45Z; the supervisor read 110 at ~00:03Z) and 4,736 with `include_unqualified=true` (23:45:45Z), 4,737 (23:46:01Z; the supervisor read 4,738); the competition detail says 10,019 participants; `limit` max 100 (`limit must be between 1 and 100`); **with `include_unqualified=true`, offset 4,700 answers** (no 1,000 cap). `competition/account` rows add `fees`, `funding`, `locked_positions`, `row_state`.
- **23:46:58Z `/v1/info/exchange-stats`:** window [2026-11-02 00:00Z, 2026-11-09 00:00Z) (7 UTC days): volume $591,101,131, gross positive fees $170,275.93, OI (one-sided USD notional, sample 2026-11-08T23:59:39Z) $116,556,434; window [2026-11-08 00:00Z, 2026-11-09 00:00Z): volume $39,712,771, fees $13,155.66. The supervisor's re-read of fees for the first window gave the same $170,275.93.
- **2026-11-09 23:59:20Z–2026-11-10 00:00:40Z, ticker against settlement:** CASHCAT-USD (id 70) rolling `funding_rate`
  −0.00019287 (23:59:20Z), −0.00019312 (23:59:50Z); settled −0.00019317 at 00:00:00.093Z. XRP-USD (id 33) −0.00002069,
  −0.0000206; settled −0.00002056 at 00:00:00.090Z. `/v1/info/funding` rows are hourly, stamped 50–95 ms after the hour;
  with `start_timestamp` the reply held 3 rows and `more: false`.
- **Docs, fetched 2026-11-09 23:34–23:36Z (read 23:36–23:48Z):** fee tiers by trailing 30-day volume; MM = notional × 0.5 / maxLeverage; backstop below 2/3 of MM; ADL index = profit ratio × notional / equity; funding formula and 4% hourly cap; mark = median of three, 200 ms; Pyth/Chainlink Data Streams/Hyperliquid; liquidity rewards $75,000/day, 1% of 7-day maker volume, 12:00–12:00 UTC; OI rewards 6% APR on gross OI, entity ≥ $5M; referral 20%; delisting = close-only ≥ 30 min then 30-minute index TWAP; 20 ms taker delay; TP/SL watch the mark; fills' `liquidation` is true for maker and taker legs since 2026-08-11, `adl` on both legs since 2026-08-10; backstop `liquidation_details`.
- **Explorer, 23:43Z (Polygonscan, via a summarising fetch tool; page saved 00:05:59Z in `docs/explorer/`, which confirms the implementation address, the operators and the method names, and shows 81,675,089.32 pUSD and 194,766 transactions at that time) [Final review F8]:** the exchange contract is an ERC-1967 proxy, implementation `0xF92018EeCaF1585De6B6d4989F51482C3E90cCE5`, pUSD balance 81,671,523.51, 194,750 transactions, latest 25 are "Process Withdraw…" and "Commit State Root"; the day-board #1 address page (summary only, **not saved, unverified**) showed 15,759.49 pUSD in its own wallet and "2 token transfers" not rendered.
- **Spec parameters (2026-11-09, inputs identical to 2026-11-06):** `klines` and `mark-history` require `start_timestamp`
  (and `instrument_id`, `interval`); `funding` has none required; `exchange-stats` requires both timestamps and can answer
  408 and 413; `competition/leaderboard` has `include_unqualified`; `tickers` and `statistics` take `instrument_id`.
- **Terms/geography:** not re-read; unchanged since R1.

---

## Evidence list

Scripts (`scripts/`): `lib.mjs`, `fetch-index.mjs`, `dl-pages.mjs`, `dl-extra.mjs`, `apilib.mjs` (limiter, 429 stop, quiet window,
route filter), `api1.mjs` … `api10.mjs`, `api4.mjs` (timed funding check), `spec-inventory.cjs`, `async-public.cjs`, `check-pages.cjs`,
`an-api1.cjs`, `an-calls.cjs`, and, added by the Final review, `an-econ.cjs` (every derived number: funding floor, rolling-against-settled gaps, rewards against fees, dates), `explorer-save.mjs`, `condense.sh`. Outputs (`out/`): `an-econ.txt`, `explorer-save.txt`, `fetch-log.jsonl` (every docs read: time, bytes, sha256), `api-calls.jsonl`
(every API call), `an-calls.txt`, `spec-inventory-all.txt`, `async-public.txt`, `check-pages.txt`, `an-api1.txt`, `api1.txt` … `api10.txt`, `api4.txt`.
Raw replies: `raw/a1-*` … `raw/a10-*`. Docs as downloaded: `docs/pages/`, `docs/specs/`, `docs/condensed/`. Notes: `notes.md`; log: `progress.md`.
Inputs checked: `inputs/SHA256SUMS` against `docs/specs/` (equal).

---

## 9. Final review (2026-11-10, the owner's request; by DOCS-SWEEP itself)

Scope: my scripts, my numbers and this report. Every claim was checked against its source (the page and its read time
from `out/fetch-log.jsonl`, or the saved reply in `raw/`) and every number against its unit. One extra explorer read (the
exchange-contract page, to save it) and no API read were needed. Each fix is its own commit and is marked in place with
`[Final review Fn]`. The supervisor's own live reads (2026-11-10 ~00:03Z: chain 137 and the contract; `/v1/info/markets` 90
rows; exchange-stats fees $170,275.93 for 2026-11-02 00:00Z to 2026-11-09 00:00Z, end exclusive; the competition board with
`include_unqualified=true` answers at offset 4,700, total 4,738, and without it the total is 110) agree with mine.

**Severity 1 — wrong or misleading, could steer a decision**

| # | Finding | Fix (commit) |
|---|---|---|
| F1 | The competition board was described without its parameter in the headline, Q8-H2, §2, §3, §4 and §7; "all 4,737 participants" contradicts the competition's own 10,019 "participants"; the counts drift (109 → 110 qualified; 4,736 → 4,738 listed) and were not dated | e28c1c0 |
| F2 | Rewards against fees: window written "2026-11-02..08" (the read window is 2026-11-02 00:00Z to 2026-11-09 00:00Z, end exclusive); $75,000 a day is the docs' budget, not a measured payment; "the recipients are not public" was not said in the headline; "R2's finding is structural" and the "health ratio" line over-reached | 2bcbd70 |
| F3 | "Rolling and settled funding agree to 0.03%" is true for CASHCAT (0.026%) and **wrong for XRP (0.195%)**; the absolute gap is 5e-8 an hour at most | 7feb7d0 |
| F4 | The six contradictions were not quoted with both sources and read times; two said "stale" (an inference about which source is old) | 9c081b5 |
| F5 | "Live but not in the spec": `builder-stats` is listed among live routes but was never read; `markets` was read for 1 instrument only (the 50 limit and `curated_list` are changelog text); the widget `address` form, the ticker `symbol` filter, `book::50`, 1 s klines, `corporate-actions` and the statistics open rule are changelog or docs text, not tested | 79f25ef |
| F6 | H13: the report listed "the EOA's own wallet on Polygon" among allowed paths and called it "allowed by the brief"; the brief allowed only an explorer look at one address's deposits and withdrawals; the owner has not ruled | bb98ae9 |

**Severity 2 — evidence or wording that does not carry its weight**

| # | Finding | Fix (commit) |
|---|---|---|
| F7 | Derived numbers (55 of 90 on the floor, 3.1×, 5.7×, 2.88 bp, $5.9M, 10.95%, the dates) came from inline `node -e` with no saved script | 0a2bc9e |
| F8 | The explorer facts came from a summarising fetch tool; nothing was saved | 601dee0 |
| F9 | Wrong figures and stamps: the FAQ has **33** questions, not 40; the four extra pages were fetched 23:46:31Z, not "~23:45Z"; placeholder stamps "23:3xZ" and "23:3x–23:4xZ"; "every figure names its output file" is not true; "in 90 s" is 95 s | 458aae0 |
| F10 | Inferences written as facts: fee rate → tier (untested); `perps-whitelist` "is not the registration gate"; "no earlier data was shaped by a competition"; "excluded from the board's win counts"; `liquidation_fee` read as a fraction; the FAQ "keyed by your EOA" quote was not exact | 0dcaec2 |

**Severity 3 — hygiene (scripts left as they ran, on R1's precedent, except F12)**

| # | Finding | Handling |
|---|---|---|
| F11 | `apilib.mjs` imports `createHash` and never uses it; `spec-inventory.cjs` declares `comps` and never uses it; scripts are named `api1` … `api10` (they say nothing); `dl-pages.mjs` fetches the changelog and rate-limits again after `fetch-index.mjs` did; `out/wait-api4.txt` is a leftover; `api6.mjs` and `api7.mjs` hold one public address | left; a project script would take such values as arguments and have a descriptive name |
| F12 | `docs/condensed/` was made by an awk command typed once and never saved | saved as `scripts/condense.sh` (fix F12); run into a scratch folder it reproduces all 37 files of `docs/condensed/` byte for byte |

Commits: findings d26bc77; the collector list (§10) a1f3fca; F12 d030436; F11 left, with its reason in the table.

**How the findings fit later phases (notes).** The collector needs the list in §10. The hypothesis register needs F1 (which
board, which parameter, which date), F2 (the rewards figure is a budget, income is unseen), F5 (what is tested and what is
only documented) and F6 (the H13 rule). The v1 plan must not show a rewards or tier figure as fact: both are inferences.

---

## 10. For the collector (Phase 1)

What the Phase 1 collector should read from this sweep. Costs are the published or measured weight; "tokens a minute" is
the average if the read runs at the stated rhythm; every read is spaced evenly, one at a time, never more than 30 tokens in a
burst, inside the 250-token operating budget (decisions 2026-11-07). Status = tested in this sweep, or text only.

| Read | Keep | How often | Weight | Tokens a minute | Status |
|---|---|---|---|---|---|
| `GET /v1/info/exchange` | `engine_version`, `cancel_only`, `chain_id`, `contract` (maintenance flag and deploy marker; explains gaps in the tape) | every 60 s | 2 | 2.0 | tested (23:41:15Z) |
| `GET /v1/info/tickers` (all 90) | the new `funding_rate` (rolling, hourly), `next_funding`, `long_count`, `short_count`, `open_interest`, `index_price`, `mark_price` | every 60 s (R1 already budgets it) | 2 | 0 new (2.0 already planned) | tested |
| `GET /v1/info/instruments` | `close_only`, `settlement`, `fee_override`, `funding_multiplier`, `max_leverage`, `risk_tiers`, `isolated_only`; also after any `engine_version` change; a market that leaves the list is read once by `instrument_id` for its `settlement` | every 10 min | 2 | 0.2 | tested |
| `GET /v1/info/stock-splits` | `events`, `sequence` (a split would break sizes and prices across it) | once a day | unpublished (charge 10) | 0.007 | tested (empty) |
| `GET /v1/info/exchange-stats` | volume, gross positive fees, open interest for each finished UTC day `[d, d+1)` | once a day after 00:10Z | 10 (1 if cached) | 0.007 | tested |
| `GET /v1/info/competitions` and `/competition?competition_id=` | status, dates, boosts, minimum volume (the covariate for H1–H7) | once a day | 1 + 1 | 0.001 | tested |
| `GET /v1/info/competition/leaderboard` with `include_unqualified=true`, `limit=100`, `offset` 0 … ~4,700 (without the parameter only the qualified accounts are listed) | the universe seed: account, score, PnL split, volume, boosted volume, `instruments_traded`; record `total` and the date | once a day while a competition is live, once more after final results; ~48 pages one every ~3 s (about 2.4 minutes) | 1 a page, 48 a pass | 0.03 (20 while the pass runs) | tested (offset 4,700, total 4,737) |
| `GET /v1/info/competition/account` | a followed account's `row_state`, fees, funding, unrealized PnL | once a day per followed account while live | 1 | 0.014 for 20 accounts | tested for one address |
| `GET /v1/info/funding?instrument_id=&start_timestamp=` | the settled hourly rate (24 rows a day) | once a day per market, spread over the day (one read every ~96 s) | 10 | 0.63 for 90 markets | tested (2 markets) |
| `GET /v1/info/fees` | the 7-tier schedule (`min_volume_30d`) | once a week | 2 | 0.0002 | tested |

**New load: about 2.9 tokens a minute on average** (exchange 2.0, funding 0.63, instruments 0.2, the rest under 0.1), plus the
20-token-a-minute competition pass for 2.4 minutes a day. **Do not read:** `/v1/info/index` (constituents are empty),
`/v1/info/markets` (tickers and statistics cover it), `assets`, `invite`, `perps-whitelist`, `account-tiers`,
`builder-stats` (unverified), `competition/widget`. **Parse rules that follow:** non-strict Zod on every reply; log unknown keys
once a day (the live replies carry fields the spec lacks); keep the raw `max_leverage`, `fee_override` and
`close_only` of each read with its date, so a change is visible; store the competition board with its parameter name and `total`.
