# R5-TOOLS — what already exists, and what we do differently

Research report, 2026-11-06 (UTC), by R5-TOOLS (Sonnet 5.5, xhigh). Web reading
only: no Polymarket API call, no sign-up, no login, no download. Point-in-time
evidence; it decides nothing (docs/reviews/README.md). Every source below was
read on 2026-11-06 unless another date is given.

**How to read the evidence grades.** Each source is one of: **[P]** the
vendor's, exchange's, or paper's own page, read; **[S]** a search-result
snippet or a retelling, not the page itself; **[V]** a vendor or a vendor's
competitor describing a product (marketing — stated each time); **[X]** the
page could not be read (blocked, empty, or timed out). My page-reading tool
returns a small model's summary of a page, so I kept formulas, numbers and
names it returned and paraphrased the rest; nothing here is a long quotation.

Plain verdict first:

1. **No tracker for Polymarket Perps was found.** Every tracker, bot and
   leaderboard site found covers Polymarket's prediction markets or other
   exchanges (mostly Hyperliquid). Perps launched on 2026-09-03; the field is
   two months old.
2. **Of the Hyperliquid tools I could read, alerts for followed wallets are
   plan-gated (Cielo) or feed-only (Hyperdash)**, none publishes an alert
   delay, and only Hyperdash publishes a trader-style filter (by average trade
   duration, with no threshold for "algo"). Copin, Hypurrscan and Hyperliquid's
   own leaderboard could not be read. *(C3: the first version said "mostly
   paid or closed … label algorithms in one place only", which claimed more
   than I read.)*
