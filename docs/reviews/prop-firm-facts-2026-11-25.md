# PROP-FIRM-FACTS — which funded-trading firms fit the owner's crypto plan

PROP-FIRM-FACTS (Sonnet 5.5, xhigh, fresh), 2026-11-25. Pages read 13:00–13:18Z
by `date -u`. A research report: it decides nothing; the supervisor copies
what holds into the plan page or decisions. It states facts and a ranking of
rule fit; it is no instruction to trade.

**Method.** Web reading only: each firm's own pages, help centres and terms;
Trustpilot's public pages for review counts (user reviews, not verified);
regulators' own notices and trade-press reports for disputes. No sign-up, no
account, no form, no download, no API call. Nothing about the project or the
owner was sent to any site. Two limits of the reader used:
- It returns a paraphrase with short quotes (about 125 characters at most), so
  a long clause is given as the reader's summary and marked so. Where wording
  matters most (the copying lines), the quote is the page's own.
- Pages that load by JavaScript, or answered 403/404, were not read (listed
  in section 9).

"Date" below is the date the page shows, or the page's metadata
`dateModified`; "undated" means none was shown; every page was read
2026-11-25.

## 1. The result in six lines

1. **One firm's own text allows what the owner would do:** Propr (propr.xyz).
   Its terms (last modification 2026-08-26), Annex 2 item 5: "Copy trading
   from an external, non-Propr account into a single Account is permitted."
   It prices from Hyperliquid, the venue the traders are on, and permits
   bots, weekends, news and holding.
2. **Nine of the other eleven forbid following third parties** (section 3).
   Four say it in one plain line: "Copy trading other traders is not allowed"
   (HyroTrader); "Copying trade ideas from third parties, including other
   traders" (Breakout); "Copy trading is not permitted on HyperPNL evaluation
   or funded accounts"; Finotive's help article 955.
3. **Two are unclear, not forbidden:** FTMO's CFD pages are silent on
   copying while its futures page forbids it; MyFundedPerps allows copying
   between your own accounts and says nothing on following public traders.
4. **The funded accounts are simulated** at every firm that says so (Propr,
   Finotive, HyroTrader, MyFundedPerps, HyperPnL, E8, Upscale). What the owner
   would receive is a reward for simulated results, paid by the firm
   (HL-FOLLOW-FACTS found the same for Finotive, terms 1.3).
