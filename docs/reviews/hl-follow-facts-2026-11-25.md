# HL-FOLLOW-FACTS — the facts a follower of Hyperliquid's traders would meet

HL-FOLLOW-FACTS (Sonnet 5.5, xhigh, fresh), 2026-11-25. Pages read 12:53–13:08Z
by `date -u`'s checkpoints (12:52:45 start, 12:59:06 after Finotive, 13:05:07
after Binance). A research report: it decides nothing; the supervisor copies
what holds into external-apis.

**Method.** Web reading only: official docs, help articles, terms and the venues'
own public pages. No API call, no key, no account, no sign-in, no wallet
connected, no form submitted, no file saved from a site. The only clicks were a
tab on Finotive's symbols page and the page numbers of Binance's public contract
table. Nothing about the project or the owner was sent to any site (only page
loads and, twice, a search for public pages).
The docs pages were read as raw page text in the browser pane, and each docs
page's own "Last updated" stamp was read from its page (`<time datetime>`), so a
fact below carries the page's edit date and the day it was read. Pages that
render a table by script (Binance fees, Finotive symbols) were read from the
rendered page: Binance's fee table only as a screenshot, so its figures are read
by eye. A reader tool that summarises a page was tried once and dropped: it
would not quote.

**Scope.** Facts about venues and costs. No advice on what to trade (Iron Rule
6); the section "For COPY-H's plan" is about the test's design.

---

## 0. The short table

| | Fact | Date, source |
|---|---|---|
| **HL cost of a base-tier round trip** | taker 0.045% a side = **9.0 bps**; maker 0.015% a side = 3.0 bps; one of each 6.0 bps. Plus spread (the docs say nothing) and funding (below) | fees page, edited 2026-08-19, read 2026-11-25 |
| **HL funding** | paid every hour; hourly rate = 1/8 of an 8-hour rate; interest part 0.01% per 8 h = **0.00125% an hour (about 0.03% a day, paid by longs when the premium is small)**; the premium moves it; **cap 0.5% an hour** | funding page, edited 2026-10-31 |
| **HL watching** | any address, no key: `userFills`, `userFillsByTime`, `clearinghouseState` (positions), `portfolio` (equity and PnL history), `vaultDetails`, `subAccounts`; WebSocket `userFills`, `userEvents`, `clearinghouseState` for any address | info-endpoint pages, edited 2026-10-01; subscriptions, 2026-11-10 |
| **HL limits** | REST 1,200 weight a minute per IP; `userFills` / `userFillsByTime` weight 20 plus more per 20 rows; `clearinghouseState` weight 2; WebSocket **10 unique users** across user subscriptions, 10 connections, 1,000 subscriptions | rate-limits page, edited 2026-11-12 |
| **A follower's delay (from the docs and the weights; not measured)** | tool side: **about 1–3 s** by WebSocket (10 accounts per IP; the whole venue if the public `trades` feed carries both addresses, as its docs type says), **5–10 s** polling positions of 50 accounts at half budget, **30–110 s** polling fills of 28–50 accounts. The owner's own reaction comes on top | section 2.5 |
| **HL vaults** | leader takes 10% of profit; the protocol vault (HLP) none; lock-up 4 days for HLP, 1 day for user vaults; vault positions, trades and depositors are public; 3,032 vaults, $219.6M locked (2026-11-25) | vault docs, edited 2026-02-26 to 2026-08-17; app page |
| **HL terms on copying** | **no sentence on copying, following, scraping or research**; 3.1.8 bars bots that exceed reasonable usage or bypass rate limits; US, Ontario (Canada) and sanctioned persons barred | app terms, "Last updated on June 15, 2026", read 2026-11-25 |
| **Finotive: copying** | **"No." Copying trades from third-party accounts ... is prohibited** (help 955, terms 7.10). **All its accounts are demo, simulated, non-executable** (terms 1.3) | help article (no date shown), terms (no date shown, (c) 2026), read 2026-11-25 |
| **Finotive: coins** | 123 crypto symbols; **14 of the 38 small coins** and BTC, ETH, SOL; commission 0.06% (0.045% Pro); crypto leverage 1:10; no swap figure published | symbols page, read 2026-11-25 |
| **Binance futures: copying by hand** | **no clause on it in the Terms of Use read** (no hit for copy, mirror, signal in 207,000 characters); its Copy Trading follows only Binance lead traders | terms effective 2026-10-27; FAQ updated 2026-07-16 |
| **Binance futures: coins and costs** | 813 perpetuals listed; **37 of the 38 small coins** by ticker (not CASHCAT), BTC, ETH; USDT-margined regular taker 0.05%, maker 0.02% (taker 0.045% with BNB) = 10 bps a round trip taker | trading-parameters and fee pages, read 2026-11-25 |

---

## 1. Hyperliquid's costs

### 1.1 The fee schedule (perps)

Source: `hyperliquid.gitbook.io/hyperliquid-docs/trading/fees`, page edited
2026-08-19T06:07Z, read 2026-11-25. The page shows no other date.

- **Assessed** on rolling 14-day volume at the end of each UTC day. "Perps and
  spot volume are counted together ... spot volume will count double": 14-day
  weighted volume = perps + 2 × spot. Sub-accounts share the master's tier;
  vault volume is separate.
- **Base rate, tier 0 (no volume): taker 0.045%, maker 0.015%.** A new account
  pays this.

| Tier | 14-day weighted volume | Taker | Maker |
|---|---|---|---|
| 0 | none | 0.045% | 0.015% |
| 1 | > $5M | 0.040% | 0.012% |
| 2 | > $25M | 0.035% | 0.008% |
| 3 | > $100M | 0.030% | 0.004% |
| 4 | > $500M | 0.028% | 0.000% |
| 5 | > $2B | 0.026% | 0.000% |
| 6 | > $7B | 0.024% | 0.000% |

- **Discounts on those rates:** HYPE staking, 5% (more than 10 HYPE) up to 40%
  (more than 500,000); referral discounts "for a user's first $25M in volume"
  (the percentage is not on this page); maker rebates -0.001% to -0.003% for a
  share of 14-day maker volume above 0.5%, 1.5% or 3.0%.