3. **The evidence on copying is poor for followers:** the one peer-reviewed
   paper I could read that models costs (Dorfleitner et al., 2018) found that
   picking the traders with the highest accumulated returns loses heavily and
   that no strategy shows a positive abnormal return (four-factor alpha)
   after costs. The field measurements (three, not peer-reviewed) show
   followers doing worse than leaders and than holding, but Yieldfund's
   aggregate follower PnL was positive (+709,045 USDT, 48.5% of outcomes
   profitable): the gap is leader against follower, not a net loss. *(C3: the
   first version said "no profitable follow-the-top strategy after costs …
   point the same way", which overstated both.)*
4. **Published bot/market-maker classifiers exist, but they lean on order
   data (time-in-force, builder tags) that Polymarket's public fills do not
   carry.** Features computable from fills alone are fewer, and R2 must prove
   them.
5. **Polymarket's own competitions and liquidity rewards pay for volume and
   market making** — a fact that bends both the leaderboard and the style
   labels, and that the founding docs do not yet mention.

---

## 1. The answers

### Q1. Polymarket Perps itself

**Answer.** Perps opened to the public on **2026-09-03** with 10 markets,
growing to 67 within hours; it was announced on 2026-04-21 with an
early-access list, and the API's changelog starts on 2026-06-08, so the API
existed in early access about three months before the public launch. **I found
no third-party tracker, dashboard or community tool built for Polymarket Perps
traders.**

Evidence:

- Launch date. Decrypt, "Polymarket Launches Crypto Perpetual Futures With Up
  to 20x Leverage", 2026-09-04 (decrypt.co/377483/polymarket-crypto-perpetual-futures) [P]:
  launched 2026-09-03, 10 markets, 67 within hours, leverage 20x on crypto, the
  S&P 500, oil, gold, silver, and 10x on single stocks. Polymarket's own
  newsletter *The Oracle*, "INSIDE POLYMARKET PERPS", 2026-09-09
  (news.polymarket.com/p/inside-polymarket-perps) [P]: confirms "September 3",
  states starting fees of 0.04% taker and 0.0125% maker, that a leaderboard
  of top traders exists, and that each account's positions and trade history
  are viewable on its public profile.
- Announcement on 2026-04-21 and the early-access list: several outlets via a
  search summary [S]; the X post itself was not read.
- Changelog (docs.polymarket.com/changelog/perps, read 2026-11-06) [P]:
  earliest entry 2026-06-08; 33 entries from June to 2026-11-05, i.e.
  the API changes more than once a week on average (see section 6).
- Polymarket's own surfaces that already follow traders: the leaderboard
  (public API, our founding doc), the public account profile (newsletter), and
  a **Competitions tab with its own live leaderboard** (docs page
  docs.polymarket.com/perps/trading-competitions [P]; API
  `GET /v1/info/competition/leaderboard`, weight 1, cached 1 s, the spec
  declares no security requirement but the page does not call it public
  (C5: first version said "keyless"), [P]
  docs.polymarket.com/api-reference/get-trading-competition-leaderboard.md).
- What third parties exist near it, none confirmed for perps: Struct's open
  explorer, Polynyx, PMWallets (clusters a signer and its proxy wallet into
  one entity; forward-only PnL; win rate with a confidence interval),
  PolymarketDash, PolyWallet (Telegram alerts for up to 20 wallets),
  PolyAlertHub (opens, adds, trims, exits), Predicts.guru — all [S] from
  search results and all aimed at prediction markets. Predicting Top
  (polymart.app/predicting-top) says it covers Polymarket, Kalshi and
  Hyperliquid [S]; whether "Polymarket" there includes perps is unconfirmed.
  Cielo's Hyperliquid docs mention Polymarket wallets counting toward its
  EVM tracking limit [P] (prediction-market wallets).
- One page contradicts the newsletter: polymarket101.com, "How to Look Up Any
  Polymarket Trader's Positions, Trades and PnL" (undated) [P] says the perps
  leaderboard shows PnL but not individual positions, that perps accounts are
  keyed to the **signer address** rather than the smart wallet, and that perps
  are not visible on the events profile. Our verified portfolio and fills
  endpoints (external-apis) settle the data question; the page is about the
  web leaderboard. The signer-address point matters: the same person can be
  two addresses on the two boards.
- Scale claims, unverified: one search summary put perps open interest near
  $26.4M (about 0.3% of Hyperliquid's) and launch-day 24-hour volume near
  $48M, from a source the summary did not name, in an article it described as
  102 days old [S]. **[Corrected by the Final review, 2026-11-06, C4. The
  first version named "a KuCoin flash-news piece"; the summary never said which
  article, so the attribution was my guess and is withdrawn. "102 days" before
  today is about late July, before the 2026-09-03 launch, so the age is
  inconsistent with launch-day figures.]** Do not use until measured (the
  exchange-stats route, added 2026-09-02, is public per the changelog; R1
  measures it).

### Q2. Trackers for exchanges with public accounts

**Answer.** Hyperliquid has a dozen tools; they split into (a) discovery and
leaderboards (Hyperdash, HyperTracker, Copin, Nansen), (b) whale and position
scanners (CoinGlass, Arkham, Hypurrscan), (c) followed-wallet alert bots
(Cielo, Copin's bot, SuperX and similar), and (d) data feeds (Hydromancer,
ASXN, HyperTracker's API). **Of the tools I could read, only Hyperdash
publishes a trader-style filter, and it publishes no threshold for "algo"**
(C3: first version said "Only Hyperdash"; Copin, Hypurrscan and Hyperliquid's
own leaderboard were unreadable). Other exchanges are thin.

| Tool | What it shows per trader | Leaderboard | Alerts and delay | Price | Labels for bots, MMs, vaults |
|---|---|---|---|---|---|
| **Hyperdash** (acquired by pvp.trade per a competitor's page [V]); docs.hyperdash.com [P] | PnL, rPnL, uPnL, ROI, account value, volume, trades, win rate, Sharpe, max drawdown, leverage, margin use, traded assets, a 0–100 "copy score" (formula unpublished; grey = not enough history) | Top 100 per market and timeframe (24H, 7D, 30D, YTD, All; opens on 30D); filters: asset, account value, win rate, style | Followed wallets ("Track", groups, aliases, shareable read-only groups) appear in a live feed with filters (group, direction, open/close, notional) — **not** in the inbox; no delay figure. A public Telegram channel ("Flows") is market-wide: liquidations from $50,000, OI/volume/funding surges with a 30-minute cooldown per market, daily digest 09:00 ET; posted when it triggers by its own account, no number | Free dashboard; execution fees on trades [V]; builder fee up to 0.05% on copy trades [P] | Style filter (Algo, Scalp, Intraday, Swing, Position); styles by **average trade duration**: Scalp under 15 min, Intraday 15 min–6 h, Swing 6 h–2 weeks, Position over 2 weeks; "Algo" has no threshold; copying an account tagged algorithmic raises a warning. Vault and market-maker handling not stated |
| **HyperTracker** (CoinMarketMan); docs.coinmarketman.com [P] | Wallet stats, fills, closed trades, equity history; 16 cohorts (blog: eight by perp equity, eight by all-time PnL [V]) | Multi-timeframe boards [V] | Snapshots about every 5–8 minutes (docs [P]); webhooks on every tier; WebSocket on higher tiers | Docs list Free, $179, $399, $799, $1,999 a month; **the same vendor's March 2026 blog prints $179, $499, $1,159, $2,399** — its own pages disagree, prices move | Cohorts by size and PnL only; no bot/MM/vault label |
| **CoinGlass** Hyperliquid page [P] (title "Hyperliquid Whale Tracker (Real-Time)") | Address, side, position, unrealised PnL %, entry and liquidation price, margin, funding paid, entry time | A ranked wallet table with long/short filters; "Show Favorites" | The page states no threshold, refresh or tier. A competitor's blog says whale alerts over $1M and a refresh of 1 minute or less, plans $29–$699 a month [V] | Free pages; paid API | None; whales are by size |
| **Hypurrscan** | Page is script-rendered; only the title "HypurrScan Beta" was readable [X]. Secondary guides call it the raw record for one address [V] | — | — | Free | — |
| **Nansen** | Smart-money labels for Hyperliquid ("Perps Smart Money", 2025-09-09 changelog [P]); leaderboard endpoint with total PnL, ROI, account value (docs.nansen.ai use case 2 [P]; example filters PnL ≥ 10,000, ROI ≥ 20, account value ≥ 50,000, labels "Fund" and "Smart Trader") | API leaderboard | "Consistent Perps Winners" = highest win rate and risk management, **no criteria published**; the copy-trading guide has no warning about bots, market makers or survivorship | Pro $49–$69 a month in a competitor's table [V]; other sources disagree [S] | Labels exist; method not published |
| **Arkham** | Since 2026-07: open perps positions of an address, unrealised PnL "in real time", side, size, entry and mark price, leverage, distance to liquidation (info.arkm.com research, 2026-07-31 [P]) | No | The page does not mention alerts | Core free [V] | Entity and KOL labels, not style labels |
| **Cielo** docs [P] | Per-wallet alerts | No | Fills (open, increase, close, liquidation, reversal), TWAP start/end, within 2% of liquidation, deposits/withdrawals; eight filters per wallet (direction, size, coin, action type …); Telegram, Discord, feed; **Pro and Whale plans only**; no latency claim | Paid | None |
| **Copin** (docs.copin.io) | Profile with percentile radar, PnL chart, positions, frequency; covers GMX v1/v2, Kwenta, Polynomial, Hyperliquid (600,000+ traders reported) | Weekly/monthly boards | Alert bot to Telegram or webhook | Free tier caps copy size at $200,000 (review) | **Every docs page returned 403 to automated reading [X]**; the above is search-snippet level [S]. No bot filter found |
| **Hydromancer, ASXN/HyperScreener** [V] | Raw feeds: order book streams, builder fills; ASXN daily, free API | — | — | $300–$2,500 a month; ASXN free | None |
| **dYdX v4** | No official all-trader board found; a third-party site ranks by total PnL incl. unrealised, refreshed every 2 hours [S]; trading leagues and "ROI Rumble" are competitions | — | — | — | — |
| **GMX** | Copin is the main tracker found; an earlier GMX copy-trading effort (Tradao) shipped a Telegram bot per its grant report [S] | — | — | — | — |
| **Drift** | No per-trader board found; subaccounts are readable through the SDK [S]; DefiLlama records a roughly $295M exploit on 2026-04-01 [S] | — | — | — | — |
| **Aevo** | Wash-trading allegations in March 2024 during airdrop farming (CoinDesk, 2024-03-15 [S]); Aevo said wash volume is ineligible and deducted retroactively | A "permanent" rewards leaderboard (a social post [S]) | — | — | — |

Other findings that matter:

- Hyperliquid's own leaderboard page could not be read (script-rendered) [X],
  and its official docs do not describe how it ranks or whether vaults are
  excluded. **Unknown.** HLP trades through child vaults, so its activity
  shows under other addresses (Bitquery docs [S]).
- The Hyperdash docs index lists a "Data" product (API, MCP server) with an
  OpenAPI file, but the file I read is a sample "plants" API, not trader
  data [P]. A competitor's page says Hyperdash has no public API [V]. Treat
  as unsettled.
- **29% of the top 150 Hyperliquid leaderboard accounts use subaccounts**
  (ShieldTX, via The Block, 2026-10-28 [P]; vendor study). One person can sit
  on a board several times, or hide behind subaccounts.
- A docs site (HyperTracker's) carries a block of text addressed to AI
  agents asking them to make web requests. It was ignored: page text is data
  (CLAUDE.md, instruction boundary). Our own agents should expect this.

### Q3. Copy-trading platforms: metrics, definitions, and how the numbers mislead

**Answer.** The platforms show the same short list — ROI, PnL, win rate,
maximum drawdown, Sharpe, followers' PnL — and define ROI, win rate and
drawdown differently. The most important common point: **ROI is divided by a
peak-capital base so that deposits do not fake or erase returns**, and
Polymarket's own leaderboard ROI follows the same idea.

Definitions found (page read unless marked):

- **Binance Futures copy trading**, "Portfolio Performance Indicators in
  Binance Futures Copy Trading", updated 2026-07-15 [P]: ROI (new) = PnL ÷
  MaxBaseBalance, where the base is the initial deposit plus net deposits,
  refreshed every 10 minutes; the old ROI used a net-asset-value method that
  adjusted for deposits and withdrawals. Binance moved to the new method
  (existing portfolios refreshed from 2025-11-12 [S]) to stop frequent
  transfers from eroding ROI. PnL is realised plus unrealised; total PnL =
  margin balance − initial balance − deposits + withdrawals. Max drawdown =
  largest peak-to-trough fall of the account curve in a period. **Win rate =
  profitable closed positions ÷ all positions.** The page itself says ROI has
  limits (it ignores time). The Sharpe formula is an image I could not read.
  The lead-trader comparison page (updated 2026-02-20 [P]) lists the metric
  names, including "Historical Copier PNL", "Mock Copiers" and "Closed
  Portfolios" — a platform showing closed portfolios is already admitting
  that abandoned accounts exist.
- **Bybit** (help-centre articles; my direct reads timed out three times, so
  this is from search snippets of those articles [S]): ROI = total profit ÷
  (prior equity + new deposits), computed daily at 00:00 UTC; **win rate
  counts open positions that are currently in profit as wins**; max drawdown
  is the largest unrealised loss in the last 30 days; to enter the leaderboard
  a trader needs 30-day drawdown at or below 40% (this gate appears in a
  snippet of Bybit's rules) and, per a snippet whose source may be a
  third-party guide rather than Bybit, positive followers' PnL over 7 days
  (C6: first version gave both as Bybit's rules); followers' PnL refreshes
  daily at 03:00 UTC; a "balanced"
  category scores 30-day ROI, drawdown, volatility, Sharpe, Sortino,
  activity and balance (formula unpublished).
- **OKX**, "Copy Trading Service Terms", updated 2025-11-10 [P]: may
  disqualify a lead trader at its sole discretion; running one strategy
  through several accounts is "cross-account trading" (rank lowered,
  trades voided, account frozen); a displayed return that does not reflect
  real profit counts as inflating indicator data; past performance, risk scores
  and statistics are stated to be unreliable indicators of future results.
- **eToro** [S plus one footer line P]: risk score 1–10 from volatility/VaR,
  shown as a 7-day average because a risky trader could close positions to
  lower it; to be copied a trader must stay under a risk-score cap (6 or 7,
  sources differ). The gain formula was not found. Its footer says past
  performance of a Community Member is not a reliable indicator.
- **Bitget:** not read.
- **Polymarket Perps' own ROI** (changelog 2026-10-06 [P]): PnL ÷ the larger
  of 100 and (starting equity + largest net deposits). Hyperdash: PnL ÷
  (starting equity + peak net deposits), ranked in percent mode only above
  $1,000 of capital [P]. So three venues share the peak-capital idea; the
  floors differ ($100 vs $1,000).
- Polymarket's PnL: realised minus fees plus funding, no unrealised
  (external-apis). Hyperdash's default "Net" PnL adds the change in unrealised
  PnL; its "rPnL" matches Polymarket's. A tracker that mixes the two will
  show different numbers for the same trader.

How the numbers mislead — what is documented, and by whom:

| Distortion | Documented? |
|---|---|
| **Leader numbers vs follower numbers.** In an October 2025 hand-collected snapshot of Binance, Bybit and MEXC, 97% of leaders were profitable on their own account but only 43.6% of leaders had positive follower PnL, and 48.5% of copier outcomes ended positive; the summed follower PnL was still positive, +709,045 USDT (Binance +572,980, Bybit +346,106, MEXC −210,041), so the finding is a gap between leaders and followers, not a net loss (C3: first version left the sum out) (Yieldfund, 2025-11-24, 1,486 leaders, 100,236 outcomes, 90 days [P]; Yieldfund sells investment products; follower PnL is the platform's field, not decomposed for fees or slippage; event-weighted, not per person) | A vendor study, one 90-day window |
| **Deposits and withdrawals moving ROI** | Binance, Bybit, Hyperdash and Polymarket all document a base-capital rule; Binance says outright it changed the rule to stop transfers eroding ROI |
| **ROI on tiny accounts** | Hyperdash ranks percent only above $1,000; Polymarket floors at $100; a $100 account's ROI can still look huge. Third-party posts warn of 99% win rate on one trade (aotrading.io [S]) |
| **Losers kept open while winners are banked** | Bybit's win rate counts open winners as wins, so the number flatters open books; Binance's counts closed positions only. Hyperdash's "Trades" column says "Open" when no trade closed in the window, so the PnL came from an open position [P]. No platform page I read names this as a known trick |
| **Reset, abandoned, or cherry-picked accounts** | OKX bans multi-account use; Binance's compare page lists "Closed Portfolios"; ShieldTX's 29% subaccount figure; the Hyperliquid vault simulation below counts closed vaults on purpose |
| **Survivorship in leaderboards** | Named in vendor blogs without data [S]; handled explicitly only in the Reddit vault study (closed vaults included) and flagged as a gap in the Vultax study (its active cohort needs continued trading) |
| **Statistics that can be gamed in real time** | eToro's 7-day average risk score; OKX's "inflating indicator data" clause |
| **Competition and reward farming** | Polymarket's own: competitions the page calls "bi-weekly" without defining it (C5: I had read "every two weeks"; the page gives no schedule or length, only that each is announced a few days ahead) scored on PnL × √(boosted volume), with a $100K minimum volume, boosted markets at (for example) 3×, and $50,000 for the top 50 (first place $10,000, places 25 to 50 $250 each); wash trading, self-trading and multi-accounting disqualify all linked accounts (docs.polymarket.com/perps/trading-competitions [P]). Daily liquidity rewards: $75,000 a day split evenly across active markets, one pool per market (and a $1,000 bonus for a new market's first day); **only an account with at least 1% of maker volume over the trailing seven days qualifies**; score = maker_score^0.35 × active_liquidity_score^0.65 × uptime, maker share capped at 25%, resting orders within 20 bps of the mid counted on both sides; accounts in a "rewards entity" are counted together (docs.polymarket.com/perps/liquidity-rewards.md [P], read 2026-11-06; **corrected, C2: first graded [S] and without the 1% rule**). Aevo (2024) is the precedent for farming volume |

### Q4. Does copying pay — the evidence

**Answer.** **There is no published, peer-reviewed study of copying
Polymarket Perps or any perps-DEX leaderboard that I could find.** The
adjacent evidence, in order of weight:

*Peer-reviewed or working papers (abstract-level reads unless noted):*

1. **Dorfleitner, Fischer, Lung, Willmertinger, Stang, Dietrich**, "To follow
   or not to follow — An empirical analysis of the returns of actors on social
   trading platforms", *Quarterly Review of Economics and Finance* 70:160–171,
   2018 (ideas.repec.org abstract [P]): investing in the traders with the
   highest accumulated returns loses heavily; adding the Sharpe ratio
   to the choice helps; **no strategy shows a positive abnormal return after
   transaction costs under a four-factor model**; no wisdom-of-the-crowd effect
   (followers and invested capital do not predict returns); very active
   traders earn less. Costs modelled: transaction costs in a weekly panel. No
   second-level delay. (Data details are not on the abstract page.)
2. **Ammann and Schaub**, "Do Individual Investors Trade on Investment-related
   Internet Postings?" (working paper June 2020, as retold by Larry Swedroe,
   2021-01-02, updated 2024-11-29 [S]): a European social trading platform
   2013–14, over 2,000 portfolios, about $300M of follower replication trades;
   follower investments earned annualised alpha of −13.2% after trader
   comments and −10.6% on other days; average portfolio alpha −9.8% (median
   −2.8%); turnover about nine times a year. I read the retelling, not the
   paper.
3. **Barber, Lee, Liu and Odean**, "The Cross-Section of Speculator Skill:
   Evidence from Day Trading" (2014, via the same retelling [S]): Taiwan
   1992–2006, about 450,000 day traders, fewer than 1% consistently beat the
   market. The base-rate for "skilled leaders are rare".
4. **Apesteguia, Oechssler and Weidenholzer**, "Copy Trading", *Management
   Science* 66(12):5608–5622, 2020 (index records [S]): a lab experiment — seeing
   others' success raises risk-taking, more so with a copy button. Behaviour,
   not returns; relevant to what a "follow" button does to the owner.
5. **Pan, Altshuler and Pentland**, "Decoding Social Influence and the Wisdom
   of the Crowd in Financial Trading Network", IEEE SocialCom 2012 (abstract
   via MIT DSpace snippet [S]; the PDF was unreadable): an online FX brokerage
   with copying; social trades outperform individual trades; reputation is not
   fully explained by performance. Positive, but 2012, one broker, and I could
   not read the cost treatment.
6. **Zhai**, "Public Trader Identity: Adverse Selection and Return
   Predictability", arXiv 2608.04373, submitted 2026-08-05 (v3 2026-08-23)
   [P]: on a decentralised exchange that publishes wallets (147,113 wallets;
   $84.3 billion of taker volume; page does not name the venue, a search
   summary says Hyperliquid), wallet "informativeness" persists — rank
   correlation 0.52 between adjacent ten-day windows — and adding top wallets'
   activity lifts out-of-sample R² for **one-second** returns to 12.31% (a
   13.2% relative gain, t = 9.2), 1.6 times the gain of the best of **200
   activity-matched placebo groups**. It is not a
   follower-profit study: no costs, no delay. It tells us the good wallets are
   real *and fast*, which is the opposite of what a minute-late follower can
   use. Its placebo design is the right baseline idea for R3.
7. **Barone and Lillo**, "Trading in the Sunshine or in the Shade: Market
   Impact and Adverse Selection on Hyperliquid", arXiv 2606.15715v1, 2026-06-14
   [P]: 201 perps, 641 million fills; useful for how to group child fills
   (section 1, Q5), not about copying.

*Field measurements (not peer-reviewed; read and graded):*

8. **ShieldTX / Avail**, via The Block, 2026-10-28 [P; vendor]: over 30 days,
   332,317 Hyperliquid wallets; seven traders drawn at random from the top
   100, 25 apparent copiers each; a copier = same coin and direction within
   60 seconds at least ten times; **copying added a median 63 basis points
   per trade** to the copied trade's execution cost. Vendor-made (it sells a
   privacy tool against copiers), methodology not published, tiny sample.
9. **A Reddit r/CryptoCurrency analysis** (user Mr_Hodlerr, republished by
   CoinSpectator 2026-11-03 [P]; author's full report unread): all 9,470
   Hyperliquid copy-trading vaults including closed ones, 23 monthly start
   dates July 2024–May 2026, results net of the leader's 10% profit share.
   Median after six months from $10,000: always switching to the monthly #1
   vault **$237**; the top ten re-picked monthly $4,611; the top ten never
   switched $7,758; the ten biggest $9,759; a 50/50 BTC–ETH hold $10,316. One
   user's work, overlapping windows, follower statistics for those still
   invested only, fees/slippage/funding not described. **Its design is worth
   copying** — every run uses only information available at the start date —
   but not its numbers.
10. **Yieldfund** (item above in Q3): leaders 97% profitable, leaders with
    profitable followers 43.6%; the summed follower PnL was positive
    (+709,045 USDT; Binance and Bybit positive, MEXC −210,041) (C3: sum added).
11. **Vultax Research**, 2026-09-11, updated 2026-10-28 [P; vendor, AI-assisted
    per the page]: Polymarket *prediction-market* wallets: the top 1% of
    winning wallets took 43.9% of realised gains; across all wallets 41–51% of
    profitable months were followed by another; in an *active* cohort (at least
    ten trades in both months, 184 wallets) 124 of 137 June winners (90.5%) won
    again in July, Spearman 0.83. The page itself notes the active cohort
    requires continued trading (survivorship) and fees are unstated. Read the
    41–51% as the honest base rate and the 90.5% as the optimistic
    conditional one.
12. **polymarket-lab F9** (our decisions, 2026-11-06): 660 wallets' entries
    predicted 1–24 hour moves no better than random trades in the same markets.

*What delay, slippage and costs were modelled.* Dorfleitner: transaction costs
only, weekly returns. Ammann–Schaub: replication trades with the platform's
spreads. ShieldTX: only measured, at a 60-second window. The vault study:
profit share, nothing else. **No source models a polled-alert delay of tens of
seconds to minutes with fees and funding — which is exactly what this
project's paper-follow log does (Iron Rule 4).** *Baselines:* four-factor
alpha; buy-and-hold BTC/ETH; 200 placebo cohorts; "random trades in the same
markets" (our own F9). The owner's "random baseline" has precedent in two of the four (Zhai's
placebo groups and our own F9).

*Do leaderboard leaders stay on top?* Nothing peer-reviewed for crypto
leaderboards. Zhai (0.52 rank correlation of wallet toxicity) and Vultax
(41–51% repeat rate) are the only numbers, both on different measures.
Bitget's academy page says fewer than 15% of top monthly performers keep
similar rankings but cites no study [S]; do not use it.

### Q5. Telling algorithms and market makers from directional traders

**Answer.** Four published or semi-published approaches exist. **None uses
only what Polymarket's public fills carry**, and the only published numeric
thresholds are Hyperdash's duration bands and Arrakis's order-type gates.

| Method (source) | Features and thresholds | Usable on Polymarket fills? |
|---|---|---|
| **Hyperdash style by average trade duration** (docs.hyperdash.com portfolio-analytics [P]) | Scalp < 15 min; Intraday 15 min–6 h; Swing 6 h–2 weeks; Position > 2 weeks; "Algorithmic" listed with no rule | Yes: holding time per position cycle (previous_size and side give opens and closes) |
| **Arrakis Finance, trade.xyz study** (arrakis.finance/blog/trade-xyz, 10–31 Mar 2026, 79,622 wallets [P; industry research]) — a first-match waterfall: **Market maker** = ≥ 80% post-only orders and ≥ 1,000 orders; **arbitrage bot** = ≥ 90% immediate-or-cancel, no front-end order, no builder tag, ≥ 10 orders; **retail** = any front-end market order or a paid builder tag; **airdrop farmer** = exactly 2 fills with the bot profile; else unclassified. Result: market makers were 0.46% of wallets and 63% of volume | order time-in-force flags, front-end flag, builder tags | **No time-in-force on public fills** (external-apis). Maker/taker is available (`taker`). Fills also carry `builder_fee` since 2026-09-27 (changelog [P]) — whether it marks front-end use is untested |
| **Arrakis, HIP-3 study** (byline 2026-04-08 [P]) | Market maker: cancel fraction of order-book changes (needs book data) or, without book data, the median order-flow imbalance of maker fills (two-sided fills ⇒ low). Stat-arb taker: **temporal clustering score = 95th percentile ÷ median of the gaps between trades inside 4-hour sessions** (about 3 for evenly spaced trades; high for bursty bots). About 70% of wallets stayed unclassified; most cut-offs are blank in the appendix; its own wallet totals disagree (175,703 vs 177,591) | gaps and maker flow: yes; cancel fraction: no |
| **Kirilenko, Kyle, Samadi, Tuzun**, "The Flash Crash: High-Frequency Trading in an Electronic Market", *Journal of Finance* 2017 [S; PDFs unreadable] | High volume with low end-of-day inventory relative to volume, short holding, enter passive and exit aggressive; the authors admit the label catches only a subset of HFT. I could **not** verify the exact thresholds | volume, end-of-day net position, holding time, taker share: yes |
| **Barone and Lillo, metaorders** (arXiv 2606.15715 [P]) | Fills of one address, one pair, same direction, gaps under 30 minutes, at least 10 children = one "statistical metaorder"; Hyperliquid's native TWAP children are tagged by id; median 16 children (statistical) and 30 (TWAP) | Yes, the 30-minute rule; fills carry `order_id`, so **fills per order** is direct (Arrakis never had it) |
| **ShieldTX copier rule** [P; vendor] | same coin and direction within 60 s ≥ 10 times in 30 days | Yes: a lead–lag test between two accounts |

Answer to R2's feature list (brief's six):

| Feature | Evidence found | Gap |
|---|---|---|
| Trades per day | Arrakis uses total-order and fill-count gates; Hyperdash lists "Trades" | No published trades-per-day cut-off |
| Holding time | Hyperdash bands; Kirilenko | Band edges are choices, not tested |
| Maker share | Arrakis ≥ 80% post-only; Kirilenko passive/aggressive | Measured on orders there, on fills here |
| Fills per order | Barone–Lillo child-order counts | New for us; testable |
| Round-the-clock activity | **No source found with a threshold** | R2 must derive it |
| Positions held at once | **No source found with a threshold** | R2 must derive it; the founding check (11 at once) is one case |

Two cautions the sources raise: (a) Arrakis says its retail count is a
minimum, because humans who only place limit orders look like bots, and it
leaves 70% unlabelled — so an honest classifier needs an explicit "can't tell" class;
(b) Polymarket's competitions give *humans* a reason to trade like bots (high
volume in boosted markets) and its liquidity rewards give *large* makers a
reason to quote both sides all day (C2: the first version said "bots", but
only accounts with at least 1% of maker volume qualify), so a label is true
for a window, not for ever.

### Q6. Alert noise and speed in existing tools

**Answer.** Followed-wallet alerts in existing tools are mostly filter-driven
(direction, size, coin, open/close). **No tool I read publishes a delay for
them.** Noise is handled by thresholds, cooldowns, digests and (in one open
source tool) batching.

- **Filters.** Cielo: eight filters per wallet (direction, size, coin, action
  type …) [P]. Hyperdash: filter the tracked feed by group, direction,
  open/close and notional [P]. SuperX filters by direction [S].
- **Minimum size.** Hyperdash's public channel uses market-wide thresholds
  ($50,000 liquidations; large TWAP starts from $10M–$50M by market;
  open-interest moves from $5M–$25M) [P]; CoinGlass's whale scale is $1M per
  a competitor [V]. These are market-wide whale scales and **do not transfer
  to a per-favourite alert**: a favourite's own scale is the right unit.
- **Grouping.** Hyperdash states no grouping; an open-source whale tracker
  batches a burst of fills into one message [S]. The Barone–Lillo rule (same
  direction, same pair, gap under 30 minutes) is the published way to say
  "these fills are one action".
- **Cooldowns and digests.** 30 minutes per market for surge alerts; one
  digest a day at 09:00 ET (Hyperdash Flows) [P].
- **Quiet hours.** None found in any tool read.
- **Speed.** Numbers that exist are for other things: HyperTracker snapshots
  every 5–8 minutes (docs [P]; its blog says 5 minutes [V]); CoinGlass
  "1 minute or less" (competitor [V]); Hyperdash's largest-positions table
  refreshes about every 3 seconds while on screen [P]; Hydromancer's order
  book 135 ms against 280 ms native (vendor claim [V]). Hyperliquid's public
  WebSocket can stream fills for chosen addresses once per block (vendor docs
  [S]), so a Hyperliquid tracker can *push*. **On Polymarket Perps the public
  stream carries no account (external-apis), so every tracker must poll** —
  the project's alert delay is set by R1's poll interval and will be
  structurally slower than a Hyperliquid tracker's.

### Q7. What this project does differently, what to copy, what to avoid

**Different by design:** a paper-follow log with a stated delay, fees and
funding, measured only after following starts and against a random baseline
(none of the tools or studies I read does exactly this — C3: first version
said "nobody"; ShieldTX measured copier cost but sells a product against
copiers); a style label with *published thresholds and
an honest "unclassified"* (Hyperdash publishes bands but no "algo" rule;
Nansen publishes no criteria; Arrakis leaves 70% unlabelled); watch only, no
copy button.

**Worth copying** (reason each):

1. **A peak-capital ROI with the capital shown beside it and a floor** (three
   venues agree): ROI without its base is how tiny accounts top lists.
   Show the base and use a higher display floor than Polymarket's $100.
2. **Hyperdash's "Trades = closed trades; 'Open' when none closed"**: it tells
   the reader a PnL is unrealised-driven. Do the same, and define win rate on
   closed position cycles only (the Binance way, not Bybit's).
3. **Windows on position changes** (15 minutes … 7 days): answers "what did
   they do lately" without alerts.
4. **Tracking groups with aliases and share-by-link** (read-only until
   cloned): suits 5–50 favourites.
5. **A "not enough history" state** (Hyperdash's grey): show the *sample size*
   and the state, not a score.
6. **Warn before favouriting an algorithm** (Hyperdash warns before copying
   one): matches decisions 2026-11-06.
7. **Filters by open/close/direction and a per-favourite size floor** (Cielo,
   Hyperdash), plus **child-fill grouping** (Barone–Lillo) so a TWAP-like
   burst is one alert.
8. **The placebo-cohort baseline** (Zhai) and **start-date-only information**
   (the vault study) for R3.

**Avoid** (reason each):

1. **An opaque composite score** (Hyperdash's copy score, Nansen's labels,
   Bybit's "balanced" score): the formula is unpublished, it reads as a
   recommendation (Iron Rule 6), and Dorfleitner found chasing top returns
   loses. Show raw measures with sample sizes.
2. **A "projected 30-day PnL on $1,000"** (Hyperdash's copy page): an
   illustration that reads as a promise.
3. **Labels built from the past** ("Extremely Profitable" … "Rekt" cohorts):
   they encode survivorship.
4. **Win rate that counts open winners** (Bybit).
5. **Ranking or discovering by notional or accumulated return**: Polymarket's
   `sort_by=notional` is a volume ranking, and its competitions pay on
   volume.
6. **Whale-scale thresholds** for per-favourite alerts.
7. **Mixing PnL definitions** (net with unrealised vs realised): label which
   one every number is.

### Q8. What third parties offer that the public perps API cannot (note only)

Using any of these would be the owner's decision (Iron Rule 1: only
Polymarket's public endpoints). **None of them covers Polymarket Perps** as
far as I could find; they are Hyperliquid or multi-chain.

- **Deeper history:** HyperTracker (6+ months, per its blog [V]), Hydromancer
  (1-second Parquet history [V]). Polymarket's own fills default to 30 days
  back (external-apis); its lifetime PnL history endpoint exists from
  2026-10-20 (changelog [P]).
- **Linking accounts of one owner:** Arkham and Nansen entity labels; PMWallets
  clusters a signer and its proxy for prediction markets [S]. Polymarket's
  changelog mentions account groups, proxies and a "rewards entity" [P]: the
  exchange knows its linked accounts, and the competition rules disqualify
  "all associated accounts" — but none of that is public.
- **Names:** Arkham/Nansen/Cielo labels; Hyperdash aliases are the user's own.
  Whether Polymarket profiles show names was not established.
- **Cohort, liquidation-map and order-flow views** (Hyperdash, HyperTracker,
  CoinGlass): Hyperliquid-only.

---

## 2. Variations weighed

1. **Use an existing tracker instead of building.** Rejected for perps: none
   covers it. Even for Hyperliquid the alert-for-followed-wallets tools are
   plan-gated (Cielo), copy-tied (Hyperdash, SuperX) or unreadable (Copin).
   The brief's premise holds: the gap is real, today.
2. **Poll vs push.** Hyperliquid tools can push; Polymarket cannot. Not a
   choice for us — polling is forced (R1 sets the rate).
3. **Style labels: rules, statistics, or vendor labels.** Rules with published
   cut-offs (Arrakis, Hyperdash) are reproducible but need the order metadata
   we lack; statistics (clustering score, maker-flow imbalance) work on fills
   but their cut-offs are unpublished; vendor labels (Nansen) are opaque.
   Weighed: rules on fill-derived features, with an "unclassified" class.
4. **Metric set: Hyperdash-like (10+ numbers and a score) vs Bybit-like
   (ranking gates) vs minimal.** Weighed: raw measures with sample size, no
   score.
5. **ROI shown or hidden.** Shown with its base and a floor, or hidden in favour
   of PnL and capital. See question 1 for the owner.
6. **Windows for labels:** a lifetime label vs a rolling window. Competitions
   change behaviour with each competition (C5: first version said "every two
   weeks"; the page does not define "bi-weekly"); a rolling window is safer.
7. **Counting competition participants separately vs ignoring them.** See
   possibilities.
8. **Baseline for the paper log:** random trades in the same markets (our F9),
   activity-matched placebo cohorts (Zhai), buy-and-hold (vault study),
   factor alpha (Dorfleitner). R3 chooses; precedent supports the first two.

## 3. Possibilities found

1. **The competition leaderboard endpoint** (weight 1, cached 1 s; the spec
   declares no security requirement, though the page does not call it public
   — C5: first version said "keyless"; R1 confirms with one call) lists accounts with score, PnL, volume, boosted volume, first-fill time and
   row state. It can flag "in a competition now", cheaply, and its
   `include_unqualified` option lists those below the minimum.
2. **Fills per order is computable** (`order_id` on every fill): the cleanest
   algorithm signal in the literature (one order many fills), unavailable to
   the Hyperliquid studies that lacked it. R2 to test.
3. **`builder_fee` on fills** (added 2026-09-27) might separate front-end
   humans from API bots, as Arrakis's builder tags did. Untested; R2.
4. **Lead–lag between two accounts** (ShieldTX's rule) can reveal that a
   favourite is itself a copier. A cheap test with fills we already poll.
5. **Metaorder grouping** (same pair, same side, gaps under 30 minutes, ten
   children) turns noisy fill bursts into one alert and one "action" in the
   statistics.
6. **Public builders** (changelog: builders self-register display names
   2026-10-20; public builder stats 2026-10-22 [P]): the list of builders is
   a list of third-party front-ends and tools. R1 could check whether it is
   public and whether it names a tracker. A cheap way to settle Q1's unknown.
7. **A forward-only record is rare and valuable**: no source offers
   historical leaderboard standings (the lab's finding, decisions 2026-11-06);
   PMWallets calls itself forward-only. Starting the daily leaderboard
   snapshot on day one is the only way to have rank-persistence data later.
8. **An optional public-style Telegram digest** (Hyperdash Flows' daily
   digest) is a later idea for the second device, after Windows.
9. **Hyperdash's tracked-group sharing** suggests a "groups of favourites"
   idea (for example by style or by theme) cheaply.
10. **The vault study's design** (start-date-only information, closed
    accounts included, a hold benchmark) as a template for how R3 describes
    its honesty.

## 4. Potential problems, and how each would be handled

| Problem | Handling |
|---|---|
| **Vendor sources are marketing** (HyperTracker's comparison names itself best; Yieldfund, Vultax, ShieldTX and Avail sell products) | Every claim above is graded; none feeds a decision without a primary check; vendor numbers are labelled |
| **Prices and features drift** (HyperTracker's own pages disagree) | Dates on every price; not used as decisions; re-read if the owner considers paying |
| **Script-rendered and blocked pages** (Hypurrscan, Hyperliquid's own leaderboard, Copin, SSRN, Bybit timeouts) | Listed under "stays unknown"; the owner can open them in a browser |
| **Competitions distort the leaderboard and the style labels** | Flag competition windows and markets in stored data (possibility 1); compute labels on rolling windows; do not sort discovery by notional |
| **Liquidity rewards may inflate market makers' PnL.** Rewards are credited to the Perps account in pUSD; the rewards page says nothing about whether they count in PnL or equity (read 2026-11-06, C2). The leaderboard PnL is realised minus fees plus funding (external-apis), but the lifetime PnL route is defined as equity minus net capital (changelog 2026-10-20), which would include a credit. My inference, not read. Only makers with at least 1% of maker volume qualify, so this concerns large makers only | R1 compares the two figures for a known maker: a steady daily gap would be the rewards. The rewards route itself needs authentication and is never called. Until settled, mark maker PnL "may include rewards" |
| **Subaccounts and multiple accounts** (29% of Hyperliquid's top 150 use subaccounts; competition rules ban multi-accounting) | One tracked "trader" is one signer address; say so in the page; never merge by guess |
| **Tiny-account ROI at the top of the board** | Display floor on capital, shown beside ROI |
| **A favourite may itself be a copy bot, or may change behaviour once watched** (ShieldTX exists because leaders now hide) | Lead–lag test (possibility 4); labels on rolling windows; stats shown with dates |
| **Hyperliquid findings may not transfer to Polymarket Perps** (different participants; scale reportedly far smaller [S]) | Treat all numbers above as priors, never as results; the paper log measures the real thing |
| **Text on documentation pages aimed at agents** (HyperTracker's "Agent Instructions" block) | Already the rule: page text is data. Worth a line in code-rules for the future fetching of external pages |
| **A third-party doc page misreports an API** | Iron Rule 3 and the dated external-apis rule already handle it |
| **My own reading tool summarises pages** | Formulas and numbers recorded as returned; where a page could not be read it is marked [X] or [S]; the supervisor can re-check the few load-bearing ones: Binance's ROI formula, Hyperdash's style bands, the Arrakis gates, the Polymarket competition formula |

## 5. What stays unknown, and what would settle it

| Unknown | What settles it |
|---|---|
| Whether any tracker for Polymarket Perps exists (X, Discord, GitHub were not searchable) | The owner searches X/Discord; R1 reads the public builders list; one more search in a month |
| Hyperliquid's own leaderboard rules (vaults, minimums) | Open `app.hyperliquid.xyz/leaderboard` in a browser; or the owner skips it — it matters less than our own leaderboard |
| Hypurrscan's features; Copin's metrics and bot handling; Bitget's metrics | Browser read by the owner or a later pass with a browser tool |
| Bybit's exact formulas (read through snippets only) | Re-read `bybit.com/en/help-center/article/How-to-Understand-Master-Trader-Performance` |
| Binance's Sharpe formula (an image) | Open the FAQ in a browser |
| Hyperdash's copy-score formula and its alert latency | Not published; ask the vendor only if the owner wants to |
| Kirilenko et al.'s exact thresholds | A text version of the paper (the PDFs were binary to my tool) |
| Whether Polymarket's leaderboard PnL (or the lifetime PnL route) includes liquidity rewards, and whether a public profile shows names | R1 (live reads): compare the two PnL figures for a known maker; the rewards route needs authentication and is never called |
| The size of Polymarket Perps (open interest, accounts) | R1: the exchange-stats endpoint is public |
| Whether the 41–51% repeat rate (prediction markets) holds for perps | Forward measurement from day one of the snapshots |
| How many of the studies' wallets were bots | Nobody labelled them; R2's classifier is the first |
| Whether abandoned or reset accounts are visible on Polymarket's boards | The daily snapshot over weeks |

## 6. Beyond the brief

1. **The API changes more than once a week, including additions to required
   fields.** The changelog shows 33 entries between 2026-06-08 and
   2026-11-05 (this item first said "about 35 … weekly"; the count is 33, see
   C1). One (2026-10-06) added a *required* `roi` field to every leaderboard
   row and says strict validators must add it; others added required fill
   fields (`settlement`, `builder_fee`, `total_fee`, `adl`), a `pre_ipo`
   instrument category (2026-10-29) and two new terminal order statuses
   (2026-09-27).

   **[Corrected by the Final review, 2026-11-06, C1. The first version of
   this item said: "A strict schema would drop whole replies the day a field
   is added." That is wrong for Zod's default and is withdrawn.]** Zod's own
   documentation (zod.dev/api, section Objects, read 2026-11-06): `z.object()`
   strips unrecognised keys by default; `z.strictObject()` throws on them;
   `z.looseObject()` lets them through; keys are required by default; and
   `z.enum()` rejects a value that is not in its list (the docs' example
   rejects "Swordfish"). So with the default parsing **a field the exchange
   adds does not break anything** — it is dropped from the result unseen.
   What does break, and what the changelog shows happening:
   (a) `z.strictObject()`, if we ever chose it;
   (b) a field we declare required that the exchange removes, renames or
   leaves out;
   (c) a changed type or format of a field we declare;
   (d) a closed list the exchange widens — a new category or order status
   fails an enum, and the changelog added both within weeks.
   What does not break but costs us: new information stays invisible (we would
   not see `roi` until the schema names it).
   Candidate rule for code-rules (the supervisor decides): keep the default,
   non-strict object parsing; declare closed lists only where an unknown value
   would do harm, otherwise accept unknown strings and map them to an
   "unknown" state; compare each reply's keys with the schema's once a day and
   log the difference; keep the raw reply for debugging. **A design question
   for the plan, not from Zod's docs:** Iron Rule 3 drops a reply that fails
   its schema, so if a page of 100 leaderboard rows is one reply, one row with
   a new list value drops all 100 — the plan should decide whether rows are
   parsed one by one.
2. **A weekly changelog watch** is cheap and would have caught the ROI field.
   The docs page is public; reading it needs no API call.
3. **Competitions are regime changes, on a schedule the docs do not state**
   (C5: first version said "every two weeks"; the page calls them "bi-weekly",
   announced a few days ahead, no dates or length). The scoring (PnL ×
   √boosted volume, boosts like 3× on selected markets, an Anthropic pre-IPO
   market competition running to 2026-11-16 [S]) pays for volume in specific
   markets. A favourite's behaviour — and an "algorithm" label — can change
   with the schedule. Store which competition was live; label on windows.
4. **Liquidity rewards pay large market makers to quote.**
   **[Corrected by the Final review, 2026-11-06, C2. The first version said
   "Liquidity rewards ($75,000 a day, shared by makers) mean market makers
   are paid to be there. Their number is likely higher than on exchanges
   without rewards …". The second sentence had no evidence and is withdrawn;
   the rules below show rewards reach large makers only.]** Read from
   docs.polymarket.com/perps/liquidity-rewards.md (2026-11-06; the page
   carries no date): $75,000 a day split evenly across active markets; an
   account qualifies only with at least 1% of maker volume over the trailing
   seven days (an entity's combined share for accounts in one "rewards
   entity"; trades between accounts of one known entity do not count toward
   maker share); raw_score = maker_score^0.35 × active_liquidity_score^0.65 ×
   uptime; maker share above 25% adds nothing; only resting orders within 20
   bps of the mid count, with weights 1.00 (within 5 bps), 0.25 (5–10) and
   0.10 (10–20), each tier capped at $100,000 per side; bid and ask scores
   are combined so a one-sided book scores zero; uptime is the share of
   snapshots with qualifying orders on both sides; periods run 12:00 to 12:00
   UTC; paid in pUSD to the earning account. For R2 as notes, no code: (i) a
   reward-earning account is by construction large and quotes both sides
   nearly all day — fills show only the filled part (high maker share,
   two-sided position swings); the quotes themselves are not public;
   (ii) the exchange groups linked accounts into entities and discounts
   trades among them, so it knows account links and treats self-dealing as
   worthless for rewards, but none of that is public (the page does not even
   define an entity); (iii) small bots are not driven by rewards, so rewards
   explain the big market makers, not the many small algorithms; (iv) the
   decision "alerts on directional traders by default" is unchanged by this;
   (v) whether rewards count in PnL is not stated (see section 4).
5. **The leader-vs-follower gap (97% vs 43.6%)** is the same gap the project
   exists to measure honestly. The paper-follow log is the follower-PnL that
   platforms show only as a field.
6. **Platform "followers' PnL" mixes entry times and sizes**, so it is not
   comparable to a fixed-delay paper entry; do not borrow it.
7. **Privacy tools aimed at copiers are appearing** (ShieldTX, launched
   2026-10-28 for Hyperliquid): leaders are starting to hide. A favourite's
   visible behaviour may later stop reflecting what they do; keep stats dated.
8. **Signer address vs smart wallet** (polymarket101): the same person can be
   a perps address and an events address; the owner may later want a manual
   "same person" note, which is allowed (it is the owner's data, not an
   endpoint).
9. **Terms of use.** The project calls only Polymarket's public API. The
   tools above may forbid scraping; we do not.
10. **A caution on this report's own numbers:** several are one-week-old
    vendor studies. They should be re-checked if the v1 plan leans on any.

## 7. Questions for the owner, each with my recommendation

1. **Show ROI at all?** *Recommendation:* show PnL and the capital base as
   the primary pair and ROI as a third, only with its base beside it and a
   display floor well above Polymarket's $100 (Hyperdash uses $1,000). Reason:
   three venues document peak-capital ROI, yet small bases still produce the
   top rows.
2. **Add a single "quality" or "copy" score?** *Recommendation:* no. Show raw
   measures with sample size and a "not enough history" state. Reason: Iron
   Rule 6, unpublished formulas elsewhere, and the one peer-reviewed paper I
   could read found that choosing by the highest accumulated returns loses
   heavily (C3: first version dropped "I could read").
3. **Store competition membership and live competition windows, and label on
   rolling windows?** *Recommendation:* yes — one weight-1 endpoint that the spec lists without a
   security requirement (C5).
   Reason: the board and the labels are bent by competitions.
4. **Adopt a schema-drift rule and a weekly changelog read?**
   *Recommendation:* yes; for code-rules and the plan page — default
   (non-strict) object parsing, closed lists only where an unknown value would
   do harm, a daily keys-against-schema comparison, and a decision on whether
   one odd row may drop a page. Reason: section 6, item 1 **(corrected, C1:
   this question first asked to "change the schema rule (strict on known
   fields, tolerant of new ones)", which rested on the withdrawn claim that
   added fields break a strict-by-default schema)**.
5. **Ask R1 to read the public builders list and the competition and
   exchange-stats routes, and to compare the leaderboard PnL with the
   lifetime PnL route for a known maker (to see whether rewards are
   included)?** *Recommendation:* yes — a few extra calls inside R1's token
   share. They settle three unknowns above.
6. **Pay for any third-party data in v1?** *Recommendation:* no. No vendor
   found covers Polymarket Perps; the ones that exist are Hyperliquid-only
   and would also break Iron Rule 1 if used for this app. Revisit only if
   R1/R6 show the public API cannot supply what the v1 plan needs.
7. **Treat "unclassified" as a visible label, and warn on favouriting it as
   it warns for an algorithm?** *Recommendation:* yes. Reason: Arrakis could
   not label 70% of wallets; an honest classifier has a can't-tell class,
   and a quiet failure is the trap the owner wants avoided.
8. **Should the app show a "same signer address" note for accounts the owner
   links manually?** *Recommendation:* defer to after v1; note it on the
   backlog. Reason: it is the owner's own data, but nothing in v1 needs it.

## 8. Corrections by the Final review (2026-11-06)

The supervisor's Final review and R5-TOOLS's own re-check, 2026-11-06
~23:00Z. Each correction is marked in place with its number; short original
wordings are kept in the marks. Checked with no change needed: this report
lists eight owner questions (section 7); the commit message of de29b84 says
seven — a slip in the message only.

- **C1 (high)** — section 6 item 1 and section 7 question 4: the claim that
  a strict schema drops replies when a field is added was wrong for Zod's
  default parsing; restated with the exact risks (Zod docs, zod.dev/api,
  read 2026-11-06). Also: the changelog count is 33, not "about 35".
- **C2 (high)** — liquidity rewards: graded [P] (docs.polymarket.com/perps/liquidity-rewards.md, read 2026-11-06; the supervisor read it too) and the missing
  rules added in section 3 table, section 5 caution (b), section 4 and section 6 item 4: the 1% trailing seven-day maker-volume gate, the score formula, the
  25% cap, the 20 bps depth rule, the entity grouping. The unsupported sentence that market makers are "likely more numerous" is withdrawn.
- **C2 location note (made under C3):** the C2 entry above names the places loosely. The rewards rules were added to the Q3 table row "Competition and
  reward farming" (section 1), caution (b) under Q5 (section 1), the rewards row in section 4, and section 6 item 4.
- **C3 (medium)** — overclaims narrowed: verdict items 2 and 3 ("mostly paid or closed", "one place only", "no profitable follow-the-top strategy",
  "point the same way"), Q2 ("Only Hyperdash"), Q7 ("nobody"), section 7 question 2 ("I could read"). Dorfleitner et al. found no positive *abnormal* return
  (four-factor alpha) after costs, not that no strategy made money. Yieldfund's summed follower PnL was positive (+709,045 USDT), so its finding is the
  gap between leaders and followers, not a net loss.
- **C4 (medium)** — section 1 Q1, scale claims: the attribution to "a KuCoin flash-news piece" was a guess (the search summary named no article) and is
  withdrawn; the "102 days old" age cannot fit launch-day figures. The claim stays ungraded and unused until R1 measures exchange-stats.
- **C5 (medium)** — the competition leaderboard route is no longer called "keyless" (the spec lists no security requirement; the page does not call it
  public; R1's one call settles it), and "bi-weekly" is no longer read as "every two weeks" (the competitions page does not define it and gives no schedule;
  re-read 2026-11-06 ~23:05Z). Payout ladder added: first place $10,000, places 25 to 50 $250 each.
- **C6 (low)** — Bybit: the 7-day positive followers' PnL gate may come from a third-party guide inside the search snippet, not Bybit's own page; both Bybit
  gates stay snippet-level [S]. Bybit's help pages timed out three times; re-read them in a browser if a decision leans on them.