5. **No firm read claims a licence for this activity;** those that address it
   say they are not a broker or not regulated (Propr, HyroTrader, Upscale),
   and the one regulator notice read (Belgium's FSMA, 2024-03-07) says prop
   firms hold no authorisation.
6. **Propr is young** (launched 2026-02-25, its own changelog) and its
   rulebook and terms disagree on one copying line; both points are in the
   owner's checklist (section 7).

## 2. How the word "copying" reads against the owner's use

The owner's use: a person who sees a public Hyperliquid trader's position
change and, by hand and after a delay, opens a similar one on a funded
account. No copier software, no contact with the trader, no paid signal.

- **Account-to-account copying** (a copier, a master account) is what most
  help articles name first (FundedNext, E8, BrightFunded, CFT, MyFundedPerps).
  Doing the same by hand from a public address is not named in any of them.
- **Idea-level wording** reaches a by-hand follower: Breakout ("copying trade
  ideas from third parties, including other traders, analysts"), HyroTrader
  ("copy trading other traders"), BrightFunded and E8 ("signals", "signal
  services"), The5ers ("copying another person's signals"), Finotive
  ("third-party accounts ... signal providers ... letting outsiders direct
  trading").
- **No page read says** whether a public blockchain address counts as a
  "third-party account" or a "signal". That is a question for each firm's
  support, in writing (section 7).

## 3. The comparison table

Firm; the rule on following others; crypto offered and platform; costs;
holding rules; payout. Each cell's source and date are in section 4. "NR" =
not read.

| Firm | Rule on following others | Crypto, platform | Costs | Holding and risk rules | Payout |
|---|---|---|---|---|---|
| **Propr** (BVI) | **Permitted from an external, non-Propr account into one account** (terms, 2026-08-26); mirror trades across your own Propr accounts prohibited; bots and AI permitted (cl. 8.11). The rulebook says own-account copying is permitted, so it disagrees with the terms there | Hyperliquid perps with more than $1M open interest (live list `/universe`: NR), A-booked trades routed through Hyperliquid; own web terminal and API. Max leverage BTC, ETH, SOL 10x; other crypto 2x | "Standard Hyperliquid maker/taker fees apply", no markup; funding counted in equity; no monthly, inactivity or withdrawal fees; challenge fee $60 (Classic 1-step, $5K) to $1,998 ($200K), non-refundable | Weekends, news, holding all permitted; no minimum days; no consistency cap; no max position size beyond leverage; open-positions limit not addressed. Daily loss 3% (1-step) or 5% (2-step) of start-of-day balance; max loss static 6% (Classic 1-step), 3% (Turbo), 5% (Pro), trailing 8% (2-step); a momentary touch breaches | 80%; minimum $20; "processed within 24 hours" in USDC; all positions closed first; KYC required |
| **Finotive** (all accounts simulated) | Forbidden: copying "third-party accounts, shared master accounts, signal providers, account managers"; may close the account and reject payments if ownership and control of the strategy cannot be proved (help 955; terms 7.10) | 123 crypto symbols, 14 of the 38 small coins, BTC, ETH, SOL (HL-FOLLOW-FACTS); MT5, Match-Trader; crypto leverage 1:10 | commission 0.06% (0.045% Pro), swap NR (HL-FOLLOW-FACTS) | News allowed with a genuine view; no minimum hold, but 20% or more of cycle profit from trades under 120 s = strike (7.14); a 21:00–22:59Z window rule (7.17); weekend: Instant accounts may not hold non-crypto positions (7.7); daily loss 3.0–5.0%, max 6.0–10.0% by account | 80% rising to 95% (Challenge); cooldown 7 days; first request on demand once funded; minimum 1% of balance |
| **FTMO** | **Unclear.** CFD forbidden-practices page: no copying line; third-party EAs risk denial; futures page: "must not replicate, follow, or otherwise incorporate the trading decisions of any third party" | BTCUSD, ETHUSD, ADA, DOT, DASH, LTC, XRP, DOGE, XMR, NEO and 22 newer coins incl. SOL, BNB, XLM, AAVE, LINK (blog 2025-07-25; symbols page NR); MT5, MT4, cTrader, TradingView via OANDA | crypto commission 0.0325% a side (2025-07-25); swap, spread NR; crypto leverage 1:3.3 Standard, 1:1 Swing (a blog; search extract) | Standard funded: close all positions before a market break over 2 h; Swing accounts and Challenge/Verification exempt; 2 min news restriction on funded Standard; daily loss 3% or 5%; max loss 10% static (2-step); best day at most 50% of profit | 90% (1-step, Instant), 80% (2-step; 90% with scaling); first request on day 14; crypto payout minimum $50 |
| **FundedNext** | Forbidden between different people ("copy trades between accounts owned by different individuals"); own Challenge accounts allowed; futures: no external signals | 9 crypto CFD pairs (list NR), leverage 1:1, Monday–Friday only; platform NR | NR | Weekend holding allowed (Stellar); news allowed; daily loss 5%, max 10% static (2-step) | 80% (up to 95%); first cycle 21 days, then 14 |
| **The5ers** | Forbidden: "copy trading with other traders or accounts"; blog: "copying another person's signals" | Crypto in Hyper Growth; MT5; leverage 1:30 overall (High Stakes crypto 1:2) | NR | Weekends allowed; news allowed except brackets; daily loss 3%, stop-out 6% | up to 100% share; timing NR |
| **Breakout** (Kraken) | Forbidden: "Copying trade ideas from third parties, including other traders, analysts"; social media, research, crowd signals | Own terminal: BTC 10x; ETH, SOL, XRP, ADA, AVAX 5x; HYPE, NEAR, ENA 3x; others 2x | 0.04% per crypto order; swap 0.033% a day per open position | Weekends allowed; payouts any day | 80% (Kraken's page); minimum $50 |
| **HyroTrader** | Forbidden: "Copy trading other traders is not allowed" | Bybit demo accounts, BloFin, own platform; 700+ USDT perps; leverage up to 150x BTC/ETH | exchange's own fees | News allowed (not solely); daily loss 3–5%, max 5–10%; weekend NR | 80% up to 90%; minimum $25; about 24 h |
| **Crypto Fund Trader** | Forbidden: "Copy trading between different traders, third parties, groups, or unrelated accounts" (Break) | Bybit 550+ USDT pairs; MT5/Match-Trader 556 coins; own terminal 515; leverage 1:100 (Ascend crypto 1:5) | crypto 0.0325% a side; Bybit's native fees | Weekends and news allowed; daily loss 3–5%; Break: best day under 40% | standard every 15 traded days or 30 days; 90% add-on |
| **BrightFunded** | Forbidden between different people; "Signal Trading (trading based on signals from community groups)" | crypto leverage 1:5 (an older article); platform NR | NR | 1-Step, 2-Step may hold weekends; Instant may not, crypto included | 80% (90% add-on); 1-Step any day; 2-Step first at 14 days |
| **E8 Markets** | Forbidden: copying only between accounts you own; "we also do NOT permit signal services" | crypto 1:1; perpetual futures BTC, ETH 1:15, others 1:2 (a search extract); platform NR | NR | NR | minimum $100; E8 One first at 3 days; E8 Pro 80–100% of a half |
| **HyperPnL** | Forbidden: "Copy trading is not permitted on HyperPNL evaluation or funded accounts" | Own platform, "powered by Hyperliquid"; crypto maker 0.015%, taker 0.045% | those fees | Weekends and news allowed; daily loss 3%; max loss page says both 5% and 9% | 80%; USDC daily; no KYC |
| **MyFundedPerps** | **Unclear.** Own-account copying allowed; "Multiple traders may not coordinate trades, divide positions, mirror strategies"; a signal provider operating your account is prohibited | Hyperliquid, Lighter, Binance, Ostium via its terminal; crypto 24/7 | crypto commission 0.03%; hourly swap | 24/7 markets may be held over weekends; news restricted on funded accounts; Elite daily 3%, max 5% | up to 90%; $100 minimum |

## 4. Firm by firm

Items as the brief lists them: (1) the rule on following others, (2) crypto
and platform, (3) costs, (4) holding and risk rules, (5) payout, (6) what
reviewers and regulators say.

### 4.1 Propr — propr.xyz (Propr Limited, British Virgin Islands, no. 2211330)

1. **Rule.**
   - Terms, "Last modification: 26 August 2026", Annex 2 (a list the terms call
     "farming or gaming the system and ... strictly prohibited"), item 5,
     titled "Copy trading between your own Accounts": "Running identical or
     mirror trades across multiple Accounts you control. Each account must be
     traded independently. Copy trading from an external, non-Propr account
     into a single Account is permitted." The terms do not say whether the
     external account must be the trader's own.
   - Cl. 8.11: "The use of automated trading software and AI-driven bots is
     permitted" unless it harms the platform; identical or off-the-shelf bots
     "may be flagged as coordinated trading". Cl. 3.3: Propr neither gives nor
     accepts trading guidance.
   - The rulebook page (changelog up to v1.0.5, 2026-07-27; its header still
     says v1.0), section 14: "Copy trading is permitted, including between
     your own Propr accounts." That disagrees with the terms' item 5 on
     mirroring across own accounts. A review site (FundedTrading, checked
     2026-09-30) flags the same conflict.
   - Annex 2 also prohibits: opposite hedging across accounts, hedging on
     outside exchanges or other prop firms, coordinating offsetting trades
     with other Propr traders, latency arbitrage, wash trading, and (rulebook
     section 15) "non-replicable or high-risk strategies", for example ones
     that trigger auto-deleveraging.
2. **Crypto and platform.** "Propr lists Hyperliquid perps with more than $1M
   of open interest", across crypto, stocks, indices, commodities and FX.
   "All A-booked trades ... are routed through Hyperliquid and are verifiable
   onchain"; B-booked ones are internal and not visible; "the Firm selects the
   execution method at its absolute discretion on a trade-by-trade basis".
   Own web terminal and an API ("Over 2,000 API users", "Over 300 agents",
   homepage, undated). Maximum leverage: BTC, ETH, SOL 10x; other crypto 2x;
   equities 4x. Whether each of the 38 coins HL-FOLLOW-FACTS lists is on the
   live list was not checked.
3. **Costs.** "Standard Hyperliquid maker/taker fees apply. Propr does not add
   markup." Funding is included in the equity calculation. "There are no
   monthly fees, inactivity fees, data fees, platform fees, or withdrawal
   fees." Challenge fees (non-refundable once the account is active): Classic
   1-step $60 ($5K) to $1,998 ($200K); Turbo 1-step $25 ($5K); Pro 1-step $45
   ($5K); Classic 2-step $50 ($5K). Spread: NR.
4. **Holding and risk.** Weekends held, news traded, "overnight holding all
   permitted" (changelog v1.0.3, 2026-06-29). "There is no minimum number of
   trading days. You can pass in a single trade." "No cap on single-day
   profit as a percentage of total." "No maximum position size rule beyond
   leverage limits." Maximum open positions: not addressed. Daily loss 3%
   (1-step) or 5% (2-step) of the start-of-day balance, reset 00:00 UTC.
   Max loss: 1-step static (Classic 6%, Turbo 3%, Pro 5%); 2-step trailing 8%
   that stops at the starting balance. "Even a momentary touch of the equity
   floor triggers a breach. There is no grace period."
5. **Payout.** 80% of profit; minimum $20 (the v1.0 changelog said $50); "All
   positions must be closed before requesting a payout"; "Full profit sweep
   only"; USDC onchain, "Processed within 24 hours"; KYC before any payout
   (cl. 2.2). The terms call a payout "a performance-based reward for signal
   evaluation, not an investment return or capital gain".
6. **Reviewers and regulators.**
   - Propr "is not authorized or regulated by the BVI Financial Services
     Commission"; cl. 3 is headed "NOT A FINANCIAL SERVICE"; BVI law governs
     (cl. 17); "All Propr accounts, including 'Funded Accounts', are 100%
     simulated." "Decisions are final and not subject to appeal."
   - Restricted-country list in cl. 2.1(b) (read; includes Russia, Belarus,
     Iran, Nigeria, Pakistan and others); the review site says the US and UK
     were removed from it before the 2026-08-26 update (unconfirmed by the
     terms text read).
   - Homepage claims (own, undated): $4,367,933 total payouts, $1,026,337 in
     the last 30 days, "backed by SwissBorg".
   - Trustpilot (read 2026-11-25): 4.4, 70 reviews in the last 12 months,
     87% five-star, 9% one-star; newest review 2026-11-14; payouts mostly
     praised, support slow, bugs setting stop-loss and take-profit, some lag;
     Propr says it is "still in beta"; the page notes the firm has not
     recently invited reviews. No payout dispute found; none can be ruled out.

### 4.2 Finotive Funding

Items 2 and 3 (coins, platforms, costs) and the simulation of its accounts
are in HL-FOLLOW-FACTS (`hl-follow-facts-2026-11-25.md`, section 4.1) and are
not repeated beyond the table; this report adds what that one did not read.
1. **Rule.** Help article 955 (undated): copying from "third-party accounts,
   shared master accounts, signal providers, account managers" is prohibited,
   as are challenge-passing services and third-party groups; if ownership and
   control of the strategy, master account, EA or copier setup cannot be
   proved, Finotive "may close the account and reject Reward Payments".
   Terms (no date shown) 7.10: commercial copiers allowed only for the
   trader's own trades; EAs only if developed, owned and controlled by the
   trader; Finotive may ask for verification, a compliance interview, a live
   demonstration or proof of ownership.
4. **Holding and risk** (terms): news allowed if "a genuine directional
   market view", no straddling within 15 minutes of Red or Amber events
   (7.9); HFT: 20% or more of a payout cycle's positive profit from trades
   held under 120 s, at least 10 closed trades; a conditional strike cuts the
   cycle's reward to 10%, five strikes close the account (7.14); a
   21:00–22:59Z window under the same strike rule (7.17); Pro accounts:
   weekly trade count and volume within ±25% of their averages (10.6);
   daily loss 3.0–5.0% and max 6.0–10.0% by account (7.4, 7.5); a notional
   volume cap from 5,000% ($2,500 account) to 1,000% ($200,000) (7.6).
5. **Payout** (terms 8.4, 8.8, 9.4, 10.4, 12.3): Challenge 80% rising to 95%;
   Instant 75→90% (Lite 70→85%); Pro 80→100% after 30 funded days; 7-day
   cooldown (Instant Lite 14); the first request on demand once funded (Solo:
   after 14 days); minimum 1% of the initial balance, no USD cap.
6. **Reviewers.** Trustpilot (read 2026-11-25): rating "unavailable due to a
   breach of our guidelines"; 1,082 reviews, 336 in the last 12 months; 62%
   five-star, 27% one-star; newest 2026-11-24. The recurring complaints:
   payouts reduced to about 10% after a risk review (which matches terms 7.14
   and 7.17), delays, accounts closed with profits unpaid, rules applied
   unclearly. The legal entity behind the brand was not found; the terms name
   "Finotive Markets LLC (SVG)" for the platform.

### 4.3 FTMO

1. **Rule.**
   - CFD forbidden-practices page (`dateModified` 2026-11-02) lists, among
     others: trades "in conflict with" the terms; "third-party trading"
     (letting others use your account); EA activity above 2,000 server
     requests a day; tools giving an "unfair advantage"; "non-replicable"
     risk management. It has no copying line.
   - FAQ "Which instruments ..." (2026-10-30): "Your trading style is up to
     you"; a third-party EA risks "being denied the FTMO Account" as others may
     run it.
   - FAQ "How many accounts" (2026-09-30): identical trading across several
     FTMO accounts, "including trades copied from or based on the same
     third-party source (such as signal groups or copy-trading services)", can
     lead to suspension above capital limits.
   - **FTMO Futures** forbidden-practices page (2026-10-30), item 4 "Copy
     trades from another trader": "You must not replicate, follow, or
     otherwise incorporate the trading decisions of any third party", by
     "signal services, master accounts, trade copiers".
   - The account terms (the contract) were not read (404). The CFD rule is
     therefore unknown, not "allowed".
2. **Crypto and platform.** Blog (2025-07-25): BTCUSD, ETHUSD, ADAUSD, DOTUSD,
   DASHUSD, LTCUSD, XRPUSD, DOGEUSD, XMRUSD, NEOUSD with 22 new coins (SOL,
   BNB, XLM, AAVE, LINK, an Avalanche pair named; full list NR). Platforms:
   MT5, MT4, cTrader, TradingView through OANDA (2026-11-18). The symbols page
   shows its table by JavaScript (NR).
3. **Costs.** Commission "0.0325% per side on the notional volume" on all
   crypto (post effective 2025-07-28). Swap, spread: NR. Leverage: Standard
   "up to 1:100"; a blog's search extract gives crypto 1:3.3 (Standard) and
   1:1 (Swing): not read on the page itself.
4. **Holding and risk.** Weekend FAQ (2026-10-11): "You must close all open
   positions before the break begins" (any market closure over 2 h) on
   Standard funded accounts; Swing accounts and Challenge/Verification are
   exempt. News FAQ (2026-10-11): execution restricted 2 minutes either side
   of selected releases, same exemptions. Trading objectives (2026-11-02):
   daily loss 3% (1-step) or 5% (2-step); max loss 10% static (2-step),
   end-of-day trailing (1-step); 4 minimum trading days (2-step); best day at
   most 50% of profit (Instant 30%).
5. **Payout** (FAQ 2026-11-22): 90% (1-step, Instant); 80% (2-step; 90% with
   scaling); request from the 14th day after the first trade; review 1–2
   business days; crypto withdrawals minimum $50.
6. **Reviewers.** Trustpilot (2026-11-25): 4.8, 57,917 reviews, 2% one-star;
   no payout complaint seen on the first page. FTMO's own FAQ says it "may
   use the data obtained from FTMO Accounts to trade on our own separate live
   accounts" (FAQ "Trading according to a real market", 2026-10-09).

### 4.4 FundedNext

1. **Rule.** Help article "What is the copy trading rule" (shown 2026-09-18):
   copying between a person's own Challenge accounts is allowed; "copy trades
   between accounts owned by different individuals" is not; "strictly
   prohibited" in the summary; manual and automated alike. Futures help
   (search extract): no external signal services. Stellar page: "avoid
   unauthorized copy trading".
2. **Crypto.** Help article (2026-04-07): 9 crypto CFD pairs (names in an
   image), leverage 1:1, Monday–Friday, 00:15–24:00 platform time; "You are
   not buying real cryptocurrencies". Platforms: not on the pages read.
3. **Costs.** NR.
4. **Holding.** Stellar 2-Step: weekend holding and news trading allowed;
   daily loss 5%, max loss 10% static; "EAs/VPS available with add-ons".
5. **Payout.** 80% (headline "up to 95%"); first cycle 21 days, then 14; fee
   refunded with the first reward.
6. **Reviewers.** Trustpilot: 4.5, 84,850 reviews, 8% one-star.

### 4.5 The5ers

1. **Rule.** Prohibited-practices page ("last update: November 3, 2026"):
   "Trade coordination or copy trading with other traders or accounts"; "EA
   from a third party, where other traders have the same trades open (copy
   trading)"; an EA from a provider "where the trader does not own the source
   code". Its blog (2026-09-17): "The5ers' published rules prohibit copying
   another person's signals."
2. **Crypto.** Hyper Growth lists crypto among assets, MT5, leverage 1:30
   overall; High Stakes FAQ (2026-11-03): crypto 1:2.
3. **Costs.** NR.
4. **Holding.** Weekends allowed (indices carry a high swap); news allowed
   except brackets; Hyper Growth: daily loss 3%, stop-out 6%; no minimum days
   at level 1.
5. **Payout.** "Up to 100% profit share"; scaling table 75/25 to 80% to
   80–100%; timing NR.
6. **Reviewers.** Trustpilot: 4.7, 44,622, 3% one-star; delays in payouts
   mentioned. Finance Magnates (2024-02-16): it paused new US onboarding for
   "regulatory pressure".

### 4.6 Breakout (owned by Kraken)

1. **Rule.** Funded-account help "What trading practices are prohibited"
   (shown 2026-09-03): "Copying trade ideas from third parties, including other
   traders, analysts", also social media, research reports and crowd signals;
   "off-the-shelf" strategies; strategies that are hard to execute or high-risk,
   including trades "likely to be auto-deleveraged". Copying FAQ (2026-09-03): "Copy
   trading across users" is prohibited. The older evaluation article
   (2025-01-01): "Any copy trading must be copying your own trades." Bots:
   not named.
2. **Crypto.** Own terminal (web, iOS, Android); leverage BTC 10x; ETH, SOL,
   XRP, ADA, AVAX, AAVE 5x; HYPE, NEAR, ENA, ONDO 3x; others 2x (undated:
   "Updated this week"). Kraken's page (2026-11-06) says in prop trading "you
   provide trade signals only" and hold no real positions.
3. **Costs.** 0.04% on every crypto order; "0.033% daily swap fee per open
   position, charged at 00:25 UTC if you're holding a position at 00:00 UTC".
4. **Holding.** "You can hold positions in your funded account over the
   weekend"; payouts any day.
5. **Payout.** Minimum $50 after the split; 80% from day one (Kraken's page).
6. **Reviewers.** Trustpilot: 4.7, 1,333 reviews, 3% one-star; one 50% payout
   penalty described. Kraken, the owner of Breakout since September 2025
   (Kraken's page), sells it, so its comparison pages are not independent.

### 4.7 HyroTrader

1. **Rule.** FAQ "Is copy trading allowed?" (undated): "Copy trading other
   traders is not allowed. HyroTrader is looking for skilled traders, not copy
   traders." FAQ "same trades on more than one account": mirror trading
   across accounts prohibited; at least 14 days to respond. Bots and EAs:
   NR (the prohibited-actions FAQ lists demo-fund requests, balance edits,
   deleting the API key, spot in a futures challenge, EUR/USD, options).
2. **Crypto.** Bybit demo accounts, BloFin, Tealstreet, own platform; 700+
   USDT perpetuals; leverage "up to 150x on BTC and ETH".
3. **Costs.** The exchange's own fees; challenge fee from $9 (Core) to $169
   (Instant).
4. **Holding.** News allowed "must not be based solely on news"; daily loss
   3–5%; max loss 5–10%; Hyro Instant 2% per trade; weekend: NR.
5. **Payout.** 80% (up to 90%); minimum $25; "usually within 24 hours" in
   USDT or USDC.
6. **Reviewers.** Entities: HYRO TECHNOLOGIES FZ-LLC (Ras Al Khaimah, UAE),
   HYROTRADER TECHNOLOGIES LTD (BVI), Hyro Finance j.s.a. (Slovakia, card
   payments); "not a broker ... all trading happens on simulated demo
   accounts". Trustpilot: 4.0, 249 reviews, 14% one-star, no payout theme on
   page 1.

### 4.8 Crypto Fund Trader (CFT)

1. **Rule.** FAQ (undated): Break: "Copy trading between different traders,
   third parties, groups, or unrelated accounts is prohibited"; Ascend:
   copying between Ascend accounts prohibited; final stage: none. Bots:
   "High-frequency trading is not allowed"; tick scalping banned manual or
   automated; arbitrage and news-scalping EAs banned.
2. **Crypto.** Bybit: 550+ USDT pairs; MT5/Match-Trader: 556 coins; CFT
   Terminal: 515. Leverage 1:100; Ascend and student crypto 1:5.
3. **Costs.** Crypto 0.0325% a side; swap 00:00 UTC on MT5; Bybit's fees apply.
4. **Holding.** Weekends and overnight allowed on any account; news allowed
   (Ascend: no new trades 2 minutes either side); daily loss 3–5%, overall
   3–10%; Break: no single day above 40% of profit.
5. **Payout.** Standard every 15 traded days or 30 days; add-ons weekly and
   48 h; 90% add-on.
6. **Reviewers.** Trustpilot: rating withheld ("breach of guidelines"; fake
   reviews removed); 1,114 reviews; 14% one-star; themes: payouts denied or
   pending, rules said to be applied inconsistently.

### 4.9 BrightFunded

1. **Rule.** Help "Is copy-trading allowed?" (2026-09-29): only between
   accounts held by the same person; "copying trades between accounts not
   owned by the same individual" strictly prohibited; "Signal Trading
   (trading based on signals from community groups)" also.
2. **Crypto.** Leverage 1:5 (article about 252 days old); platform NR.
3. **Costs.** NR.
4. **Holding.** 1-Step Daily, 2-Step Bright may hold over weekends; Instant
   "cannot open or hold trades over the weekend, crypto included". Automated
   or "superhuman speed" tools prohibited (2025-09-24).
5. **Payout.** 80% (90% add-on); Instant 90%; 1-Step any day; 2-Step first at
   14 days, then 14; USDC or EUR bank.
6. **Reviewers.** Trustpilot: rating withheld (guidelines breach); 585
   reviews; 21% one-star; themes: payout held for extra identity checks;
   accounts breached around payout requests.

### 4.10 E8 Markets

1. **Rule.** Help (2026-05-14): copying allowed only between accounts "that
   belong to you"; "we also do NOT permit signal services"; teams may not
   copy. Policies (undated): "Cooperation with other traders - in any form -
   is not permitted"; third-party EAs allowed, one strategy per user.
2. **Crypto.** E8 One: classic crypto 1:1; perpetual futures BTC and ETH 1:15,
   other crypto 1:2 (search extract of the product page); platform NR.
3. **Costs.** NR.
4. **Holding.** NR.
5. **Payout.** Minimum $100; E8 One first at 3 days; E8 Pro: half of profit
   requestable, 80–100% of that half; median 11 h approval (help, Jan–May 2026).
6. **Reviewers.** Trustpilot: rating withheld (guidelines breach); 3,310
   reviews; 10% one-star; themes: risk-team deductions, "hidden rules". Finance
   Magnates (2026-04-21): E8 calls itself a "SaaS educational simulation
   platform".

### 4.11 HyperPnL (hyperpnl.com)

1. **Rule.** FAQ "Rules": "Copy trading is not permitted on HyperPNL
   evaluation or funded accounts"; accounts using copy services may be
   restricted or closed; multiple accounts not allowed. Bots: not addressed.
2. **Crypto.** "Powered by Hyperliquid"; own platform app.hyperpnl.com.
3. **Costs.** Crypto maker 0.015%, taker 0.045%.
4. **Holding.** News, overnight and weekend allowed; no consistency rule; daily
   loss 3%; max loss page states "5% static" in a heading and 9% in the text.
5. **Payout.** 80%; USDC by smart contract, "daily payouts, no approval
   queue"; no KYC.
6. **Reviewers.** No legal entity named. Trustpilot: 4.3, 23 reviews, newest
   2026-06-17.

### 4.12 MyFundedPerps

1. **Rule.** FAQ (undated): copying allowed within your own accounts;
   "Multiple traders may not coordinate trades, divide positions, mirror
   strategies"; a signal provider operating your account is prohibited;
   automation only through its documented API.
2. **Crypto.** Hyperliquid, Lighter, Binance, Ostium via its terminal; crypto
   24/7.
3. **Costs.** "0.03% for crypto"; hourly swap fees.
4. **Holding.** "On 23/5 markets, weekend trading and holding are not
   allowed"; 24/7 allowed; funded accounts: manual trades blocked 2 minutes
   either side of high-impact news; Elite daily 3%, max 5% static; no
   consistency rule.
5. **Payout.** Up to 90%; $100 minimum; one request per day.
6. **Reviewers.** "All evaluation and funded trading is simulated"; entity not
   on the page (a search extract names Funding Perpetuals Holdings, Inc., a
   Delaware company: unconfirmed). Trustpilot: 4.7, 372 reviews, 5% one-star.

## 5. What reviewers and regulators say, across the group

- **Regulators:**
  - Belgium's FSMA (2024-03-07, its own page): prop trading firms "hold no
    authorization" to provide investment services; "the firm alone decides
    which trades it copies to a live platform". It names no firm.
  - The CFTC's case against the parent of My Forex Funds was dismissed with
    prejudice in May 2025 with sanctions against the CFTC (Finance Magnates,
    Willkie; press, not the order).
  - The5ers paused new US traders in February 2024 (Finance Magnates).
  - Finance Magnates reports (June 2026) a CySEC chair saying ESMA is "not
    currently engaged in any substantive discussions regarding retail prop
    trading": press, one report.
- **Industry payout rate:** Finance Magnates (2026-04-21) quotes a data
  provider on "more than 300,000 prop trading accounts from 10 firms": "only
  7% of participants ever received a payout". The original report was not
  read; treat as a press figure.
- **Trustpilot** gives a rating for FTMO, FundedNext, The5ers, Breakout,
  HyroTrader, MyFundedPerps, HyperPnL and Propr. It withholds one (guideline
  breach) for Finotive, CFT, BrightFunded and E8. Withheld is not proof of
  anything; it does mean the page's score cannot be used.
- **Payout disputes:** the clearest pattern in Trustpilot reviewers' accounts
  (unverified) is a payout cut or an account closed after a "risk" review, at
  Finotive, E8, CFT and BrightFunded. At Finotive it matches the firm's own
  terms (7.14, 7.17: the cycle's reward cut to 10% after a strike). None is a
  court finding.

## 6. Ranking, for this use

The use: by hand, after a delay, following public Hyperliquid traders in
crypto, held hours to days. First criterion: the firm's own text. Second:
how well the account fits (venue, coins, holding, drawdown, payout). The
ranking is for this use only.

| Rank | Firm | Why |
|---|---|---|
| **1** | **Propr** | The only text read that permits copying from an external account into one account; automated trading permitted; prices and fees are Hyperliquid's own; weekends, news, holding and bots permitted; no minimum days, consistency or position cap; 80%, USDC, 24 h. Its limits: young, BVI, unregulated, simulated, 2x leverage on small coins, tight daily loss (3% or 5%), "no appeal" |
| **2** | **MyFundedPerps** | Perps incl. Hyperliquid, 24/7 crypto, no consistency, automation via API, up to 90%. Silent on following public traders; its "mirror strategies" line is about coordination; needs a written answer. Weekend holding fine on 24/7 markets |
| **3** | **FTMO** | CFD rules do not forbid copying in any page read, and its Swing account allows weekends; but its futures rules do, the multi-account FAQ names signal groups, the contract was not read, and crypto leverage is 1:3.3 or 1:1 (which of the 38 small coins are listed: NR). Largest, best-reviewed firm; needs a written answer |
| 4–12 | **Excluded by their own text** for this use: Breakout, HyroTrader, HyperPnL (one plain line each); Finotive (plain line plus a proof-of-ownership clause, and payout cuts in reviews); BrightFunded, E8, CFT, FundedNext, The5ers (account- or signal-level wording; none allows) | If the owner wants to keep one of them, only its support can say whether public-address following by hand is outside the rule; the owner's stated aim is a firm whose rules need no such question |

Among the excluded, the order by distance from a by-hand follower: FundedNext,
CFT, E8, BrightFunded and The5ers speak of accounts, copiers and signal
services; Breakout, HyroTrader and Finotive speak of ideas and traders.

## 7. What the owner would check on a shortlisted firm

**Before paying anything (all firms):**
1. **The rule in writing.** Ask support the same question and keep the
   reply: "May I place trades by hand, from my own decision, after seeing the
   public on-chain positions of other Hyperliquid addresses? No copier, no
   signal service, no contact with those traders." Ask whether the external
   account must be the trader's own.
2. **The rules as of the purchase date.** Save the terms and rulebook (date
   and version) when buying; Propr's changelog has six entries since
   2026-02-25.
3. **Eligibility and KYC** for the owner's country: the firm's restricted
   list and its KYC; payouts depend on it (Propr cl. 2.2; Finotive 12.2).
4. **What the money is.** The funded account is simulated; the payout is a
   reward the firm chooses to pay; read the clause on who decides.

**Specific to Propr:**
5. The rulebook-versus-terms disagreement on own-account copying: ask which
   governs.
6. The live market list against the coins the followed traders use (small
   coins need more than $1M open interest and carry 2x leverage).
7. How its fills compare with Hyperliquid's at the moment of a follow (A-book
   or B-book is its choice, trade by trade).
8. The drawdown model (1-step static or 2-step trailing; daily loss 3% or 5%)
   against the followed trader's own drawdowns, once COPY-H has them.
9. Stop-loss and take-profit reliability (reviewers report bugs; Propr says it
   is in beta) and its reset or refund policy.
10. The payout: all positions closed first; full sweep only; time to first
    payout in practice.

**Specific to MyFundedPerps and FTMO:** the two written answers of point 1, the
contract text (FTMO's account terms; MyFundedPerps' terms of use, not read),
and for FTMO the Swing account's crypto leverage and the coin list.

## 8. What is unknown

- Whether any firm treats by-hand following of a public address as copying: no
  page read says.
- Propr's live asset list against the 38 coins; its spread; its price source
  in detail; its terms beyond Annex 2, 3.3, 8.11, 2.1, 17.
- FTMO's account terms; swap and spread on crypto at FTMO, FundedNext, The5ers,
  BrightFunded, E8.
- Whether a payout dispute exists at Propr, HyperPnL or MyFundedPerps (few
  reviews; none read in a regulator's record).
- Breakout's main site (403), MyFundedCapital (403; a third-party blog said
  it permits copying, which no page of its own confirms), Upscale (the
  terms page returned 404; the home page names no entity and no copying rule),
  FTMO's account terms (404).
- Alpha Capital, Funding Pips, Blue Guardian, Fintokei, OANDA Prop Trader,
  Topstep, Kraken Funded were not read; third-party search extracts say
  Alpha Capital bans third-party signals.

## 9. Pages read (2026-11-25, 13:00–13:16Z)

- **Propr:** `propr.xyz` (home, `/rules`, `/terms`, `/faq`). Review sites:
  `fundedtrading.com/propfirm/propr/` (checked 2026-09-30); Trustpilot.
- **Finotive:** `help.finotivefunding.com/en/articles/955-...`,
  `finotivefunding.com/terms-and-conditions` (the first 100,000 characters
  for rules, the rest for payouts).
- **FTMO:** `ftmo.com/en/forbidden-trading-practices/`, `/en/futures/forbidden-trading-practices/`,
  `/en/faq/` (several articles), `/en/trading-objectives/`,
  `/en/trading-platforms/`, `/en/blog/ftmo-enhances-crypto-trading-...`.
- **FundedNext:** `help.fundednext.com` articles 8019805, 8925010;
  `fundednext.com/cfds/stellar-2-step`.
- **The5ers:** `the5ers.com/faqs/prohibited-trading-practices/`,
  `/copy-trading-in-forex/`, `/hyper-growth/`, the High Stakes leverage FAQ.
- **Breakout:** `intercom.help/breakoutprop` articles 10340652, 11647201,
  11647205, 11647195, 11647198, 11647220, 11647224; Kraken's
  `kraken.com/learn/best-crypto-prop-firms`.
- **HyroTrader:** `hyrotrader.com` home and FAQ trading-restrictions
  articles.
- **CFT:** `cryptofundtrader.com/faq`.
- **BrightFunded:** `help.brightfunded.com` articles 9241709, 9241704,
  18457249, 18457137.
- **E8:** `intercom.help/e8` articles 9453469, 6929927.
- **HyperPnL:** `hyperpnl.com`, `hyperpnl.gitbook.io/docs` (FAQ rules, 1-step,
  fees).
- **MyFundedPerps:** `myfundedperpetuals.com` and `/faq` (the first 100,000
  characters).
- **Regulators and press:** `fsma.be` (2024-03-07); Finance Magnates articles
  on The5ers (2024-02-16), E8 (2026-04-21), the CFTC case; Willkie.
- **Trustpilot** pages for each firm (user reviews).
- **Also read for context only:** forex firms' help articles showing the same
  norm: Take Capital (2026-09-07), Aurex Funded (2026-09-04).

## 10. For the supervisor: questions, each with a recommendation

1. **Shortlist Propr alone, subject to its written answer?** Recommended: yes.
   It is the only firm whose own terms permit the use; the owner sends the
   section 7 question before any fee.
2. **Send the same question to MyFundedPerps and FTMO?** Recommended: yes, as
   the fallbacks, because both are silent rather than against.
3. **A small read-only follow-up on Propr** (its live asset list against the 38
   coins; its terms beyond the clauses read; a price comparison with
   Hyperliquid through public pages only)? Recommended: yes, before the owner's
   talk on where to act, as HL-FOLLOW-FACTS did for Finotive.
4. **Hold the account-level test** (drawdown, leverage caps, daily loss
   against a followed trader's path) until COPY-H has said a clear yes?
   Recommended: yes, under the stop rule; Propr's costs equal Hyperliquid's
   base tier, so COPY-H's +10 bps bar needs no change for Propr.
5. **Read more firms?** Recommended: no; add Alpha Capital, Funding Pips or
   others only if Propr, MyFundedPerps and FTMO all fail the written answer.

Session record: 13:00Z start; the supervisor's files read first (decisions
2026-11-12 and 2026-11-25, FABLE-REVIEW M4, the paper plan's Finotive
facts); notes kept in the scratchpad; no program run, no data touched, nothing
pushed.