- **One fee tier across all assets,** HIP-3 perps included. **A HIP-3 market
  (a builder-deployed market, coin named `dex:COIN`) costs more:** the page's
  own formula multiplies the taker rate by `deployerFeeScale + 1` when the scale
  is below 1, and by 2 × scale otherwise. So 1× to 2× or more of the base rate,
  by market; each deployer's scale is on chain and not on this page. "Growth
  mode" markets cost at least 90% less.
- **Per round trip at base tier (arithmetic on the table):** taker both sides
  9.0 bps; maker both sides 3.0 bps; entry taker and exit maker 6.0 bps. The
  paper experiment's venue, for comparison, is 8.0 bps taker (external-apis,
  `/v1/info/fees`, 2026-11-06).

### 1.2 How funding is computed and paid

Source: `.../trading/funding`, edited 2026-10-31T10:49Z, read 2026-11-25.

- **Paid every hour.** "The funding rate formula applies to 8 hour funding
  rate. However, funding is paid every hour at one eighth of the computed rate."
- **Formula (the page's own):** `F = average premium + clamp(interest rate -
  premium, -0.0005, +0.0005)`. The premium is "sampled every 5 seconds and
  averaged over the hour". `premium = impact_price_difference / oracle_price`,
  with the impact bid and ask taken at an impact notional (20,000 USDC for BTC
  and ETH, 6,000 USDC for the others; contract-specifications page, edited
  2026-05-07).
- **Interest part:** "0.01% every 8 hours, which is 0.00125% every hour, or
  11.6% APR paid to short".
- **Payment:** `position_size * oracle_price * funding_rate`; the oracle price,
  "not the mark price"; "purely peer-to-peer and no fees are collected".
- **Cap: "capped at 0.5%/hour"**, the same for every asset. (The page's own
  worked example ends at 0.95% and so breaks its own cap; the cap sentence is
  taken as the rule.) This is not Polymarket Perps' cap (4% an hour).
- **Direction:** a positive rate means longs pay shorts.
- **Meaning for a copy:** a 6-hour hold at the interest part alone is about
  0.75 bps for a long (0.00125% × 6), and the premium adds or removes from that;
  the settled hourly rates are on `fundingHistory` (a coin, a time range; reply
  `fundingRate`, `premium`, `time`; responses over a time range return at most 500
  elements, info-endpoint page, edited 2026-10-01).

### 1.3 Other costs a follower meets, as the docs describe them

- **Builder fees** (builder-codes page, edited 2026-05-23): a builder is paid on
  fills it sends for a user; the user approves a maximum; **at most 0.1% on
  perps**, 1% on spot; the fill's `fee` includes it and `builderFee` shows it.
  A trader who trades through a front end that is a builder pays it in addition
  to the venue fee. The record's 4,063 Polymarket fills had none (external-apis);
  Hyperliquid's own files carry `builderFee` (external-apis, 2026-11-13).
- **Account activation:** a new account needs 1 quote token (1 USDC) for the
  first transaction that has it as destination (activation-gas-fee page, edited
  2026-06-05).
- **Spreads and thin coins: the docs say nothing.** Pages read: fees, funding,
  order book, order types, contract specifications, perpetual assets. The only
  limits stated: market-order and limit-order size caps ($500,000 to $30,000,000
  by max leverage; limit orders 10 times that; "position limit: N/A") and a
  TWAP sub-order slippage cap of 3% (order types, edited 2026-10-31; contract
  specifications). A follower's spread and impact must come from the tape or
  books (the project's own measurements), not from the docs.
- **No withdrawal or deposit costs were read** (not asked; not on the pages
  above).

---

## 2. Watching any account on Hyperliquid, read only

### 2.1 Without a key?

**Yes, per the docs.** Every info request takes the address as a plain field
(`user`), with no signature; a WebSocket subscription takes `user` the same way.
The one pitfall the docs give: pass the account's own address, not an agent
wallet's, "which leads to an empty result" (info-endpoint and subscriptions
pages). The record agrees: the info API answered keyless for the HLP vault and
its children on 2026-11-13 (external-apis). Nothing in this report was called.

### 2.2 The `info` requests that show an account

(`POST https://api.hyperliquid.xyz/info`; info-endpoint pages edited 2026-10-01.)

| Request | Gives | Limits stated |
|---|---|---|
| `userFills` (`user`, optional `aggregateByTime`) | fills, newest | "at most 2000 most recent fills" |
| `userFillsByTime` (`user`, `startTime`, optional `endTime`, `aggregateByTime`) | fills in a window | "at most 2000 fills per response and only the 10000 most recent fills are available" |
| `clearinghouseState` (`user`, `dex`) | open positions and margin summary | weight 2 |
| `portfolio` (`user`) | account value and PnL history for day, week, month, all time, perps only | weight 20 |
| `userFunding`, `userNonFundingLedgerUpdates` (`user`, `startTime`) | funding paid; deposits, transfers, withdrawals | extra weight per 20 rows |
| `subAccounts` (`user`) | the sub-accounts of a master and their state | |
| `vaultDetails` (`vaultAddress`), `userVaultEquities` (`user`) | see section 3 | |

