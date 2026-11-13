# WAVE-ELSEWHERE — can the liquidation wave be tested on another venue's public data?

WAVE-ELSEWHERE (Fable 5.2, max), 2026-11-13 22:02Z – 22:47Z (UTC; every
stamp from `date -u`), for polymarket-follow's supervisor: the desk research
that decisions 2026-11-13 ("two outside researches") approved. Evidence: the
source list in section 9 and the supervisor folder's
`workers/WAVE-ELSEWHERE/progress.md`. **A review decides nothing.** It
proposes data, tests and designs, never trades.

**What was and was not done.** Reading only: the brief, the repository files
it lists (CLAUDE.md, current-task, external-apis, `market1/rules.md`,
MARKET-FIND's report, three decisions entries) and the web — 31 searches in
generic words (never the project's or the owner's name) and about 65 pages:
documentation, API specifications, terms, GitHub, vendors' product pages, two
news pages, one preprint's abstract. **No API call to any venue, exchange,
explorer or data vendor; no account; no key; no file or dataset downloaded.**
No call to Polymarket's API. Never opened: the recordings, the collector's
database, the run folder, the paper experiment's and MARKET-1's data,
anything in the supervisor's folder but my own. No agent started;
polymarket-lab not touched; nothing in the repository changed but this file.

**How to read the marks.** **[P]** = read today in the venue's or the
vendor's own document. **[T]** = stated by a third party, not verified.
**[A]** = my arithmetic. **[R]** = this repository's own documents. A number
in brackets, [3], is a source in section 9; every source was read on
2026-11-13. The pages were read through a fetch tool that returns a small
model's reading of the page, so a quotation is as that reading gave it. One
figure came back two ways (Hyperliquid's funding cap, section 8): **a figure
a decision rests on is re-read or checked by a call before use.** Where I
call a venue's markets "thin", or say that GMX prices against a pool, with
no mark, that is my recollection and was not verified today.

## For the owner, in one page

*Words.* The **wave**, the **pool** and **small coins** are MARKET-1's: at
least two different tracked accounts liquidated the same way in small coins
within an hour; the 1,602 tracked accounts; every crypto perp but BTC and
ETH. A **slice** is a fixed part of all of a venue's accounts, chosen by the
digits of the address, so nobody picks who is in it. **Exact** means
MARKET-1's rule word for word; a **proxy** is the nearest thing a venue's
data allows. A **bp** is 0.01%.

**The answer, in two sentences.** Yes, on Hyperliquid: it publishes every
trade with both accounts and marks each liquidation with the liquidated
account, back to mid-2025, and Polymarket Perps is built to the same design,
so MARKET-1's rule maps onto it field for field and can be tested on about
ten months of days nobody here has looked at — for a one-off download cost I
estimate at $20–60 and an AWS account, which is your decision. Nowhere else
exactly: the large centralised exchanges publish liquidations without the
account (Binance at most one a second per coin, its history sold by a
vendor), so there the wave can only be approximated.

**The venues, ranked for this purpose** (the full table: section 5).

| # | Venue | What is public | The account on a liquidation? | History | Cost | For the wave |
|---|---|---|---|---|---|---|
| 1 | **Hyperliquid** | every fill; liquidations marked | **yes** | marked fills from 2025-07-27, probably from 2025-05-25; order books from 2023 | about $20–60 of AWS transfer, once; an AWS account | **exact** |
| 2 | **Binance USD-M futures** | a liquidation-order feed, at most one a second per coin | no | none from Binance itself; a vendor holds it from 2020-01-07 | $700 for a month (Tardis), or its free first day of each month; Binance's own price files are free | a proxy; the venue you named for later |
| 3 | **dYdX v4** | a public tape that marks liquidation trades | not on the tape (on the chain, with more work) | depth not stated; a vendor from 2024-08-23 | free, no key | a proxy at no cost; thin markets |
| 4 | **Lighter** | a public tape with a liquidation mark **and both account numbers** | **yes** | its own history not found; a vendor from 2026-04-17 | live: free; history: paid | exact, but only on months the finding already used; a candidate live sensor |
| 5 | Bybit, OKX, Bitfinex, Deribit, Kraken, HTX, BitMEX, Bitget, Aster | liquidation feeds | no (Bitfinex: a position number) | live feeds; history at vendors | — | proxies, behind Binance |
| 6 | GMX, Drift/Velocity | on-chain liquidations | yes | — | free | no order book, or thin: not first |

**The best design, in a few lines** (WAVE-H; the rules: section 4).
- **Where and when.** Hyperliquid's own archive of fills. The rules are
  frozen by hash first. A sizing step reads counts only, on 2025-05-25 to
  2025-08-01. The test runs on **2025-08-01 to 2026-05-28: 300 days, all
  before Polymarket Perps had any data**, so no day of it is a day the
  finding was made on. Nothing at or after 2026-11-07 is read. Polymarket's
  own months (2026-05-28 to 2026-11-07) are printed apart, as a second
  reading that is not independent.
- **The definition.** MARKET-1's M3–M6 unchanged — a liquidation fill that is
  a taker's and reduces the position; two different accounts, the same side,
  small coins, 60 minutes; one entry a coin an hour; $1,000 against the
  forced side 2 minutes later, held 24 hours, no stop. **The pool becomes a
  slice:** Hyperliquid shows every account, and "two accounts in an hour" is
  true there almost always, so the accounts are cut by address into M equal
  slices, M chosen once so that a slice sees liquidations as often as
  Polymarket's pool did (5.7 episodes a day). Every slice is used.
- **Prices and costs.** A taker at Hyperliquid's archived order book, else
  at the next real trade on our side; 4.5 bps a leg; hourly funding.
- **The baseline.** The same coin's average 24-hour move in the same 4-hour
  block; "holds" needs the result above it too.
- **The verdict, in one look.** HOLDS when the mean net result minus 2.58
  errors is above zero and the excess over the baseline is above zero. DOES
  NOT HOLD when the mean plus 2.58 errors is below +50 bps (your line).
  Otherwise NOT SETTLED, with the largest size the data do not rule out.
- **What it could show** [A]: if waves come as often as on Polymarket's old
  weeks, about 675 entries a slice on about 205 days and an error near 33
  bps: a true +110 bps would be confirmed four times in five. MARKET-1
  reaches 136 only in May 2027. How many waves there really are is unknown
  until a count (K4).

**The checks I would make next** (exact calls: section 6; you approve each).
1. **K1, two keyless calls:** Hyperliquid's list of markets — which of
   MARKET-1's 38 coins trade there. *Yes.*
2. **K2, about five keyless calls:** a liquidated account's own fill, seen on
   real data — the mark, the taker flag, the position before. *Yes.*
3. **K3, your AWS account, a few cents:** list the archive's dates and
   sizes; fetch one hour of fills from the sizing months and one hour of
   books. *Yes — it is the gate to everything else.*
4. **K4, the sizing months only (inside AWS's free 100 GB):** counts, no
   price — how many liquidations a day, the slice size, how often a wave
   state occurs. *Yes, as the plan's first step.*
5. **K5–K7, only if a venue without accounts is wanted later:** one free
   Tardis file of Binance liquidations; two keyless calls to dYdX's tape; a
   count on Polymarket's old weeks of how often two liquidation orders are
   two accounts. *Later.*
6. **K8, reading:** Hyperliquid's and Tardis's terms in a browser (a fetch
   could not read Hyperliquid's). *Yes, before any download.*

**My three steps.**
1. **You decide two gates:** an AWS account for a one-off download (you run
   the commands, so no key enters the project), and where this work lives —
   I recommend research files outside the poller, with the rule "nothing at
   or after the cut is read".
2. **K1–K4, then the project's own road:** a plan written rules-first from
   section 4, a fresh review, the build, the freeze by hash.
3. **Run it once on the 300 days.** Only if it holds: the same positions
   priced on Binance's free files, and a proxy without accounts tested on
   Hyperliquid before any money goes to a vendor.

**Is it worth doing? Yes, on Hyperliquid first.** It is the only way I found
to learn within weeks, from days the finding never touched, whether the
wave is more than one autumn on one venue; MARKET-1 alone needs until
February to May 2027 for sizes under +200 bps. Its honest limits:
- it tests a sibling — Hyperliquid's liquidated accounts as the sensor, not
  Polymarket's pool;
- the 300 days hold 2025-10-10, the largest liquidation crash on record (a
  preprint's words), and the rule has no stop;
- a "holds" there still leaves the price at Polymarket's own book to
  MARKET-1, which this work does not touch.

**If you would rather not open an AWS account:** the free routes are proxies
only — dYdX's public tape (K6), or Tardis's free first day of each month for
Binance (about 82 days) — and the paid one is Tardis at $700 for a month. I
would not pay for a proxy before the exact test exists; I would rather wait
for MARKET-1's February look.

---

## 1. Which venues publish liquidations (question 1)

### 1.1 Hyperliquid — and the shape Polymarket shares with it

**What a liquidation looks like there.**
- **A fill carries the mark and the account.** The WebSocket page defines
  `WsFill` with `liquidation?: FillLiquidation`, and `FillLiquidation` as
  `{liquidatedUser?: string, markPx: number, method: "market" | "backstop"}`
  [P 3]. A user event can also be `{"liquidation": WsLiquidation}` with
  `lid`, `liquidator`, `liquidated_user`, `liquidated_ntl_pos`,
  `liquidated_account_value` [P 3].
- **Every trade names both accounts.** `WsTrade` has
  `users: [string, string] // [buyer, seller]` [P 3].
- **The archive's fill files pair each fill with its user:** a record is a
  two-element array, the address first, then the fill (`coin`, `px`, `sz`,
  `side`, `time`, `startPosition`, `dir`, `closedPnl`, `hash`, `oid`,
  `crossed`, `fee`, `tid`, …) [P 8]. The node's own README says the fills
  are written "in the API fills format", and with `--batch-by-block` one
  block a line, `{local_time, block_time, block_number, events}` [P 55].
  The schema page's example fill is an ordinary one and shows no
  `liquidation` field [P 8]; a third party's schema of the
  same files lists it as optional, with `liquidatedUser`, `markPx`,
  `method`, and adds "Counterparty fills can carry it too" [T 14]. Dune's
  table built from those files sets `liquidation_method` and
  `liquidated_trader` on both legs of the match [T 16]. **So the liquidated
  account's own leg is the one whose user equals `liquidatedUser`.**
- **The mechanics** [P 5]: a liquidation starts when "the account equity
  falls below the maintenance margin"; positions are first closed by
  "sending market orders to the book"; for large positions "only 20% of the
  position will be sent as a market liquidation order to the book", with "a
  cooldown period of 30 seconds"; when equity "drops below 2/3 of the
  maintenance margin without successful liquidation through the book" the
  liquidator vault takes the position (the backstop); "the maintenance
  margin is half of the initial margin at max leverage"; "there is no
  clearance fee on liquidations".

**History depth.**
- **Hyperliquid's own files** [P 1]: `s3://hl-mainnet-node-data/node_fills_by_block`
  ("fills which are streamed via `--write-fills --batch-by-block`" from a
  non-validating node); older data "in a different format" at
  `…/node_fills` and `…/node_trades`, where "`node_fills` matches the API
  format, while `node_trades` does not"; also `explorer_blocks`,
  `replica_cmds`, `misc_events_by_block`. A second bucket,
  `hyperliquid-archive`, holds L2 book snapshots
  (`market_data/[date]/[hour]/[datatype]/[coin].lz4`) and asset contexts
  (`asset_ctxs/[date].csv.lz4`), uploaded "approximately once a month", with
  the warning "There is no guarantee of timely updates and data may be
  missing"; "No other historical data sets are provided via S3 (e.g. candles
  or spot asset data)". **The page gives no dates.**
- **The dates, from third parties** [T 13]: `node_trades` 2025-03-22 to
  2025-05-25 (15.13 GB), `node_fills` 2025-05-25 to 2025-07-27 (31.81 GB),
  `node_fills_by_block` 2025-07-27 to today (294.58 GB compressed, hourly
  `.lz4`) — sizes of that provider's own copy, taken here as a guide.
  Liquidation-marked fills from 2025-07-27 are confirmed by two more:
  Dune's table built from the node fills has its history from 2025-07-27
  [T 16], and Hydromancer's liquidation endpoint says "All data is fully
  available from 28-07-2025" [T 19] (0xArchive's own liquidation series
  starts later, 2025-12-22 [T 21]). From 2025-05-25: the official page's
  "`node_fills` matches the API format" [P 1] together with the API's fill
  format [P 3], and a press report that "Hyperliquid's fill-log archive
  begins on May 25, 2025" in a preprint that measured forced sales from it
  [T 24, 25]. `node_trades` (before 2025-05-25) shows both users but no
  liquidation mark in its documented fields [P 8].
- **The books:** the official example fetches SOL's L2 book of 2023-09-16
  [P 1]; a third party gives "from 2023-09 at roughly 550 ms" [T 15],
  another its own book series from 2023-04-15 [T 21].
- **The API is not a history source** [P 2]: `userFills` "returns at most
  2000 most recent fills"; `userFillsByTime` "at most 2000 fills per
  response and only the 10000 most recent fills are available";
  `candleSnapshot` "only the most recent 5000 candles"; a time-range reply
  holds 500 elements.

**Access.**
- **The archive is "requester pays"** ("the requester of the data must pay
  for transfer costs") [P 1]. AWS: with such a bucket "anonymous access to
  that bucket is not allowed. You must authenticate all requests" [P 12] —
  **so it needs an AWS account and its key.** Cost: the fills bucket is in
  Tokyo at "$0.114 per GB to the internet after a 100 GB monthly free
  allowance", the book bucket in us-east-1 at $0.09 per GB, and the whole of
  `node_fills_by_block` "closer to $40 to $50" before the free allowance
  [T 15]. My estimate for this design: **$20–60** [A] — about 220 GB of
  fills for the sizing and test months (about 320 GB with Polymarket's own
  months) at $0.114 a GB, less the 100 GB a month that are free, plus a few
  dollars for the book hours of the positions. K3's listing gives the exact
  sizes.
- **The API is keyless:** `POST https://api.hyperliquid.xyz/info`, the only
  header listed is `Content-Type: application/json` [P 2, 10]. Limits per IP
  [P 4]: "REST requests share an aggregated weight limit of 1200 per
  minute"; `l2Book`, `allMids`, `clearinghouseState`, `orderStatus`,
  `spotClearinghouseState`, `exchangeStatus` weigh 2, `userRole` 60, "all
  other documented `info` requests have weight 20", with extra weight per 20
  items returned on `userFills`, `userFillsByTime`, `fundingHistory` and
  others and per 60 items on `candleSnapshot`. WebSocket: 10 connections,
  1,000 subscriptions, and **"maximum of 10 unique users across
  user-specific websocket subscriptions"** — so its public feed cannot
  follow a pool of accounts live.
- **Paid or gated copies** (none needed if the archive is used): Dune's
  Hyperliquid tables are "private and available to enterprise customers and
  trial accounts" [T 18]; Hydromancer's API starts at "$300 per month"
  [T 20]; Dwellir's plans "start at $49 per month" [T 15]; 0xArchive's free
  plan reads "the most recent 30 days" [T 21]; SQD's portal streams
  Hyperliquid fills with the user, `crossed`, `dir` and `startPosition` but
  **without the `liquidation` object**, its access terms not stated [T 23];
  Tardis has Hyperliquid from 2024-10-29 (trades with both users from
  2024-12-01, 20-level books about every 5.4 s) but **no liquidations data
  type for it** [P 27, 28]. Baselight, which hosted a copy, has shut down.

**Terms.** None found on the documentation pages read [P 1, 2, 10]. The app's
terms page is a JavaScript page a fetch cannot read [11]: **not read** (K8).

**Fees and funding.** Base tier: taker 0.045%, maker 0.015%, falling with
14-day volume; staking discounts 5–40% [P 6]. "The funding rate on
Hyperliquid is paid every hour", on `position_size * oracle_price *
funding_rate` [P 7]. **The cap is unsettled:** three fetches of the page
today returned "capped at 0.5%/hour", while a search summary of the same
page and third-party guides say 4% an hour, which is Polymarket's figure
too [R]. The page may have changed, or the fetch misreads it: to re-read
directly (it does not touch the design, which charges funding as settled).

**Is Polymarket's `/v1/info/` API like Hyperliquid's? Yes, in substance, and
it matters.**

| | Polymarket Perps [R: external-apis] | Hyperliquid [P] |
|---|---|---|
| A liquidation on a fill | `liquidation` true; `liquidation_details {mark, method}`, seen with method "backstop" | `liquidation {liquidatedUser, markPx, method: "market" \| "backstop"}` [3] |
| The fill's other fields | `previous_size`, `pnl` (gross), `taker` | `startPosition`, `closedPnl`, `crossed` [2, 8] |
| Maintenance margin | notional × 0.5 ÷ max leverage | "half of the initial margin at max leverage" [5] |
| The ladder | the book, the backstop below 2/3 of it, then ADL | market orders to the book, the liquidator vault below 2/3 [5] |
| Funding | hourly | "paid every hour" [7] |
| Rate limit | 1,000 weighted tokens a minute per IP; book 2–20, most reads 2–10 | 1,200 weight a minute per IP; `l2Book` 2, most reads 20 [4] |
| Reads | `GET /v1/info/fills?address=` and others, keyless | `POST /info {"type":"userFills","user":…}`, keyless [2] |
| The index | a weighted average of Pyth, Chainlink Data Streams and **Hyperliquid** | — |

- **What differs.** The transport and the names. Polymarket's public tape
  hides the accounts and marks only the liquidated account's own leg (0 of
  634 counterparty legs [R: MARKET-FIND]); Hyperliquid's node files show
  every account and mark both legs [T 14, 16]. Polymarket lists accounts
  only through its boards; Hyperliquid's files hold everyone.
- **Why it matters.** (1) MARKET-1's counted fill maps field for field: no
  proxy is needed (section 2). (2) The liquidation engine is the same
  design, so "a liquidation fill" is the same kind of event on both. (3)
  Polymarket's index takes Hyperliquid's price, and the coins are the same,
  so the two venues live the same market days: **the same dates on
  Hyperliquid are not a second sample.** Only other dates are (section 4).

### 1.2 Other on-chain or on-chain-settled venues

- **dYdX v4.** The indexer's public tape
  (`GET /trades/perpetualMarket/{ticker}`) returns `id`, `side`, `size`,
  `price`, `type`, `createdAt`, `createdAtHeight`; `type` is one of "LIMIT",
  "LIQUIDATED", "DELEVERAGED", "TWAP_SUBORDER"; **no address or subaccount
  on a public trade** [P 43]. An account's fills (`GET /fills`, `address` and
  `subaccountNumber` required) carry `type` "LIQUIDATED" or "LIQUIDATION",
  `liquidity` TAKER or MAKER and `positionSizeBefore` [P 43] — the first is
  the liquidated side, the second the other side [T: a client library's
  notes] — but one must already know the address. The
  chain itself names the liquidated subaccount in each block's liquidation
  matches [T: the protocol's type definitions as copied in a client
  library]; reading it needs a node or an indexer. Candles 1MIN to 1DAY and
  historical funding are public [P 43]. Mainnet base
  `https://indexer.dydx.trade/v4`, no key [T 44]; "100 requests per 10
  seconds" [T 44]. **History depth and retention: not stated anywhere I
  read.** Tardis holds its liquidation trades from 2024-08-23 [P 27]. Fee
  tier 1: 5.0 bps taker, 1.0 maker [T 44]. Terms: not read.
- **Lighter.** Its WebSocket reference gives the public `trade/{MARKET_INDEX}`
  channel a message with `"liquidation_trades": [Trade]` and `"trades":
  [Trade]`, and a Trade JSON with `"type": "trade" | "liquidation" |
  "deleverage" | "market-settlement"`, `ask_account_id`, `bid_account_id`,
  `is_maker_ask`, `price`, `size`, `timestamp` [P 45]; the subscribe example
  shows no `auth` field, and `account_all_trades/{ACCOUNT_ID}` is listed
  without one too [P 45]. **So the account numbers are public on every
  trade, live.** Its own historical archive: not found (the old docs
  address redirects to an overview). Tardis has Lighter from 2026-04-17
  [P 30]; 0xArchive's Lighter liquidations from 2026-06-10 [T 21]. Rate
  limits, fees, terms: not read.
- **GMX v2.** Liquidations are on-chain events with the account; a GraphQL
  index (Arbitrum, Avalanche, MegaETH endpoints) holds `TradeAction` rows
  for them [T 46: a copy of GMX's docs; `docs.gmx.io` came back empty];
  Allium lists GMX liquidation tables [T 48]. Positions trade against a pool
  at an oracle price, not an order book. Key, limits, history, terms: not
  stated on the page read.
- **Drift → Velocity.** `docs.drift.trade` now redirects to
  `docs.velocity.exchange`, which describes a keyless data API with dated
  archive paths "starting at 2022" and `format=csv` [P 47]; liquidation
  records by user and by market are in a search summary of the same docs
  [T]. The relation between the two names is not stated on the page.
- **Aster.** A Binance-style `forceOrder` stream "publishing only the latest
  liquidation per symbol in each 1000ms window" [T: Tardis's page on Aster,
  through a search summary]; Tardis holds it from 2026-08-23 [P 27]. No
  account. Aster's own documentation: not read.
- **Not examined:** Jupiter Perps, Paradex, edgeX, Aevo, Pacifica, Ostium,
  Synthetix, Gains and others.

### 1.3 The large centralised exchanges

- **Binance USD-M futures.** The liquidation order stream
  (`<symbol>@forceOrder`; all markets together `!forceOrder@arr` [T: a
  search summary of the same documentation]):
  "For each symbol, only the latest one liquidation order within 1000ms
  will be pushed as the snapshot"; fields: symbol, side, order type, time in
  force, quantity, price, average price, status, last and accumulated filled
  quantity, trade time; **no account** [P 34]. **No official history:** the
  REST query of all liquidation orders stopped being maintained in April
  2021 [T 38: a search summary of Binance's announcement]; the
  `liquidationSnapshot` files on data.binance.vision are gone — "no longer
  provided", USD-M removed (its data had stopped after 2024-03-31), the last
  COIN-M file 2024-10-14 [P 37: a repository collaborator, 2026-10-06].
  Tardis holds the stream from 2020-01-07 [P 27, 29].
  **Prices are free:** data.binance.vision's futures `aggTrades`, `trades`
  and `klines`, with checksum files [P 35]. **Terms** (Vision Dataset Terms,
  version 1.0, last updated 2026-08-26) [P 36]: CC BY-NC-SA 4.0; "Permitted
  non-commercial uses are limited to academic research, non-monetized open
  educational projects, algorithmic historical backtesting for purely
  personal non-production research, and non-commercial open-source data
  science evaluations"; "You shall not use the Datasets for live proprietary
  trading execution, automated commercial order generation, or signal
  distribution to third parties for direct or indirect compensation". Fees:
  0.05% taker, 0.02% maker for a regular user, funding every 8 hours by
  default [T 38: a search summary of Binance's FAQ; the live fee table not
  read].
- **Bybit.** WebSocket topic `allLiquidation.{symbol}`: pushes "all
  liquidations that occur on Bybit" every 500 ms, for USDT, USDC and inverse
  contracts; fields `T` (time), `s`, `S` (the position's side), `v` (size),
  `p` (bankruptcy price); **no account; no REST history on the page**
  [P 39]. Tardis: the older `liquidation` topic before 2025-02-26, this one
  since [P 27]. Fees, terms: not read.
- **OKX.** A public WebSocket channel `liquidation-orders` exists [T: a
  search of OKX's docs]; Tardis records it since 2023-03-30 and describes it
  as "Liquidation orders with at most one update per second per contract"
  [T 54] — a snapshot like Binance's, if that is right. **The REST endpoint
  for liquidation orders and its look-back could not be verified:** OKX's
  one-page documentation is too long for the fetch and the section was not
  reached [40].
- **Deribit.** The public trades method still documents `liquidation`:
  "Optional field (only for trades caused by liquidation): "M" when maker
  side of trade was under liquidation, "T" when taker side was under
  liquidation, "MT" when both sides of trade were under liquidation"; no
  account, no key [P 41]. But Tardis writes "Deribit removed the liquidation
  field from public trade subscriptions" on 2023-10-03, and its series ends
  there [T 27].
  **Conflicting: unresolved.**
- **Bitfinex.** A public REST history,
  `https://api-pub.bitfinex.com/v2/liquidations/hist` (`start`, `end`,
  `limit` up to 500, `sort`): rows `POS_ID` (a position's number), `MTS`,
  `SYMBOL`, `AMOUNT`, `BASE_PRICE`, `IS_MATCH`, `IS_MARKET_SOLD`,
  `PRICE_ACQUIRED`; no authentication in its spec; 3 requests a minute as
  read; depth of history not stated [P 42]. **A position number is the
  nearest thing to an account any centralised exchange gives.** Its perps
  are thin.
- **Others, from Tardis's table only** [T 27]: BitMEX (`liquidation` since
  2019-03-30), Kraken Futures (trades of type liquidation since 2019-03-30),
  HTX (`liquidation_orders` since 2020), Bitget (since 2026-04-28; "only the
  largest long and the largest short liquidation per symbol each second"
  since 2026-06-23). None with an account.
- **Not examined:** Gate, KuCoin, MEXC, Coinbase and the smaller exchanges;
  Bybit's and OKX's own download sites for historical files.

### 1.4 Vendors and datasets

| Vendor | What | Price and access | Source |
|---|---|---|---|
| **Tardis.dev** | a `liquidations` type (exchange, symbol, time, id, side, price, amount) for the exchanges of 1.2–1.3, with its own caveat: "liquidation data should not be assumed to contain every individual liquidation event"; also trades, books, funding | per month: Academic $350, Solo $700, Professional $1,000, Business $3,000 for the Perpetuals plan (Binance Futures, OKX Swap, Bybit Derivatives, Hyperliquid "plus 18 more"); history 4 years on yearly billing (monthly billing's depth not stated); no one-off purchase; **the first day of each month is free without a key**; a free trial of days 1–10 of the previous month, no payment details; terms of service not read | [P 27, 31, 32, 33] |
| CoinGlass | order-level liquidations of "the past 7 days" (Standard plan and up); longer history only aggregated by interval; no account | Hobbyist $29, Startup $79, Standard $299, Professional $699 a month [T] | [P 49; T] |
| Coinalyze | liquidation history aggregated by symbol and interval | "The API is free", with a key from signing up; limits not found | [T 50] |
| Coin Metrics | liquidations from nine futures exchanges, one row an order or trade; "Most venues are real-time only with no liquidation history to re-query" | not stated | [P 51] |
| Hydromancer | every Hyperliquid liquidation fill with the user, from 2025-07-28 | from $300 a month | [T 19, 20] |
| Dune | Hyperliquid fills with liquidation columns from 2025-07-27 | enterprise or trial only | [T 16, 18] |
| Allium, Flipside, Amberdata, Kaiko, CryptoQuant, Glassnode | liquidation tables or series (Flipside's Hyperliquid trades table has a liquidation flag, per a search summary; its pages returned nothing to the fetch) | not read | [T 48] |
| Pinax | Hyperliquid liquidation events and daily counts by market | a free tier is advertised; not read further | [T 22] |

**Free public datasets.** None found: no open archive of liquidations with
history turned up on GitHub, Kaggle or Hugging Face (two searches), and
Binance's own files are gone (1.3). The only free history is a venue's own:
Hyperliquid's archive (for the transfer cost), dYdX's tape and Bitfinex's
REST history (depth unverified), and Tardis's first day of each month.

**Published studies.** None found that measures a move back over a day after
liquidations in small coins (two searches, summaries only; MARKET-FIND found
none either). Two 2026 preprints by one author study liquidation cascades as
such — one on warning signs in seven Binance BTC cascades, one that measures
the October 2025 crash from Hyperliquid's fill log [T 24, 25, 52] — which
shows the fill log is usable for this kind of work. One blog post reports no
five-minute bounce after about 40 large liquidations; it is written by an AI
agent, names no venue and gives no figures [T 53].

## 2. How the wave maps onto each (question 2)

### 2.1 Exactly, on Hyperliquid

| MARKET-1 [R: rules.md] | Hyperliquid's fill files |
|---|---|
| M2: the pool's fills | every `[user, fill]` record |
| M4: `liquidation` true | a `liquidation` object whose `liquidatedUser` is the record's user (the counterparty's leg carries the object too and is not counted) |
| M4: `taker` true | `crossed` true |
| M4: reducing — `previous_size` non-zero, opposite in sign to the side | `startPosition` non-zero, opposite in sign to the side (`side` "A" sells, "B" buys) |
| M4: the forced side | "A" a forced sell (a long closed), "B" a forced buy |
| M4: the instant, the order | `time` (ms); (time, coin, user, `tid`) |
| M5: two different pool addresses, one side, any small coin, the 60 minutes up to t | the same, within one slice of the accounts |
| M5: one entry a market in 60 minutes | the same, within one slice |
| M6: $1,000 against the forced side, t + 2 min, 24 h, no stop | unchanged |

**What "a fixed pool of accounts" becomes: a slice.**
- **Why the pool cannot be "everyone".** Polymarket's pool is a sample: 5.7%
  of small-coin trades and 12.8% of taker notional, "between a twentieth and
  an eighth" of liquidations [R: MARKET-FIND 1.1]. Hyperliquid shows every
  account, and it is far larger: one third-party page counts between 14 and
  6,446 different accounts liquidated a day in BTC alone and between 4 and
  2,547 in ETH over 2026-10-23 to 11-12 [T 22] (medians 1,552 and 315 [A]).
  With everyone in the pool, "two accounts within an hour" would hold nearly
  always and mean nothing.
- **What makes the two detectors alike.** The wave fires when the pool sees
  two accounts in an hour while it normally sees about one episode every
  four hours (386 episodes in 68 days = 5.68 a day [R]): a burst several
  times the usual rate. A sample that sees liquidations at the same average
  rate fires on bursts of the same relative size. So: **a slice of the
  accounts whose average rate of 60-minute episodes equals the pool's 5.68
  a day.**
- **How a slice is made:** by the address, read as a number, modulo M.
  Addresses are hash values, so a slice is a random sample nobody chose; it
  is fixed before any price is read, as the pool was; and there are M of
  them, each a pool of its own. Using all M averages out the luck of which
  accounts sit in one pool (MARKET-FIND's two half-pools gave +299 and +379
  [R]).
- **What changes against Polymarket.** A slice is random; the pool was
  chosen from boards, mostly by volume (330 of 383 episodes [R]). The
  liquidation "marks the moment, it does not make the move" [R], so the
  sensor's make-up should matter little; it is still a difference. The
  pool's episodes were concentrated — its ten busiest accounts took part in
  155 of the 386 [R] — and a random slice may be less so, which would make
  waves somewhat more frequent at the same episode rate; the share of time
  in a wave state, printed beside Polymarket's 3.7%, shows it. Each
  sub-account and vault is its own address there, so two "accounts" can be
  one trader — as on Polymarket.
- **Beside it, the plain form:** every account counted, the wave state when
  at least K different accounts were liquidated one way within the hour, K
  sized on the same months so that the state holds about as often as on
  Polymarket's old weeks (242 quarter-hours [R: A14] of 68 days × 96 =
  6,528: 3.7% [A]). It
  decides nothing; if the two forms disagree, the rule is fragile.

**Which coins are small there.** The first perp dex's crypto markets but BTC
and ETH. Deciding set: MARKET-1's 38 coins (M3) that already trade there
when the sizing months begin — the same assets, liquid books, one choice
less.
Beside: every small coin of the first dex. Never the builder-deployed
markets (`dex:COIN` names: stocks, indices, commodities — the kinds in which
MARKET-FIND saw nothing) and never spot. K1 gives the list. Polymarket's
KPEPE and KSHIB look like Hyperliquid's own naming (my recollection, not
re-read today).

### 2.2 Exactly, elsewhere

- **Lighter:** the same mapping with `type` "liquidation" and the account
  numbers; the slice is the account number modulo M. Which of the two
  accounts is the liquidated one must be read from the data (a later
  check). Its history starts inside Polymarket's own months, so today it
  can only repeat the finding's dates.
- **dYdX v4, GMX, Drift:** exact in principle from chain data (the
  liquidated subaccount or account is on-chain); each needs an indexer and
  is thin in small coins. Not first.

### 2.3 As a proxy, where no account is published

**The proxy.** A row of the venue's liquidation feed takes the place of a
counted fill (Binance: one liquidation order; Bybit: one liquidation; dYdX's
tape: one trade of type LIQUIDATED). Rows are cut into M slices by a hash of
the row (symbol, time, price, size), M sized as in 2.1. The wave: two rows
of one slice, the same side, small coins, 60 minutes.

**What that changes.**
1. **"Two different accounts" becomes "two different rows."** One account
   liquidated in tranches or across coins gives several rows; MARKET-FIND
   found one account across coins is no wave (+3.6 ± 104.5, 35 cases [R]).
   Thin slices blunt this — two rows of one account rarely fall in the same
   small slice unless it sends a long train — but do not remove it.
2. **Binance's feed is a snapshot:** at most one order a second per coin
   [P 34], so a burst is under-counted. A wave still shows; its size does
   not.
3. **A vendor's copy is not complete** by its own words [P 27], and
   Hyperliquid's founder has said some centralised exchanges under-report
   liquidations "by as much as 100 times" [T 26].
4. **The pool is gone:** a row's hash is not a person, so "the same accounts
   later" cannot be asked.

**How I would check the proxy's fidelity, before trusting it.**
- **On Hyperliquid, where both are known:** hide the accounts, group fills
  into orders (`oid`), keep at most one order a second per coin (Binance's
  rule), slice the rows by hash, and compare with the exact wave on the same
  days: the share of proxy entries within an hour of an exact entry and the
  reverse, day by day. Counts only. After WAVE-H's verdict, the two lines'
  results side by side.
- **On Polymarket's old weeks (already studied):** how often two liquidation
  order events within the hour are two accounts (K7): MARKET-FIND counted
  461 order events, 386 episodes, 342 of them one account [R].
- **Across venues:** do the wave hours on Binance's or Bybit's feed fall on
  Hyperliquid's wave hours? If they do, any of them can stand in as the
  sensor.

**Small coins on a centralised exchange:** the USDT-margined perps of
MARKET-1's coins (their local names, the "1000" multiples included — my
recollection of Binance's naming); beside, every USDT perp but BTC and ETH.

## 3. Honest prices (question 3)

| Venue | Order books in history | Trades in history | Marks or candles | Taker fee; funding |
|---|---|---|---|---|
| **Hyperliquid** | the official L2 archive, requester pays, monthly, "may be missing" [P 1]; from 2023-09, about 550 ms [T 15]; Tardis from 2024-10-29, 20 levels about every 5.4 s, paid [P 28] | every fill in the fill files (the same download as the liquidations) [P 1, 8] | asset contexts in the archive [P 1]; the API's candles only the last 5,000 [P 2]; funding history by API, keyless [P 9] | 0.045%; hourly, on the oracle price [P 6, 7] |
| **Binance USD-M** | Tardis (depth from 2019-11-17), paid [P 29] | `aggTrades` and `trades` files, free [P 35] | `klines` files, free [P 35] | 0.05%; 8 hours by default [T 38] |
| **dYdX v4** | now only [P 43]; Tardis, paid | the public tape [P 43]; depth not stated | candles 1MIN–1DAY, funding [P 43] | 5.0 bps tier 1 [T 44]; funding not read |
| **Lighter** | Tardis from 2026-04-17, paid [P 30] | Tardis; own archive not found | mark-price candles on the WebSocket [P 45] | not read |
| **Bybit, OKX** | Tardis, paid | not read | not read | not read |

- **Hyperliquid can be priced the way MARKET-1 is:** the archived book at
  the entry and the exit, walked as a taker for $1,000 (M7). Where the
  archive has no snapshot, the fill files give the next best thing — the
  price the next real taker on our side paid — because every trade with its
  aggressor is in them.
- **Binance's free files answer your own question** ("later I can move on
  Binance" [R: decisions 2026-11-13]): the same positions priced at
  Binance's trades cost nothing more, and its terms allow "historical
  backtesting for purely personal non-production research" [P 36]. Three
  quarters of the move was the whole small-coin market's [R], so a wave
  sensed on one venue can be priced on another.

## 4. The best replication design, rules first (question 4)

**WAVE-H.** Written so that it can be frozen before anyone looks. A plan
would turn each rule into code with a test, as MARKET-1's did.

**H0. Identity.** One deciding line; everything else is beside and decides
nothing. The rules, the code and the sizing procedure are frozen by hash
before any price of the test period is read. **Nothing stamped at or after
2026-11-07T00:00:00Z (MARKET-1's CUT) is read or downloaded.** MARKET-1 is
not touched and nothing here changes it.

**H1. Data.** Hyperliquid's own archive: `node_fills` and
`node_fills_by_block` for the fills, `hyperliquid-archive/market_data` for
the books; funding from the info API or the archive's asset contexts. Every
record is parsed against a schema; one that fails is dropped and counted; a
missing or unreadable hour is a gap.

**H2. Periods (UTC).**
- **SIZING** = [2025-05-25, 2025-08-01): 68 days, counts only.
- **TEST** = [2025-08-01, 2026-05-28): 300 days; every entry instant lies in
  it. Polymarket Perps' first mark is 2026-05-28T01:26Z [R: external-apis],
  so no day of TEST is a day any exploration here used.
- **APART** = [2026-05-28, 2026-11-07): the finding's own months; printed
  after the verdict, never part of it.
- If K3 shows that `node_fills` lacks the `liquidation` object: SIZING =
  [2025-07-27, 2025-10-03), TEST = [2025-10-03, 2026-05-28), 237 days.

**H3. Coins.** S = the coins of M3 that have a fill on Hyperliquid's first
perp dex in SIZING's first seven days; the list is fixed at the freeze. A
coin listed later is never in S (as M3). Never a builder-deployed market,
never spot. BTC and ETH for lines beside.

**H4. A counted fill.** A record `[user, fill]` with its coin in S, a
`liquidation` object whose `liquidatedUser` is `user`, `crossed` true, and
`startPosition` non-zero and opposite in sign to the side. Its side is the
forced side; its instant is `time`. Both methods count, as M4 names none;
they are printed apart. (How a backstop fill looks — whether it is `crossed`
— is settled by K3 before the freeze, without a price.)

**H5. Slices.** slice(user) = the address as an integer, modulo M. For M = 1
upward, r(M) = the mean over slices of the slice's 60-minute episodes in
SIZING, divided by 68; the scan stops when r(M) is below half of 5.68;
**M is the value whose r(M) is nearest 5.68**; a tie takes the larger. (An
episode: a counted fill of the slice whose market's previous counted fill
of that slice is more than 60 minutes before, or none — MARKET-1's B1.)

**H6. The wave and an entry.** M5 word for word, inside each slice: at least
two different addresses of the slice with a counted fill of the side, in any
coin of S, in the 60 minutes up to t (both ends included); an entry is a
counted fill at whose instant that holds for its side, when its market has
had no entry of that slice in the 60 minutes up to t. Run from SIZING's
start, so that an earlier entry blocks.

**H7. The position.** M6 word for word: against the forced side, $1,000,
opened at t + 120 s, closed 24 hours later, no stop, positions overlap
freely.

**H8. The price, as a taker.** (1) The book: the last archived snapshot of
the coin at or before the leg's instant and at most 60 s older, walked as M7
walks it; a leg the levels cannot fill is "depth short". (2) Else the tape:
the first trade at or after the instant, within 60 s, whose taker was on our
side. (3) Else unpriced, counted, never guessed.

**H9. Costs.** 4.5 bps of each leg's notional (the base tier, no discount);
every hourly funding settlement inside the hold, on the oracle price; net =
gross − fees + funding, in bps of the $1,000 (M9).

**H10. The matched baseline.** For a coin and the 4-hour UTC block of the
entry: the mean 24-hour move over every whole minute of TEST in that cell
(minute-end prices from the fill files) — M12's BASE. A position's excess =
its gross on those prices − its direction × BASE.

**H11. The statistic.** x = a position's net in bps, each position alike,
all slices together; m = the mean; SE = M10's two-way error, clustered by
the UTC day of t and by market. One look. **z = 2.58** (two-sided 1%: on the
old weeks the clustered error was a tenth to a third too narrow [R], and
2.58 ÷ 1.3 is still 1.98).

**H12. The verdict — the first that holds.**
1. **WITHHELD** when more than 10% of the positions are unpriced or depth
   short.
2. **TOO FEW TO TELL** when the priced positions span fewer than 40 UTC days
   or 10 markets.
3. **DOES NOT HOLD** when m + z·SE < +50 bps (the owner's line, M11).
4. **HOLDS** when m − z·SE > 0 **and** the mean excess is above 0 (a
   market's drift cannot pass as the effect).
5. **NOT SETTLED** otherwise, with the sentence "No mean result as large as
   X bps a position was seen", X = m + z·SE.

When 3 and 4 both hold — a real effect below the owner's line — the verdict
is DOES NOT HOLD, as M11 rules.

*Holds and does not hold are verdicts on this test, never instructions to
trade.*

**H13. Beside, deciding nothing.**
- **ALONE:** the episodes outside a wave (Polymarket: +22 ± 35, nothing
  [R]), and WAVE minus ALONE — the finding's second half.
- **One slice alone** (slice 0): what one pool like Polymarket's would have
  seen. **The plain form** (K accounts, 2.1). **M halved and doubled.**
- THREE (three accounts), SIDES, LATE (1 h, 3 h), OWN (minus the other small
  coins), BTC and ETH at the entries, each method apart, the 38 against
  every small coin.
- **The tail:** the worst day, the largest fall from a peak, the most
  positions open at once; the mean without the two days that add most and
  **without the day with the most positions**; each UTC day alike instead of
  each position; by month, with the slices' episode rate and the share of
  time in a wave state beside each month.
- The same entries moved to random days; the book-priced and the tape-priced
  positions apart.
- **PRICED ON BINANCE:** the same positions at Binance's free trade files
  with Binance's fees.
- **APART:** the finding's own months, with a count of how many of
  Polymarket's old wave hours [R: the supervisor's stored entries] fall in
  a Hyperliquid wave hour.

**What each outcome would mean.** HOLDS: the market's move back after a
burst of forced closures is not a quirk of one autumn or one venue;
MARKET-1's lead is more credible, and what remains for MARKET-1 is the price
at Polymarket's own book. DOES NOT HOLD: ten months on a venue about a
hundred times larger (about $10 billion traded a day [T 26] against
Polymarket's $591M a week [R]) rule out an effect worth +50 bps; the old
weeks' +310 was then
most likely that autumn's or the pool's, and MARKET-1 runs on to its looks
as frozen. NOT SETTLED: the sentence gives the size not ruled out, to set
against +297.

**How many waves the history would give.** From published rates: **unknown**
— no source gives liquidated accounts by hour and coin. By construction the
slices see liquidations at Polymarket's rate, so if Hyperliquid's flow is as
bursty as Polymarket's was, about 2.25 entries a day a slice: **about 675
entries on about 205 of the 300 days** [A: 153 entries on 47 of 68 days,
R]. The error would then be near 68 × √(47 ÷ 205) ≈ 33 bps for one slice
[A]; all slices together can only narrow it. HOLDS would need a mean above
about +85; a true +110 would be confirmed four times in five [A: (2.58 +
0.84) × 33]. MARKET-FIND's table for MARKET-1 [R]: 297 in December, 195 in
February, 136 in May. K4 replaces this arithmetic with a count before the
freeze.

**What could still fool us.**
1. **A sibling, not the same thing.** The sensor is Hyperliquid's liquidated
   accounts; the positions are at Hyperliquid's book.
2. **The sizing rule is a choice.** That is why M halved and doubled, one
   slice alone and the plain form are printed.
3. **2025-10-10.** The largest liquidation crash on record, in a preprint's
   words [T 24], is inside TEST: about $641M was force-sold on Hyperliquid
   in its worst minute [T 25], and
   open interest on Hyperliquid fell by a third or more [T 26]. The rule has
   no stop, and the first entries of such a day are early. One day is one
   cluster among about 200, but it can move the mean; the verdict is on all
   days and the figure without it is printed.
4. **The errors.** Day clusters treat neighbouring days as separate; hence
   2.58.
5. **The archive "may be missing"** by Hyperliquid's own words: gaps are
   counted and WITHHELD guards the verdict.
6. **Another regime.** August 2025 to May 2026 is not September to November
   2026. That is the point of a second sample, and a reason a result there
   need not equal Polymarket's.

**If accounts are wanted on no venue (a sketch, not for now): WAVE-B.** The
proxy of 2.3 on Binance's feed from Tardis (2020-01-07 on), Binance's free
trade files for prices, 5 bps a leg, 8-hour funding, the same H5–H12. It
buys six years and the venue you named, at $700 for a month (the history a
monthly plan opens is to be confirmed) and a proxy whose fidelity is
measured on Hyperliquid first. A free pilot exists: Tardis's first day of
each month, about 82 days since 2020 — about the weight of the original
finding, no more.

## 5. The venue table

| Venue | Liquidations in public data | With the account? | History | Access | Honest prices | Taker fee; funding | Terms for personal research |
|---|---|---|---|---|---|---|---|
| **Hyperliquid** | every fill marked `liquidation {liquidatedUser, markPx, method}` [P 3]; official fill files [P 1] | **yes**: each record `[user, fill]` [P 8]; both legs marked [T 14, 16] | marked fills from 2025-07-27 [T 13, 16, 19], probably 2025-05-25 [P 1 + T 25]; both users on trades from 2025-03-22 [T 13] | S3 requester pays: an AWS account, about $0.09–0.114 a GB [P 1, 12; T 15]; API keyless, 1,200 weight a minute, but only an account's last 10,000 fills [P 2, 4] | archived L2 books from 2023-09 [P 1; T 15]; every trade in the fill files | 0.045%; hourly [P 6, 7] | none stated in the docs read; the app's terms not read |
| **Lighter** | public trade channel: `type` liquidation, `liquidation_trades` [P 45] | **yes**: `ask_account_id`, `bid_account_id` [P 45] | own archive not found; Tardis from 2026-04-17 [P 30] | WebSocket without auth in the docs [P 45]; limits not stated | Tardis, paid | not read | not read |
| **dYdX v4** | public tape `type` LIQUIDATED; an account's fills LIQUIDATED / LIQUIDATION [P 43] | tape: no; fills: only for a known address; on-chain: yes [T] | depth not stated; Tardis from 2024-08-23 [P 27] | keyless REST [T 44]; 100 requests per 10 s [T] | candles and funding public [P 43]; no past books | 5.0 bps tier 1 [T]; not read | not read |
| GMX v2 | on-chain events; GraphQL `TradeAction` [T 46] | yes, on-chain [T 48] | not read | public GraphQL; key not stated | oracle price, no book | not read | not read |
| Drift → Velocity | liquidation records by user and market [T]; a keyless data API from 2022 [P 47] | yes [T] | "starting at 2022" [P 47] | keyless [P 47] | not read | not read | not read |
| **Binance USD-M** | `forceOrder` stream: the latest one order a second per coin [P 34] | no | no official history [P 37; T 38]; Tardis from 2020-01-07 [P 27] | live: keyless; history: Tardis $700 a month, or its free first day of each month [P 31, 32] | free files: `aggTrades`, `trades`, `klines` [P 35] | 0.05%; 8 h default [T 38] | CC BY-NC-SA; personal non-production backtesting allowed; no live trading use [P 36] |
| Bybit | `allLiquidation.{symbol}`: all liquidations, 500 ms [P 39] | no | no REST history [P 39]; Tardis from 2020-11-03, this feed since 2025-02-26 [P 27] | live: public topic | not read | not read | not read |
| OKX | public `liquidation-orders` channel, at most one update a second per contract [T 54]; REST not verified | no field seen | Tardis from 2020-12-18 for swaps [P 27] | not verified | not read | not read | not read |
| Deribit | trades' `liquidation` M / T / MT in the docs [P 41]; removed 2023-10-03 per Tardis [T 27] | no | conflicting | public method [P 41] | not read | not read | not read |
| Bitfinex | public REST `liquidations/hist` [P 42] | a position number (`POS_ID`) | depth not stated; Tardis from 2019-09-14 [P 27] | keyless; 3 requests a minute as read | not read | not read | not read |
| BitMEX, Kraken Futures, HTX, Bitget, Aster | feeds, per Tardis's table [T 27] | no | 2019–2026 by venue [T 27] | — | — | — | — |

## 6. The next small checks (question 5)

None was made. Each is for the owner to approve.

**K1 — Hyperliquid's markets. Keyless, two calls.**
`POST https://api.hyperliquid.xyz/info`, header `Content-Type:
application/json`, bodies `{"type":"meta"}` and `{"type":"perpDexs"}`
(weight 20 each of 1,200 a minute [P 4, 9]).
*Proves:* which of M3's 38 coins trade on the first dex and under what
names; how many small coins the venue has; which are delisted; the builder
dexes to leave out. *Recommendation: yes.*

**K2 — the fill's fields on real liquidations. Keyless, about five calls.**
`{"type":"vaultDetails","vaultAddress":"0xdfc24b077bc1425ad1dea75bcb6f8158e10df303"}`
(the documentation's own example; its reply lists child addresses [P 2]),
then `{"type":"userFills","user":"<a child address>"}` for each child (at
most 2,000 fills; the fills of a vault that takes over liquidated positions
should carry `liquidation` objects naming a `liquidatedUser`), then
`userFills` for two of those `liquidatedUser` addresses. About 600 weight
in all; spread over two minutes.
*Proves, on real data:* that a liquidated account's own fill carries
`liquidation` with itself as `liquidatedUser`, with `crossed`, `dir` and
`startPosition` as H4 needs; how a backstop fill differs from a market one;
that the other leg is marked too. If no child's fills carry the object, K3
answers the same. *Recommendation: yes.*

**K3 — the archive's dates, sizes and one hour. The owner's AWS account;
cents.**
`aws s3 ls s3://hl-mainnet-node-data/ --request-payer requester`, then the
same one and two levels down under `node_fills/` and `node_fills_by_block/`
to the first and last day, and under `s3://hyperliquid-archive/market_data/`;
then `aws s3 cp` of **one hour of fills from the sizing months** from each
prefix (2025-06-01 12h and 2025-07-28 12h, for example) and one coin's L2
file of the same hour, in the form the docs show:
`aws s3 cp s3://hyperliquid-archive/market_data/<date>/<hour>/l2Book/SOL.lz4 . --request-payer requester`.
*Proves:* each prefix's first and last day and total bytes (the bill);
that `node_fills` carries the `liquidation` object as `node_fills_by_block`
does; both legs' marks; whether a backstop fill is `crossed`; the book
files' spacing, depth and holes. *Recommendation: yes; you run the
commands, a budget alarm set, the key never given to an agent.*

**K4 — a count, no price. The sizing months only (about 32 GB of
`node_fills` and five days more: inside AWS's free 100 GB a month [A]).**
Counted fills, liquidated accounts and 60-minute episodes a day in S; M by
H5; the share of quarter-hours in a wave state, beside Polymarket's 3.7%.
*Proves:* that the mapping yields a usable number of waves, before anything
is frozen or priced. *Recommendation: yes, as the plan's first step.*

**K5 — Tardis's free day. A keyless download of one small file.**
`https://datasets.tardis.dev/v1/binance-futures/liquidations/2025/06/01/SOLUSDT.csv.gz`
(the pattern of Tardis's examples [P 33]; the first day of a month; the
exchange's name as in Tardis's page address [29], to be confirmed).
*Proves:* that the free first-day files include the `liquidations` type;
the row format; one coin's count on one day. *Recommendation: only when a
Binance arm is considered.*

**K6 — dYdX's tape. Keyless, two calls.**
`GET https://indexer.dydx.trade/v4/trades/perpetualMarket/SOL-USD?limit=100`
and the same with `&createdBeforeOrAt=2024-01-01T00:00:00.000Z`.
*Proves:* that the public tape reaches back that far and how often `type`
is LIQUIDATED. *Recommendation: later; it is the free fallback if AWS is
refused.*

**K7 — Polymarket's old weeks, counts only. No call (the supervisor's
stored seed before the cut).** Of the hours with two liquidation order
events, how many hold two accounts. *Proves:* what a venue without accounts
loses. *Recommendation: when a proxy venue is considered.*

**K8 — the terms. Reading in a browser.** Hyperliquid's app terms (a fetch
gets an empty page) and, if Tardis is ever used, its terms of service.
*Recommendation: yes, before any download.*

## 7. My three next steps, and my view (question 6)

1. **The owner's two gates.** (a) An AWS account for one-off downloads: it
   is a paid cloud account with a key, which Iron Rule 1 does not foresee
   ("only Polymarket's public, unauthenticated endpoints are called") and
   decisions 2026-11-13 leaves to you. I recommend yes, with you running
   K3's commands yourself, so that no key is ever in the project. (b)
   Where the work lives: research files that read downloaded archives
   offline, outside the poller's runtime and its frozen programs; one rule
   carried over — nothing at or after the cut is read. Without an AWS
   account only proxies remain (K5, K6): I would then wait for MARKET-1's
   February look rather than pay a vendor for a different rule.
2. **K1–K4, then the road MARKET-1 took:** a plan from section 4, a fresh
   review of the rules, the build with a test for every rule, a fresh code
   review, the freeze by hash, and only then TEST's files.
3. **One run, one report.** If it HOLDS: the Binance-priced line is already
   in it, and the proxy's fidelity on Hyperliquid tells whether a Binance
   history (six years) is worth $700. If it DOES NOT HOLD or is NOT
   SETTLED: nothing is bought, and MARKET-1's looks decide.

**My honest view.** Worth doing, and Hyperliquid first. The finding rests on
one autumn (68 days, about twenty separate waves) and was shaped on those
same days; its own author expects the true size to be smaller [R]. MARKET-1
answers that forward, slowly: 297 bps in December, 136 in May. Hyperliquid's
archive answers it backward, on 300 other days, in the time it takes to
plan, build and freeze — and for tens of dollars, where every other route to
history costs hundreds a month and loses the account. What I would not do:
start with a centralised exchange. Without accounts the test is of a
different rule, and a miss there would say little about the wave.

## 8. Notes, slips and what was not read

- **A by-product for v1's open question** (how to see liquidations soon
  enough inside the budget — decisions 2026-11-13): if APART's count shows
  Polymarket's waves falling in Hyperliquid's wave hours, a public feed of
  another venue could be the live sensor at no cost to Polymarket's budget.
  Lighter's public trade channel carries liquidation trades with account
  numbers [P 45]; Bybit's sends every liquidation [P 39]; Binance's one a
  second per coin [P 34]. Hyperliquid's own public feed cannot follow a
  pool (10 users [P 4]), and its node asks for 16 vCPUs, 128 GB of RAM and
  Ubuntu [P 55]. An idea for the v1 plan; it decides nothing.
- **Figures to re-read directly:** Hyperliquid's funding cap (0.5% an hour
  by three fetches of [7], 4% by a search summary of the same page; see
  1.1) — **and a caution it gives for every quotation here: the fetch's
  reading can be wrong**, so a figure a decision rests on is re-read in a
  browser or checked by its K-check first; Bitfinex's "3 requests a minute"
  [42]; the size of Hyperliquid's own bucket (the sizes here are a third
  party's copy [13]).
- **Not read or not reachable:** Hyperliquid's app terms (JavaScript page);
  OKX's REST section (page too long for the fetch); `docs.gmx.io` (empty);
  dYdX's rate-limit page (404); two Dwellir pages (decompression failed);
  one CryptoSlate address and newhedge's changelog (403); Tardis's and the
  other vendors' terms of service; every venue's own fee page but
  Hyperliquid's.
- **A sample that runs past the cut.** Pinax's product page [22] shows
  Hyperliquid's BTC and ETH liquidation counts a day through 2026-11-12:
  another venue, BTC and ETH only, no small coin and no price. I used it
  for one order of magnitude (2.1) and nothing else.
- **Text addressed to an agent.** Two vendors' documentation pages (Tardis,
  Lighter) carry "agent instructions" asking the reader to call an address;
  the fetch tool reported them and nothing was done with them.
- **Slips.** Three stamps in `progress.md` were first written from an
  estimate (4 to 12 minutes ahead of the clock) and corrected from `date
  -u`; later stamps are written by the clock inside the command. The brief
  named MARKET-FIND's sections 1, 3 and 4; the file came whole and I read
  all of it.
- **For the supervisor.** The reviews' README has no line for this file
  (the brief allows me this file only). If Hyperliquid becomes a data
  source, its facts belong in external-apis after K1–K3 verify them by
  call; today's are desk facts.

## 9. Sources (all read 2026-11-13, between about 22:04Z and 22:46Z; the clock was read before and after, not at each page)

**Hyperliquid's own pages**
1. https://hyperliquid.gitbook.io/hyperliquid-docs/historical-data — the two
   S3 buckets, requester pays, monthly uploads, "may be missing", the fill
   prefixes; no dates.
2. https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint
   — `userFills`, `userFillsByTime`, `candleSnapshot` limits; `vaultDetails`
   and its example; the one header.
3. https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
   — `WsTrade.users`, `WsFill.liquidation`, `FillLiquidation`,
   `WsLiquidation`.
4. https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/rate-limits-and-user-limits
5. https://hyperliquid.gitbook.io/hyperliquid-docs/trading/liquidations
6. https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees
7. https://hyperliquid.gitbook.io/hyperliquid-docs/trading/funding
8. https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/nodes/l1-data-schemas
   — `[user, fill]` records; `node_trades` fields.
9. https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals
   — `meta`, `perpDexs`, `fundingHistory`.
10. https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api — the
    base addresses.
11. https://app.hyperliquid.xyz/terms — an empty JavaScript shell to a
    fetch; not read.

**AWS**
12. https://docs.aws.amazon.com/AmazonS3/latest/userguide/RequesterPaysBuckets.html

**Third parties on Hyperliquid**
13. https://www.dwellir.com/docs/hyperliquid/data-catalog.md — prefix dates
    and sizes (its own copy).
14. https://www.dwellir.com/docs/hyperliquid/data-catalog/node-feeds/fills.md
    — the fill schema with the optional `liquidation`.
15. https://www.dwellir.com/blog/hyperliquid-historical-data-for-backtesting
    — bucket regions, egress prices, the L2 archive's start and spacing.
16. https://docs.dune.com/data-catalog/curated/perpetuals/hyperliquid/perp-trades.md
17. https://docs.dune.com/data-catalog/curated/perpetuals/hyperliquid/perp-market-metrics-daily.md
18. https://docs.dune.com/data-catalog/community/hyperliquid/overview
19. https://docs.hydromancer.xyz/readme/rest-api/historical-data/liquidationhistorybytime
20. https://docs.hydromancer.xyz/readme/pricing
21. https://pypi.org/project/oxarchive/ — 0xArchive's series and start
    dates.
22. https://pinax.network/fr/products/perp-exchange-api — sample daily
    counts of liquidation events and liquidated accounts.
23. https://docs.sqd.dev/en/api/hyperliquid-fills/stream.md (and
    `…/metadata.md`, `…/portal/hyperliquid/networks/hypercore-fills.md`).
24. https://arxiv.org/abs/2608.03616 — the abstract.
25. https://cryptoslate.com/shifting-576-million-of-forced-sales-off-public-order-books-saved-hyperliquid-from-a-systemic-crash-during-peak-panic/
    — 2026-08-18; "fill-log archive begins on May 25, 2025".
26. https://www.theblock.co/news/markets/2025-10-21-hyperliquid-traders-double-down-after-historic-wipeout-keep-getting-liquidated-375347

**Tardis.dev**
27. https://docs.tardis.dev/faq/data — the liquidations table by exchange.
28. https://docs.tardis.dev/historical-data-details/hyperliquid
29. https://docs.tardis.dev/historical-data-details/binance-futures
30. https://docs.tardis.dev/historical-data-details/lighter.md
31. https://docs.tardis.dev/faq/billing-and-subscriptions
32. https://tardis.dev/ — the prices.
33. https://docs.tardis.dev/downloadable-csv-files/data-types.md — the
    columns and the address pattern.

**Binance**
34. https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Liquidation-Order-Streams
35. https://github.com/binance/binance-public-data — the README.
36. https://github.com/binance/binance-public-data/blob/master/TERMS_AND_CONDITIONS.md
37. https://github.com/binance/binance-public-data/issues/337
38. Search summaries of Binance's own pages, not read directly:
    https://www.binance.com/en/support/announcement/bcc9e902421a46398771c5f15f550685
    (2021-04, the REST liquidation queries), https://www.binance.com/support/faq/360033544231
    (fees), https://www.binance.com/en/support/faq/360033525031 (funding).

**Other centralised exchanges**
39. https://bybit-exchange.github.io/docs/v5/websocket/public/all-liquidation
40. https://www.okx.com/docs-v5/en/ — the liquidation section not reached.
41. https://docs.deribit.com/api-reference/market-data/public-get_last_trades_by_instrument_and_time
42. https://docs.bitfinex.com/reference/rest-public-liquidations

**Other on-chain venues**
43. https://raw.githubusercontent.com/dydxprotocol/v4-chain/main/indexer/services/comlink/public/api-documentation.md
44. https://docs.dydx.xyz/indexer-client/http, and search summaries of
    https://docs.dydx.xyz/interaction/endpoints (the mainnet address), of a
    client library (the rate limit) and of dYdX's fee page.
45. https://docs.lighter.xyz/api/websocket.md
46. https://gmx-docs.pages.dev/docs/api/graphql/ — a copy of GMX's docs.
47. https://docs.velocity.exchange/historical-data/historical-data-v2 —
    reached by redirect from docs.drift.trade.
48. https://docs.allium.so/historical-data/perpetuals/liquidations.md

**Other vendors and studies**
49. https://docs.coinglass.com/reference/liquidation-order; the plan prices
    from a search summary of https://coinglass.com/pricing.
50. https://api.coinalyze.net/v1/doc — a search summary only.
51. https://docs.coinmetrics.io/market-data/market-data-overview/market-liquidations
52. Search summaries only: https://arxiv.org/pdf/2607.27070 and
    https://journals.lincoln.ac.nz/index.php/JFDA/article/view/1395.
53. https://dev.to/howiprompt/the-death-of-the-easy-bounce-hypothesis-lab-report-3lp3
54. https://docs.tardis.dev/historical-data-details/okex-swap — Tardis's
    description of OKX's liquidation channels.
55. https://github.com/hyperliquid-dex/node — the node's README: the write
    flags, "the API fills format", the machine it needs.