- The fill's fields (docs, WsFill and the examples): `coin`, `px`, `sz`,
  `side` ("B"/"A"), `time` (ms), `startPosition` (the size before the fill),
  `dir` ("Open Long", "Close Short", ...), `closedPnl`, `hash`, `oid`,
  `crossed` (true = taker), `fee` (negative = rebate; "inclusive of
  builderFee"), `tid`, `feeToken`, optional `liquidation {liquidatedUser,
  markPx, method}` and `builderFee`. HIP-3 coins carry the dex prefix
  (`xyz:XYZ100`).
- **A master's sub-accounts and a vault are separate addresses** ("sub-accounts
  treated as separate users" for limits; `subAccounts` lists them). A copy
  test that follows an owner must list those addresses.
- Only the 10,000 most recent fills of an account are reachable by the API; the
  deeper past is in the S3 archive (historical-data page, edited 2026-05-20,
  "requester pays"; and external-apis' public bucket).

### 2.3 The WebSocket (wss://api.hyperliquid.xyz/ws)

Pages edited 2026-10-16 (overview, timeouts) and 2026-11-10 (subscriptions).

- **Per account:** `userFills` (`aggregateByTime` optional), `userEvents`
  (fills, funding, liquidation, `nonUserCancel`; channel name "user"),
  `orderUpdates`, `clearinghouseState`, `allDexsClearinghouseState`,
  `userFundings`, `userNonFundingLedgerUpdates`, `webData3`, `notification`.
- The subscription's first reply is a snapshot ("The subscription ack provides a
  snapshot of previous data for time series data (e.g. user fills)", tagged
  `isSnapshot: true`). On a reconnect, "Missed data during the reconnect will be
  present in the snapshot ack on reconnect"; a disconnect "may happen
  periodically and without announcement".
- **The public `trades` feed per coin:** each trade is typed
  `{coin, side, px, sz, hash, time, tid, users: [buyer, seller]}`. If the live
  feed carries `users` as the docs type says, one subscription per coin shows
  **every account's trades with no per-user subscription** (and so no 10-user
  limit). **This is the docs' type only; it was not seen live** (no call was
  allowed). Whether a follower must still read each trade's account state is
  open: a trade has no `startPosition`, so a position open before the
  subscription has to be read once (`clearinghouseState`).
- The server closes a connection that has had no message from the client for 60
  s; `{"method":"ping"}` answers `{"channel":"pong"}`.

### 2.4 Rate limits and weights

Source: `.../for-developers/api/rate-limits-and-user-limits`, edited
2026-11-12T03:04Z, read 2026-11-25. All per IP address.

- **REST: an aggregated weight of 1,200 a minute.** Info requests: weight 2
  (`l2Book`, `allMids`, `clearinghouseState`, `orderStatus`,
  `spotClearinghouseState`, `exchangeStatus`); 60 (`userRole`); **20 for every
  other documented info request.** "An additional rate limit weight per 20 items
  returned" applies to `recentTrades`, `historicalOrders`, `userFills`,
  `userFillsByTime`, `fundingHistory`, `userFunding`, and others (`candleSnapshot`:
  per 60 items). The extra amount is not stated; one per 20 is the natural
  reading, so a full 2,000-fill reply would weigh about 120.
- **WebSocket: at most 10 connections; 30 new connections a minute; 1,000
  subscriptions; "10 unique users across user-specific websocket
  subscriptions"; 2,000 messages sent to Hyperliquid a minute; 100 in-flight
  posts.** The 10-user limit is per IP, not per connection: a second connection
  does not raise it.
- "Use websockets for lowest latency realtime data." For large batches the page
  says to use the S3 bucket.
- **The project's budget rule (about half of the published limit, Iron Rule 5)
  gives 600 weight a minute.** Arithmetic on that: 30 `userFills`-type reads a
  minute (at about 21 each) or 300 `clearinghouseState` reads a minute.
- **A fetch the plan wants:** COPY-H-PLAN's about 6,700 `fundingHistory` reads
  (240 coins × 28 windows; 480 rows a window under the 500 cap): at weight 20
  each it is 134,000, **about 3.7 hours at 600 a minute**; with the extra
  weight at one per 20 rows (24 for a 480-row reply), 44 each, 295,000,
  **about 8 hours.** Hours, not minutes; plan the fetch's length with the larger
  figure.
- Terms (HL app terms 3.1.8): bots that "exceed reasonable usage, bypass rate
  limits, cause denial-of-service" are barred; the API itself is not mentioned.

### 2.5 The delay a follower could reach

**What the docs state about lag.** Nothing for reading: no figure for how long
after a block a fill shows on `userFills` or the WebSocket. What they state:

- HyperBFT, "optimized for end-to-end latency"; for an order from a co-located
  client "median 0.2 seconds and 99th percentile 0.9 seconds" end to end
  (hypercore/overview, edited 2026-06-05). A cancel or post-only order "can show
  ~380ms end-to-end latency"; the commit usually takes 2 blocks (optimizing-latency,
  edited 2026-11-12).
- Streams run per block ("pushed on each block"; "bbo ... sent only if the bbo
  changes on a block"). When a fill is pushed is not stated; that it follows
  the block's commit is my inference.
- The lowest read latency is a node the follower runs (32 cores, 128 GB, 500
  MB/s disk), which gets 70–150 ms earlier still with `split_client_blocks`
  (optimizing-latency page). Out of scope for a watch-only tool on one PC.
- The project's own measurement of a keyless poll, on Polymarket Perps: a fill
  showed a median 3.96 s after its stamp with a 5 s poll (external-apis, R1-API,
  2026-11-06). The two venues' lags are not the same thing; no Hyperliquid read
  lag has been measured by this project.

**The delay a follower could reach, as a range with reasons.** Two parts: the
tool's detection time, from the limits above (arithmetic, not measured), and the
owner's own reaction, which no document gives.

| Way of watching | Accounts | Detection (the tool's side) | Why |
|---|---|---|---|
| WebSocket `userFills` | up to 10 | **about 1–3 s** | block-time push; "median 0.2 s" for a commit; client, network and the Windows toast add a little (assumed) |
| WebSocket `trades` per coin, filtered on `users` | the whole venue, if the feed carries the field | about 1–3 s | same push; 1,000 subscriptions; **unverified** |
| Poll `clearinghouseState`, then read fills on a change | 50 | **average about 5–10 s**, worst about 20 s | weight 2: 300 reads a minute at half budget is one read of each of 50 every 10 s; each change costs one weight-20 read |
| Poll `userFillsByTime` | 28 / 50 | **average 30 / 53 s**, worst 60 / 107 s | 28 reads a minute at half budget |
| Poll `userFillsByTime`, full budget | 50 | average about 25 s | 1,200 / 21 = 57 reads a minute |

- **The owner's step is on top of detection:** reading the alert, deciding,
  and placing an order by hand (the tool never trades, Iron Rule 1). Its
  speed is the owner's; the docs give only the order's own 0.2 s (co-located).
  An automated follower could be faster; it is outside this project's rules.
- **So the whole delay of a manual follower** is the detection time plus the
  owner's step: **about 10 s at the very best (a live alert and a prepared
  order), more usually tens of seconds, and minutes if the alert is seen late.**
  The 10 s is my estimate, not a fact.
- **R8's frozen delay, 62–95 s** (rules.md R4), sits inside the manual range,
  a little to the slow side of a watched alert and well inside a polled one.
  It is a fair deciding line for a manual follower; faster values are
  "beside".

---

## 3. Hyperliquid's own ways of following

Facts only; the tool never moves money (Iron Rule 1).

### 3.1 Vaults

Sources: `.../hypercore/vaults` (edited 2026-06-05), `protocol-vaults`,
`for-vault-leaders-legacy`, `for-vault-depositors-legacy` (all edited
2026-08-17), `hypercore-vaults-legacy` (edited 2026-02-26); app page
`app.hyperliquid.xyz/vaults` (public view, no wallet) read 2026-11-25.

- **What a vault is.** A depositor's money is traded by the vault's leader; "By
  depositing, you earn a share of the profits, or losses, of the vault ... to
  get exposure to their trading approach". The docs now call the 2023 design
  "legacy": a new design on the HyperEVM lets builders create and tokenize
  vaults with custom accounting, and the legacy ones "do not support HIP-3 or
  spot trading". The legacy vaults are the ones listed on the app.
- **Who leads.** Anyone can create a vault: a name and description (unchangeable),
  a minimum 100 USDC deposit, and a 10,000 USDC creation fee; the leader must
  hold at least 5% of the vault. A leader can run a vault on a strategy, a person
  or a bot ("managed by an individual trader or automated by a market maker").
- **The profit share:** "Vault owners receive 10% of the total profits.
  Protocol vaults do not have any fees or profit share." The depositors'
  page's example: 100 USDC put into a 900 USDC vault, the vault doubles, and the
  depositor withdraws 200 USDC "less 10 USDC (10% profit share to the leader)",
  190 USDC.
- **Lock-up:** "HLP has a lock-up period of 4 days. User vaults have a lock-up
  period of 1 day." Withdrawal: the depositor withdraws at the vault's current
  value; if the margin is short the vault's open orders are cancelled, then "20%
  of positions are automatically closed" until the withdrawal fits (a leader can
  set the vault to close positions proportionally instead).
- **What a vault can trade:** the main (validator-operated) perps; **not spot or
  HIP-3 perps**.
- **What is public about a vault** (docs `vaultDetails` example; app page):
  name, description, leader's address, **portfolio histories (account value, PnL,
  volume) for day, week, month, all time, and perps-only**, APR, the **list of
  depositors with their equity, PnL, all-time PnL, days following, entry time
  and lock-up end**, the leader's share and commission, whether deposits are
  open, and a parent/child link for HLP. The app page shows the vault's open
  positions, trade history, funding history and deposits and withdrawals, and
  "Depositors (100+)". The vault is an ordinary address for `userFills`; the
  record already read HLP's children that way (external-apis, 2026-11-13).
- **Size, 2026-11-25 ~13:00Z (app, public view):** 3,032 vaults, $219,555,874
  locked. HLP: leader `0x677d...84e7`, $152.5M, APR 15.96%, age 1,300 days. Top
  user vaults by locked value: ten with $1.9M–$10.2M and APRs from -78% to
  +503% (one number each, one day; shown as the page shows them).
- **A copy-trading vault exists on the venue (third party):** "Hyperdash Vault
  #1" (`0x4078...be9e`), description "tracks the positions of a few top
  Hyperliquid leaderboard traders ... Create your own copytrading vault on
  hyperdash.info"; on 2026-11-25 it showed $0 locked, "Depositors (100+)", no
  open positions. A vault is a way a person follows a *vault's* trades by design;
  it does not copy an arbitrary trader.
- **For COPY-H:** a vault's depositors follow only a trader who runs a vault.
  A vault's trades are on its own address; the leader's personal account is
  separate. It does not apply to the ~13,900 accounts MAIN would choose.

### 3.2 Anything else the venue offers

- **No copy-trading feature was found in the docs or the app.** The docs' index
  (`llms.txt`, 2026-11-25) lists trading, vaults, sub-accounts, builder codes,
  referrals and points but no copy trading; the app's menu is Trade, Outcomes,
  Portfolio, Earn, Vaults, Staking, Referrals, Leaderboard, Explorer,
  Sub-Accounts, API, Builder Codes, Multi-Sig, Points, Funding Comparison,
  Announcements, Stats (2026-11-25). A web search of the two official domains
  for "copy trading" found only the vault pages.
- **The app's leaderboard** (`app.hyperliquid.xyz/leaderboard`, 2026-11-25): a
  30-day board of 46,513 rows with Trader (address or a name), Account Value,
  PNL, ROI, Volume; "Excludes accounts with less than 100k USDC account value
  and less than 10M USDC trading volume"; ROI = PNL / max(100, starting account
  value + maximum net deposits). The owner has said leaderboards "don't have
  sense" for v1 (decisions 2026-11-25); this is a fact only.
- **Builder codes and third-party front ends** can add their own copy features
  (Hyperdash above); they are third parties' products and terms, not read here.

---

## 4. The venues the owner named, on copying

### 4.1 Finotive

Sources: `help.finotivefunding.com` articles (no date shown on any), the terms at
`finotivefunding.com/terms-and-conditions` (121,616 characters, no date shown;
footer "(c) Finotive Funding 2026"), `finotivefunding.com/trading-symbols`;
all read 2026-11-25 12:57–12:59Z.

**The rule (re-verified, word for word):**
> "No. Copying trades from third-party accounts, shared master accounts, signal
> providers, account managers, challenge-passing services, or third-party
> trading groups is prohibited. If you cannot prove ownership and control of the
> strategy, master account, EA, or copier setup, Finotive may close the account
> and reject Reward Payments." (help article 955, "Related Terms: Section 7.10")

- **Terms 7.10:** a trader may copy the trader's own trades between the trader's
  own accounts; prohibited: "copying trades from third-party accounts or shared
  master accounts; using signal providers, account managers, challenge-passing
  services, or third-party trading groups; allowing any external person or
  service to direct trading". Failing to prove "ownership and control" may end in
  account closure and Reward Payment rejection. Terms 7.2 repeats the list;
  terms 7.18 (Account Co-ordination) bars copying positions between users where
  more than 80% of positions are copied across at least 5 trades.
- Same as the record (help 955 and terms 7.10, read 2026-11-12), including the
  consequence. The other figures of the record also hold (20% of profit under 2
  minutes, 7.14; the 21:00–22:59Z window, 7.17; crypto leverage 1:10; the
  drawdown ranges). Some older help articles still show a replaced rule (help
  936: a scalping condition at 40% of trades under 120 seconds); help 1117 says
  those rules were merged, and the terms' text (7.14) is the current one.
- **What the rule does not say:** whether watching a public account and trading
  the same moves by hand counts as "copying trades from third-party accounts".
  By the plain words it does.

**What Finotive is.** "All accounts provided by Finotive Funding are demo,
simulated, notional, and non-executable accounts. Trading activity ... is not
placed into live financial markets" (terms 1.3). It is "not a brokerage" (6.1);
the owner's money would come only as Reward Payments for simulated results
(terms 10.4: an initial 80% Reward Split for Pro accounts). **So a copying "yes" has no use
there by its own terms and nothing there is real-money execution.**

**Crypto instruments** (the Crypto tab of the symbols page, 123 tickers, read
2026-11-25 ~12:58Z):
AAVUSD ADAUSD ALGUSD ALIUSD ANKUSD APEUSD APTUSD ARWUSD ATMUSD AVAUSD AXSUSD
BARUSD BATUSD BCH-, BNB-, BTC-, ETH-, LTC- crosses (AUD CAD EUR GBP JPY NZD USD;
BTC also CHF) CAKUSD CELUSD CEOUSD CHRUSD CHZUSD CNEUSD COMUSD COTUSD CRVUSD
CTSUSD DOGUSD DOTUSD DSHUSD DYDUSD EGLUSD ENJUSD EOSUSD ETCUSD FETUSD FILUSD
FLWUSD FTMUSD GALUSD GMTUSD GRTUSD ICPUSD IMXUSD INCUSD IOSUSD IOTUSD KAVUSD
KNCUSD KSMUSD LNKUSD LPTUSD LRCUSD MANUSD MKRUSD MTCUSD NEOUSD NERUSD OMGUSD
ONEUSD ONTUSD PEPUSD QTMUSD RNDUSD RSRUSD RVNUSD SANUSD SHBUSD SKLUSD SNXUSD
SOLUSD STOUSD SUSUSD SXPUSD TETUSD TONUSD TRXUSD UNIUSD VECUSD WOOUSD XEMUSD
XLMUSD XMRUSD XRPEUR XRPUSD XTZUSD YFIUSD ZECUSD ZENUSD ZILUSD ZRXUSD.
Tickers are three letters plus a quote; the page gives no full names.
Single stocks and indices are separate tabs (not read).

**Costs on that page (a live ticker; one snapshot, 2026-11-25 ~12:58Z):**
- **Commission:** crypto **0.06%** for Challenge and Instant accounts, **0.045%**
  for Pro (consistent with terms 10.4, "25% lower"). The page does not say
  whether it is per side or per round turn. Forex is $5 a lot (Pro $4).
- **Spread:** a column in points, from the displayed bid and ask for a few
  coins: BTCUSD about 5 bps, ETHUSD 6, SOLUSD 8, XRPUSD 8, LTCUSD 9, ZECUSD 6,
  XMRUSD 6, BNBUSD 7, UNIUSD 11, AVAUSD 11, LNKUSD 15 (rounded; one moment; the
  rows move, and three showed 70 to 1,000 bps at that moment: ADAUSD, DOGUSD
  and DOTUSD, perhaps stale or thin quotes).
- **Swap or overnight fees: no figure on any page read.** The symbols page
  says "Clear, upfront swap and financing costs" without numbers; terms 6.3
  say the environment "may reflect ... spreads, commissions, slippage"; terms
  6.4 say Finotive "may amend leverage, margin, symbol availability, commissions,
  or trading conditions at any time". The 2-Step Solo account's USD 2.50 round
  turn (terms 8.8.3) is forex-only.
- **Leverage (terms 6.4):** crypto **1:10 on every programme**; FX 1:200 Instant,
  1:400 others; metals 1:15 Instant, 1:20 others; indices 1:30 Instant, 1:40
  others; 2-Step Solo is FX only.

**Hours.** Help 899: "Crypto instruments may be available on a 24/7 basis
depending on the platform and symbol availability." The symbols page shows, for
each symbol, "OPEN" and a countdown ("Close in 09:01:40" at about 12:58Z, the same
for crypto and forex rows) and no hours text; so about 22:00Z. Whether crypto
pauses at 22:00Z is not stated (the Trading Day for the rules runs 17:00:00 to
16:59:59 New York time, help 894, terms 7.4).

**Rules that bear on holding a position** (terms section 7; no date shown; read
2026-11-25):

| Topic | Rule |
|---|---|
| Weekend | Instant Funding accounts only: non-crypto positions closed before Friday 17:00 New York time, else a strike (7.7); crypto is exempt |
| News | Trading news is allowed; **news straddling** (offsetting or hedged exposure on the same or correlated instruments within 15 minutes of Red or Amber calendar events, earnings, geopolitical events) is barred (7.9) |
| Hold times | **No minimum or maximum hold time.** "High-Frequency Trading" is flagged where 20% or more of the cycle's positive realised profit comes from trades held under 120 seconds, from at least 10 closed trades (7.14; help 1117 says one HFT rule replaced the older scalping rules) |
| Number of positions or orders | **None found** (the full terms searched for "number of positions/trades/orders", "maximum number", lots); an open **notional volume limit** by account size instead: $2,500 account 5,000% ($125,000); $10,000 3,000% ($300,000); $100,000 1,250% ($1.25M); $200,000 1,000% ($2M) (7.6) |
| Drawdown | Daily 3.0–5.0% and maximum 6.0–10.0% by programme, on equity including floating losses; a breach closes the account (7.4, 7.5) |
| Concentration | Instant Funding: 60% or more of positive profit from one position is flagged (7.15) |
| Low liquidity | 20% or more of profit from trades opened and closed in 21:00–22:59 UTC is flagged (7.17) |
| Revenge trading | a new position within 60 seconds of closing a loser, or at 2× its size, is reviewed (7.13) |
| Inactivity | 30 days with no trade closes the account (7.20) |
| Strikes | five cumulative strikes close the account (7.22) |
| Reset | Finotive "reserves the right to reset trades" in heightened volatility where profit is concentrated in one symbol and direction (7.16) |
| Replication | trading that "could not realistically have been achieved ... in live market conditions" can be removed (7.25) |

**Which Hyperliquid coins are tradable at Finotive** (ticker match from the page;
the page gives no full names, so six matches by three-letter truncation are
inferred):

| Group | Coins |
|---|---|
| Majors | **BTC** (BTCUSD), **ETH** (ETHUSD), **SOL** (SOLUSD) listed |
| **Of the 38 small coins, 14 listed** | SOL, ZEC, XRP, ADA, UNI, BNB, LTC, XMR (named on the page); AAVE (AAVUSD), DOGE (DOGUSD), LINK (LNKUSD), AVAX (AVAUSD), kPEPE (PEPUSD), kSHIB (SHBUSD) (inferred from the truncated tickers) |
| **Not on the page (23)** | HYPE, PUMP, LIT, WLD, FARTCOIN, ENA, ONDO, SUI, VVV, TAO, ZRO, PONS, CASHCAT, USELESS, KAITO, ARB, LDO, XPL, VIRTUAL, JUP, ETHFI, PENDLE, MORPHO |
| Unresolved (1) | NEAR: the page lists NERUSD, which the page does not tie to NEAR |

A unit may differ (a 1,000-fold coin on Hyperliquid, `kPEPE`, is one contract
per 1,000 coins; the Finotive contract size is not on the page).

### 4.2 Binance futures

Sources: `binance.com` pages read 2026-11-25 ~12:59–13:05Z in the browser pane:
`/en/fee/futureFee` (no date), `/en/futures/trading-parameters/perpetual`, the
Terms of Use PDF behind `/en/terms`, the copy-trading FAQ, the funding FAQ.

**Copying another account's trades by hand: allowed?**
- The Terms of Use served at `binance.com/en/terms` on 2026-11-25 is a 74-page
  PDF titled "ADGM Binance Global Terms of Use (Draft - 27 Oct 2026)",
  "Effective Date: 27 October 2026" (206,973 characters read). **A search of the
  whole text for copy trading, mirror, signal, social trading, follow trades,
  automated, bot, front-run, high-frequency found nothing about following
  someone's trades.** What it has: no investment advice from Binance (43); a
  prohibited-use list (31.1): manipulation, breaking law or others' rights, and
  "Binance's Prohibited Use Policy" (a separate document, **not read**); API
  access "subject to separate API terms and our approval" (496). Other Binance
  entities may have other Terms; this is the one this page served.
- **So by that text trading on the strength of public information about someone
  else's trades is not prohibited;** this is "no clause found", not Binance's
  statement that it is allowed.
- **Binance's own Copy Trading** (FAQ published 2023-08-22, updated 2026-07-16):
  "an automated trading system" that copies Binance **lead traders'** portfolios
  (400+ USDⓈ-M contracts); a lead takes up to 30% of profit and 10% of copiers'
  fees; slippage protection defaults to 0.5% (BTCUSDT, ETHUSDT) and 1.5% (others),
  at opening only; copies fail on short margin, an unfilled limit order,
  slippage, or a position below the symbol's minimum notional; up to 20 copy
  portfolios; lead traders may use the API. **It cannot copy a Hyperliquid
  account.**

**Costs.**
- **USDⓈ-M fees** (fee page, read by eye from a screenshot; no date shown):
  USDT-margined, regular user (under $5M 30-day volume): **maker 0.0200%,
  taker 0.0500%**; paying with BNB takes 10% off (0.0180% / 0.0450%); VIP 1
  (at least $5M and 5 BNB): maker 0.0180%, taker 0.0500%. USDC and USD1
  margined shows **0.0000% maker, 0.0400% taker** for a regular user, the old
  0.0200% / 0.0500% struck through, under a banner of a promotion ("0 maker fee
  and up to 50% discounts on taker fees" on "U (United Stable)-Margined Perps",
  "during the Promotion Period", no end date in the text read). A taker round
  trip: 10.0 bps USDT-margined (9.0 with BNB), 8.0 bps on the promotion.
- **Funding** (FAQ published 2019-09-09, updated 2026-03-06): `funding =
  notional × rate`; **default every 8 hours at 00:00, 08:00, 16:00 UTC**,
  changeable for a symbol "in the event of extreme market volatility"; rate =
  premium + clamp(interest - premium, -0.05%, +0.05%) with the 8-hour interest
  0.01% (0.03% a day); no fee on funding payments. The record's earlier read of
  the fee FAQ (updated 2026-05-01) gave the same 0.02% / 0.05% for a regular
  user.
- **Spread:** not read (the page has none).

**Which Hyperliquid coins are listed there.** The trading-parameters page lists
**813 perpetuals** (767 USDT, 40 USDC, 3 USD1 and a few others, over 69 pages;
read page by page 2026-11-25).

| Group | Result by ticker |
|---|---|
| **The 38 small coins** | **37 of 38 listed** as a USDT-margined perpetual. **Not listed: CASHCAT.** `kPEPE` and `kSHIB` are `1000PEPEUSDT` and `1000SHIBUSDT`. Of the 37, 21 also have a USDC contract (SOL, ZEC, XRP, 1000PEPE, AAVE, UNI, WLD, NEAR, 1000SHIB, DOGE, ENA, SUI, ADA, BNB, KAITO, ARB, AVAX, LTC, LINK, ETHFI, HYPE) |
| Majors | BTC, ETH (also on USDC and USD1) listed |

The match is by ticker only. A ticker can name a different asset on two venues
(LIT, VVV, PONS, XPL, USELESS were not checked against the assets). The list does
not cover Hyperliquid's other ~140 main-dex coins or its HIP-3 equity markets;
a full list-against-list can be made at the build from the two dated lists.

### 4.3 Hyperliquid's own terms on watching and copying public accounts

Source: `app.hyperliquid.xyz/terms`, "Last updated on June 15, 2026" (the same
version external-apis recorded 2026-11-13), read 2026-11-25 (33,921 characters,
67 paragraphs searched).

- **Nothing on copying, following, mirroring, public data, scraping or research.**
  The only paragraph that mentions copy is 3.1.1 (copyright).
- **3.1.8, "Automated or High-Frequency Abuses":** "bots, scripts, or other
  automated methods to interact with the Interface in ways that exceed
  reasonable usage, bypass rate limits, cause denial-of-service conditions, or
  disrupt the normal functioning of Hyperliquid". Within the rate limits above
  this is not breached.
- **3.1.4:** "misuse of confidential, privileged, proprietary, or non-public
  information"; the data here is public.
- **Who may use it (1.6):** "Restricted Persons" include persons or entities in,
  incorporated in or with an office in the **United States or Ontario, Canada**,
  in sanctioned jurisdictions, and citizens of such territories. Outcome markets
  have a wider exclusion (1.7). Whether the owner is eligible is the owner's to
  check.
- **4.1:** the Interface's information is not advice. The terms govern "this
  website-hosted user interface"; they say nothing of the public API.

### 4.4 Polymarket Perps (not re-read; for the table)

The record (external-apis, read 2026-11-06): terms 4.2 bars crawlers and
scrapers of "the Site, any other Interface, or Features", and order placement is
barred in the US, Canada, Cuba, Iran, North Korea, Syria and three regions;
read-only market data is "not subject to these restrictions". Not re-read.

---

## 5. For COPY-H's plan

### 5.1 The cost per round trip to use

COPY-H-PLAN already uses **4.5 bps a leg (the base-tier taker), which the fee
page confirms** (edited 2026-08-19; read 2026-11-25). My facts:

- **Fee:** 9.0 bps a round trip taker. Never a lower tier (the plan's rule); a
  new account pays tier 0; a HIP-3 coin costs more and the plan's pool is
  main-dex only, so that does not enter.
- **Spread and impact:** the docs give none. The plan's tape-measured spread is
  the only source; the archive's books thinned through 2026 (external-apis), so
  the tape is the better source.
- **Funding:** the documented hourly rule matches `fundingHistory` and
  `asset_ctxs` `funding`; the settled value is the one to charge. Note the
  extra weight on the fetch (section 2.4): plan hours, not minutes.
- **The break-even to print beside:** the plan prints it. For the venue columns:
  Hyperliquid 9.0 bps of fees; Binance USDT-margined 10.0 bps (9.0 with BNB;
  8.0 on the USDC/USD1 promotion, whose end date is not stated); Finotive
  0.06% a side would be 12.0 bps if the page means per side (unknown); and the
  plan's own spread and funding on top for each.

### 5.2 The delay to test

- **The deciding line stays R8's 62–95 s** (FABLE-REVIEW point 9): it is
  inside a manual follower's range (section 2.5).
- **SPEED arm.** Recommended:
  **D drawn in [10 s, 30 s)** for "a follower with a live WebSocket alert and
  a prepared order", with reasons: the tool's side is 1–3 s by WebSocket
  (10 accounts), the order's own e2e is 0.2 s median, and 10 s is the
  least a human can plausibly add (an estimate). Slower values are the plan's
  DELAY+5 and DELAY+15 minutes.
- **One implementation note for SPEED:** the plan prices from a minute's mean
  trade price. A delay of 10–30 s is inside one minute, so it needs the first
  taker trade at or after t + D (the tape has millisecond times), not the
  minute's mean.
- **A follower can watch only so many accounts at that speed:** 10 by
  WebSocket per IP, or the whole venue if the `trades` feed carries `users`
  (unverified), or 50 accounts by polling positions at about 5–10 s. The plan
  says about 13,900 accounts qualify; a follower takes "a random handful". The
  tool and the owner can follow only a few; this is a limit of the follower, not
  of the test.

### 5.3 Which venue rules allow using a "yes"

| Venue | May a yes be used? | Basis |
|---|---|---|
| **Hyperliquid, own account** | **Yes by the terms read:** no clause on copying; barred only for Restricted Persons (US, Ontario, sanctioned) and for bots that exceed reasonable usage; the owner's own eligibility to be checked | terms, 2026-06-15 version |
| **Binance futures, by hand** | **No clause found against it** in the Terms of Use read (an October-2026 text titled "Draft"); the Prohibited Use Policy is unread; its Copy Trading cannot follow an outside account. **37 of the 38 small coins and BTC, ETH are listed** (by ticker). The fees are 10.0 bps taker round trip (USDT-margined) | terms, FAQ, parameter and fee pages |
| **Finotive** | **No.** The rule (help 955, terms 7.10) bars copying third-party accounts; and the accounts are simulated, with no real execution. 14 of the 38 coins and the majors are listed | help 955, terms 1.3 |
| **Hyperliquid vaults** | Only for a trader who runs a vault; leader 10% of profit; 1-day lock-up (user vaults); not for the plan's pool | vault docs |
| Polymarket Perps | by the record's terms read 2026-11-06, no clause on following; US and some others barred from order placement | external-apis, not re-read |

### 5.4 Other points for the plan

- **Vaults as a parallel line:** the plan's Question 3(b). Facts: a vault's
  performance, depositors and trades are public; the leader gets 10% of the
  profit, so a depositor's result is below the vault's. A vault's own history (APR, PnL curves) can be read
  by `vaultDetails` (weight 20). The plan can drop the vault line from its
  KEEP's use cases if the owner will not deposit; it has no bearing on the test.
- **Sub-accounts and vaults as accounts:** a trader's master and sub-accounts
  are separate addresses; a vault's fills are under the vault's address, and
  HLP's children are named (7 on 2026-11-13). The plan's pool already names
  them (point 7).
- **TWAP orders** show as many small fills about every 30 s (order types page);
  a follower reading fills sees the slices, not the parent order.

---

## 6. What is unknown

- **HL read lag:** no documented number; none measured by this project; the
  section 2.5 figures are arithmetic and docs' latencies.
- **Whether the WebSocket `trades` feed carries `users`** (the docs type says it
  does): needs one read-only probe.
- **The extra weight per 20 rows** on `userFills`-type reads, and a referral
  discount's size.
- **HL's spread and slippage in thin coins** (docs silent); each HIP-3 deployer's
  fee scale.
- **The owner's own reaction time** (the largest part of a manual delay).
- **Finotive:** whether its 0.06% is per side; swap figures; the crypto session
  (the "Close in" counter); whether manual copying counts as "copying trades from
  third-party accounts" (the plain words say so); contract sizes.
- **Binance:** the Prohibited Use Policy; the Terms the owner's own region would
  be served; the USDC/USD1 promotion's end; spread; whether a ticker is the same
  asset on both venues.
- **Dates:** Finotive's and Binance's fee and rule pages show no date (Binance's
  FAQs do).
- **Not read:** Hyperliquid's "Foundation non-validating node" page (access terms
  for the fast read), `exchange`/`signing` pages (never needed), Polymarket's
  terms again.

---

## 7. Questions, each with a recommendation

1. **One read-only live probe to turn the docs into measurements?** One WebSocket
   connection for about 5 minutes: `trades` for a few coins (does it carry
   `users`?), `userFills` for two addresses, and the delay of each fill from the
   block time to the message; a small number of keyless `info` reads. It needs
   the supervisor's or the owner's word because this brief barred any call.
   **Recommended: yes, before the SPEED arm is frozen:** a few minutes, a few
   tokens of budget, and it settles the largest unknown here.
2. **SPEED arm as D in [10 s, 30 s)?** **Recommended: yes**, priced on the tape's
   first taker trade at or after t + D, with the probe's number replacing the
   estimate if it finds one.
3. **Tell the owner plainly at the talk that Finotive accounts are simulated
   and that its rule bars copying a third party?** **Recommended: yes,** one line
   each; the plan's (d) already excludes it; the new fact is the simulation.
4. **A venue column for Binance in the look's report: share of MAIN's copies in
   coins Binance lists?** **Recommended: yes,** computed from the two dated
   lists at the look, so a "yes" shows what share of it could be acted on there;
   37 of the 38 small coins are listed today.
5. **The funding fetch's length:** plan it as up to 8 hours at half budget
   (section 2.4) and run it in several short sessions with a safety stop.
   **Recommended: yes.**
6. **Which Binance entity would the owner use?** Other entities may have other
   Terms, and the one served here is an ADGM text titled "Draft". **Recommended:** the
   owner reads their own region's Terms before acting; the supervisor does not
   decide it.

---

## Sources and dates (all read 2026-11-25; "edited" is the docs page's own stamp)

| Page | Edited / dated | Used for |
|---|---|---|
| `hyperliquid.gitbook.io/hyperliquid-docs/trading/fees` | 2026-08-19T06:07Z | fee tiers, discounts, HIP-3 formula |
| `.../trading/funding` | 2026-10-31T10:49Z | funding |
| `.../trading/contract-specifications` | 2026-05-07T07:50Z | impact notionals, order caps |
| `.../trading/order-types` | 2026-10-31T04:15Z | TWAP, market orders |
| `.../trading/builder-codes` | 2026-05-23T12:24Z | builder fee cap |
| `.../for-developers/api/rate-limits-and-user-limits` | 2026-11-12T03:04Z | limits and weights |
| `.../for-developers/api/optimizing-latency` | 2026-11-12T03:04Z | latency |
| `.../for-developers/api/info-endpoint` and `/perpetuals` | 2026-10-01T23:00Z, 23:03Z | info requests |
| `.../for-developers/api/websocket`, `/subscriptions`, `/timeouts-and-heartbeats` | 2026-10-16T18:15Z, 2026-11-10T19:36Z, 2026-10-16T18:17Z | channels, fills type |
| `.../for-developers/api/activation-gas-fee` | 2026-06-05T08:53Z | activation |
| `.../hypercore/overview` | 2026-06-05T09:32Z | latency |
| `.../hypercore/vaults` and four subpages | 2026-06-05; 2026-08-17 (three); 2026-02-26 | vaults |
| `.../historical-data` | 2026-05-20T08:41Z | S3 archive, 10,000-fill cap context |
| `app.hyperliquid.xyz/terms` | "Last updated on June 15, 2026" | HL terms |
| `app.hyperliquid.xyz/vaults`, `/vaults/0x4078...`, `/leaderboard` | live pages | vault and leaderboard sizes |
| `help.finotivefunding.com` articles 893–900, 926–927, 932, 936–938, 950–953, 955, 1117 | none shown | rules |
| `finotivefunding.com/terms-and-conditions`, `/trading-symbols` | none shown | rule, leverage, symbols, costs |
| `binance.com/en/fee/futureFee`, `/en/futures/trading-parameters/perpetual` | none shown | fees, symbol list |
| `binance.com/en/support/faq/detail/6ed0995daf0b42d5816beaf1e31ca09d` | updated 2026-07-16 | copy trading |
| `binance.com/en/support/faq/detail/360033525031` | updated 2026-03-06 | funding |
| the PDF behind `binance.com/en/terms` | effective 2026-10-27 (title: Draft) | terms |

*This is research, not advice on what to trade.*
