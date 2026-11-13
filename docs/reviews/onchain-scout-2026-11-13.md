# ONCHAIN-SCOUT — is there a testable market pattern in public on-chain data?

ONCHAIN-SCOUT (Fable 5.2, max), 2026-11-13 22:02Z – 22:52Z (UTC; every stamp
from `date -u`), for polymarket-follow's supervisor: the broad desk research
that decisions 2026-11-13 ("two outside researches") asked for. Evidence: the
supervisor folder `workers/ONCHAIN-SCOUT/` (`progress.md`; `evidence/`, the
scripts and output of one chart's reading). **A review decides nothing.** It
proposes data, tests and tools, never trades.

**The limits held.**
- Desk research only: public documentation, terms, GitHub repositories and
  studies, read through a page reader and a search engine.
- No API call to any explorer, chain, indexer or exchange. No account, no
  key, no dataset downloaded. Two studies' PDFs, saved by the page reader,
  were read with a local text extractor (E31, E37); one chart's plotted
  lines were read from its PDF with a short script (E31).
- Searches used generic words only: no project name, nothing about the owner.
- Never opened: the recordings, the collector's database, the run folder,
  the paper experiment's and MARKET-1's data.
- From the repository: the docs the brief lists; PAPER-PLAN's section 4
  (the venues' costs); and `apps/poller/` from above — the file list;
  `admission.ts` and `waves.ts` in full; the first lines of the other
  files named in section 4.3; the kit's export names; MARKET-1's
  `rules.md`, M4, M5, M10 and M11.
- In the supervisor folder I opened only my own. No agent started;
  polymarket-lab not touched; nothing in the repository changed but this file.

**How to read the marks.** Every fact about a platform, an API, a dataset or
a study carries a source number (E1–E50, the evidence list in section 10,
each with its URL; all read 2026-11-13).
- **[P]** = verified from the primary source: I read it on the source's own
  page.
- **[T]** = stated by a third party, or known to me only through a search
  engine's summary. Not read at the source.
- The page reader returns a summary with short quotes. Where a sentence
  matters it is quoted. What I could not read is said so.

## For the owner, in one page

*Words.* **On-chain data** is the public record of a blockchain: every
transfer, and every event a program (a "contract") writes. An **explorer**
(Etherscan) and an **indexer** (The Graph, Dune) are services that search it.
A **lending protocol** (Aave) lends against collateral. A **liquidation** is
the protocol selling a borrower's collateral by force when its value falls
too low: the on-chain twin of the forced closes behind our wave. A **token
unlock** is a date, known in advance, when locked tokens become sellable. A
**bp** is 0.01%. A **taker** trades at once and pays the fee and the spread.
**Small coins** are every crypto coin but BTC and ETH. **Exploring** means
measured on data already seen: it describes, it never decides.

**1. The answer: yes — a small new project is worth founding, for one
reason, and with a cheap exit.**
- **The reason.** On-chain, the forced flows that gave us our only lead are
  public, complete, exact to the second, free, and six years deep. On
  Polymarket Perps we see perhaps a twentieth to an eighth of the
  liquidations, over 68 days (MARKET-FIND). On Aave, one of the largest
  lending protocols (E31), every liquidation since 2020-12-03 is one line
  in a public log (E26–E30).
- **What that buys.** The wave idea can be put to a history test in weeks,
  across rising and falling years, instead of waiting until May for
  MARKET-1 alone. Either answer is worth having: a second, independent
  sighting, or a sign that the wave belongs to one venue and one autumn.
- **What on-chain will not give us:** a way around the copying lesson.
  Copying "smart money" wallets is the same idea with higher costs and
  worse traps. A 2026 study of meme-coin copy trading describes bots built
  for "extracting value from naïve copiers at scale" (E40).
- **My honest expectation.** Any single test here is more likely to end in
  "nothing" than in a pass. The project is worth founding because the first
  test is cheap (free data; about four to six working sessions to a history
  answer) and because the method to run it already exists.
- **The cheap exit.** The first step only counts events, with no price in
  sight. If there are too few, the project stops there, having cost a day.

**2. The best three directions**
1. **Liquidation waves on lending protocols** (promise: medium; cost: low).
   When several borrowers are liquidated in a small coin within an hour,
   does the coin come back over the next day, and by more than after an
   equal fall without liquidations? It is the closest thing on-chain to our
   wave. Free data from 2020.
   - **One academic paper studies exactly these waves**, with the same
     one-hour rule (E31). By my reading of its one chart of the days
     after 227 large waves, the typical coin fell about 4.5% within
     minutes and regained about half of that within a day. The lower
     third regained little.
   - **That is a chart, not a test:** no baseline, no costs, waves chosen
     by their final size, mostly ETH, ending in 2022. I found no published
     honest test (E31–E34).
2. **Token unlocks** (promise: low to medium; cost: medium). The dates are
   known in advance, so speed does not matter. Two vendors' studies report
   prices falling into large unlocks (E35, E36); one of them warns that
   most of the raw fall is the market's and the token type's, not the
   unlock's, and a 2026 backtest found a plain short not tradable after
   costs. Its likelier use is as a warning beside other positions. It
   needs a paid or hand-kept calendar, recorded day by day from now on,
   because a vendor's history is rewritten afterwards.
3. **Stablecoin mints and burns** (promise: low to medium; cost: low). New
   dollars entering crypto, read from two or three contracts. The published
   studies disagree (E37–E39), and the target is BTC and ETH, where our own
   data showed nothing. It is cheap enough to run beside direction 1 with
   the same tools.

**Not recommended:** copying "smart money" or whale wallets; trading on
large swaps on decentralised exchanges; bridge flows; and above all
**new-token launches**. Reports class about half of the tokens on one large
decentralised exchange, and 98.6% of those on one launchpad, as scams or
pump-and-dumps (E43).

**3. The first study I would freeze: LEND-WAVE-1** (section 3.2, rules
L0–L12)
- **The event:** a liquidation on Aave V2 or V3 (Ethereum) of a small-coin
  collateral against a dollar debt of $1,000 or more.
- **The wave:** two or more different borrowers liquidated that way, in
  small coins, within 60 minutes. This is MARKET-1's rule, word for word
  where it can be.
- **The paper position:** $1,000 long that coin on Binance futures, at the
  first one-minute price two minutes later, held 24 hours. A taker's fee
  and a spread allowance on both sides; funding paid.
- **Judged twice:** by the money after costs; and against matched minutes of
  the same coin that had fallen as much in the last hour **without** a
  wave. So neither the market's drift nor a plain bounce after a fall can
  pass as the effect.
- **The order of work:** count the events first, with no price in sight;
  freeze; a fresh review; one look at the older years; one look at the
  newer years, which the search never touched; then a forward paper test
  like MARKET-1.

**4. What is reusable from here** (section 4)
- **The whole method and the docs system.**
- **Code, copied and never shared:** the request budget; the REST client's
  frame; the recorder; the Zod boundary; the kit's statistics; the wave
  detector (it fits on-chain liquidations nearly as it is); MARKET-1's
  two-way error and verdict; the freeze tool and the gate; the deploy and
  task scripts; the test and deliberate-break discipline.
- **Left behind as Polymarket-specific:** everything about fills, style
  labels, boards, the cost table and the copy logic.

**5. The key decision you face: a free, read-only data key**
- This project's Iron Rule 1 allows only keyless reads. The cheap, reliable
  road to the events is a **free key** from an explorer (Etherscan: 3 calls
  a second, 100,000 a day, licensed for "Personal & Research use"; E2, E4)
  and, as the independent second path, a free key from The Graph (100,000
  queries a month; E11). Each needs an account that **you** create.
- Such a key reads public data only. It cannot hold or move money. The new
  project's first rule would read: no wallet, no private key, no code that
  can sign or send a transaction; read-only data keys in `.env` only.
- **My recommendation: allow free read-only data keys in the new project,
  and no paid data for the first study.** Read Etherscan's API terms before
  signing up (E5: no bulk copying of "our datasets", no AI training on the
  data). The study needs one event type of two contracts: some tens of
  thousands of rows, about a hundred calls. That is far from a copy of a
  dataset, but the reading is yours to make.
- **The price files have terms too** (E18): Binance permits "historical
  backtesting for purely personal non-production research" and forbids
  "live proprietary trading execution". The history study fits; a live
  tool would need another price source (section 1.4).
- A keyless road exists too (Etherscan's keyless tool server, a public
  node; section 6). Its limits are unpublished, and I would not build a
  recorded study on it.

**6. Your three next steps**
1. **Decide the key question** above. If yes, create the two free accounts.
2. **Approve the small checks** (section 6): first your own reading of two
   sets of terms; then three keyless looks at Binance's public price
   files, a few calls with the free key, and a few queries to the second
   source. Together they prove that the events and the prices exist as
   described, before anything is founded.
3. **Have the new project founded and its counting step run** (events only,
   no prices): how many liquidations and waves there are, by coin and by
   year. That count decides whether LEND-WAVE-1 runs as written, is
   widened, or is dropped — before anyone sees a result.

---

## 1. The data sources (question 1)

### 1.1 What I found, in short

- **An explorer's indexed log search is the cheap road to a sparse event**
  (liquidations, mints) over a whole history: one address, one event type,
  up to a thousand rows a call on the free plan (E7, E8). A public node
  answers the same question only in small block ranges. Ethereum has made
  about 15 million blocks since December 2020 (my arithmetic from
  12-second blocks), so one event's history costs 15,000 calls at 1,000
  blocks a query and 300,000 at 50 (E20).
- **Free tiers are narrower than their reputation.**
  - Etherscan's free plan is 3 calls a second and leaves out BNB, Base, OP,
    Avalanche and Gnosis; its changelog dates several cuts to 2026 (E2, E3,
    E8) [P].
  - Dune's free plan can no longer run a query or use the API (E13) [P]; a
    press report dates that change to July 2026 [T].
  - DefiLlama keeps unlocks, bridges and liquidations behind $300 a month
    (E14) [P].
- **Labels are the expensive part everywhere** (which address is an
  exchange, a fund, "smart money"): Etherscan's address labels need its
  $899-a-month plan (E4, E6) [P]; Nansen sells them by credits (E22) [P];
  Arkham's API is by application (E23) [T].
- **Prices are not an on-chain problem.** An exchange's public files give
  one-minute prices for every listed coin, keyless, with checksums (E18)
  [P].
- **The chain can always be read again; what surrounds it cannot.** Event
  history is permanent. Unlock calendars, address labels and order books
  are rewritten or lost, so they are what a recorder must keep from day
  one.

### 1.2 The table of sources

Access and price are as published on 2026-11-13. "Not read" means I did not
open that page; it is not a claim that nothing is there.

| Source | Chains | What it gives | History | Access, limits, price | Terms for personal research | Cheap for — and what it cannot do |
|---|---|---|---|---|---|---|
| **Etherscan API V2** (E1–E8) [P] | "50+ EVM chains under one key". Free plan: Ethereum, Arbitrum, Polygon, Linea and most small chains. **Paid only:** BNB, Base, OP, Avalanche, Gnosis, Robinhood Chain, Arc; HyperEVM from 2026-12-01 | Free: an address's transactions, internal transactions and token transfers; event logs by address and topics; contract ABI, source, creator; block by time; node proxy calls. Standard plan and up: token holders, past balances and supply, daily statistics, "funded by". Pro Plus only: address labels | Not stated in the docs; their own log example starts at block 0 | A key from a free account. Free: 3 calls/s, 100,000/day; its record limit is 1,000 since 2026-07-01 (it was 10,000). Lite $49 a month (all chains, 5/s); Standard $199; Advanced $299; Professional $399; Pro Plus $899 | Free, Lite and Standard are "licensed for Personal & Research use only". Forbidden: "Bulk-download, mirror, replicate or archive our datasets", a competing service, sharing the key, AI training. No attribution needed "for purely private use" | **Cheap:** the whole history of one sparse event; one address's transfers; ABIs. **Cannot (free):** holders, past balances, labels, five large chains. Not a bulk source |
| **Etherscan's keyless tool server** (E9) [P] | 50+ chains | 16 read-only tools: logs by address and topics, transactions, transfers, ABI. No paid tools | — | No key, no account. "Limited tools and rate limits"; the numbers are not published | Not described on the page | A few checks without an account. Not a base for a recorded study |
| **Blockscout PRO API** (E10) [P] | "All 100+ supported chains" with one key (the list not read) | An explorer API | Not read | Free key: 5 requests/s, 100K credits a day, 20 credits a default call (about 5,000 calls a day). Builder $49 a month; Pro $199. Without a key, on one explorer instance: 300 requests a minute per IP by default; scripted requests may get a 403 | Not read | A candidate for the chains Etherscan's free plan dropped; per-chain coverage not checked |
| **Public RPC nodes** (E20) | Any chain | Raw node calls: logs by filter (`eth_getLogs`), blocks, receipts, contract reads | Whole chain only where the endpoint keeps archive data; one public endpoint serves recent blocks only without a token [T] | Keyless. Each caps `eth_getLogs`: 50 blocks, 1,000 blocks, or 10,000 results a query on three public endpoints [T, a vendor's guide of 2026-06-30] | Each provider's own; not read | **Cheap:** the live tail of an event; one contract read. **Cannot:** a history pull without tens of thousands of calls |
| **Node providers' free plans** (E20) | Many | The same node calls | Archive | A key. Alchemy Free: the `eth_getLogs` range "is small" (no number given) [P]; pay-as-you-go 10,000 blocks [P]. QuickNode Free: 5 blocks on one chain's page [T] | Not read | Not for history on a free plan |
| **The Graph: Aave's official subgraphs** (E11, E12) [P] | Aave V2: Ethereum, Polygon, Avalanche. V3: Ethereum and more than twenty networks | The protocol's own entities by GraphQL: liquidation calls (collateral and debt asset, amounts, USD prices at the event); user balances; reserves. "You can query for historical data by specifying a block number" | From each deployment | A free Subgraph Studio account and key. "100,000 free monthly queries", then "$2 per 100,000 queries". 100 items a query by the README | Not read | **Cheap:** the independent second path to liquidations; positions at a past block. **Cannot:** anything the subgraph's author did not index |
| **Dune** (E13) | Many | SQL over decoded tables | — | "Free access is now view-only and does not include query execution on any engine" [P]. A 7-day trial with 2,500 credits [P]. API on trial and paid plans only [P]. Export: 10 credits a MB (Analyst), 2 (Plus) [P]. Analyst about $75 a month, Plus $399 [T] | Not read | Viewing public dashboards. One paid month could pull many protocols at once |
| **DefiLlama API** (E14) [P] | Everything it tracks | Free: locked value, a token's price at a timestamp, stablecoin supply history, yields, exchange volumes, fees. Pro: unlocks ("emissions"), bridges, liquidations (a daily metric), inflows, ETFs, derivatives | Not stated | Free: "no authentication required"; limits not stated. Pro: $300 a month | Not stated in the API docs | **Cheap:** daily stablecoin supply; a price for a token with no exchange listing. **Cannot (free):** unlocks, bridges, anything event by event |
| **AWS Public Blockchain Data** (E15) [P] | Bitcoin, Ethereum, Arbitrum, Base, BNB Chain, Hyperliquid, Aptos, XRP Ledger, TON, Stellar, Cronos, Provenance, Lighter | Whole-chain tables as Parquet files by date (the tables are not listed on the page) | Not stated | "No AWS account required"; free | The licence linked on the page; not read | **Cheap:** bulk work (every swap of a pool). **Cannot:** one sparse event cheaply — whole days must be downloaded |
| **Google BigQuery public datasets** (E16) [P] | 15 datasets listed: Bitcoin, Ethereum (two), Arbitrum, Avalanche, Cronos, Optimism, Polygon, Tron, Base, Solana, Aptos and three small chains | SQL over whole-chain tables | Not stated | A Google Cloud account. The page is marked Preview. The pricing page did not load for me: not verified | Google's; not read | SQL over large tables with no download. Cost of a full scan unknown |
| **cryo** (E17) [P] | Chains its library supports | A tool: extracts logs, blocks, transactions, traces and transfers from a node to Parquet, CSV or JSON; filters by contract and topic | What the node serves | Free software (Apache-2.0 and MIT). Needs a node. Its README warns the defaults "will slam a node too hard" | — | A ready extractor where a node is at hand; nothing without one |
| **SQD Portal; Envio HyperSync** (E21) [P] | "110+ networks"; "81+ EVM chains and Fuel" | Filtered streams of logs and transactions | Not stated | SQD: a public Portal with "shared capacity for development and evaluation"; key and limits not stated. HyperSync: an API token; price not on the page | Not read | Possible fast second paths; unverified beyond their landing pages |
| **Labels: Nansen; Arkham** (E22, E23) | — | "Smart money" and entity labels; wallet histories | — | Nansen [P]: Free has 100 trial credits, then a daily top-up to 10; Pro $49–69 a month; a label call costs 10–50 credits, a smart-money call 5. Arkham [T]: API by application | Not read | Nothing an honest history test can use, unless each label carries the date it was given |
| **Tokenomist** (E24) | "500+ crypto assets" [P] | Unlock calendars, vesting, allocations | By plan, one to two years back [T] | API on paid plans: $249.95 and $449.95 a month [T] | "Personal or non-commercial, non-redistribution use only" [T] | The unlock direction's calendar |
| **Coin Metrics community API** (E25) [T] | 140+ assets | Daily network metrics | Limited | Keyless; 10 requests per 6 s per IP | A Creative Commons licence | Daily series only; whether exchange flows are in the free set is not confirmed |
| **Binance public data files** (E18) [P] | An exchange, not a chain | Spot and futures: klines from 1 second (spot) and 1 minute, trades, aggregated trades; daily and monthly zip files, each with a checksum file | Start not stated in the README; a community tool reports futures files from 2019-09-25 [T] | Keyless downloads; posted rate limits must be followed | "Binance Vision Dataset Terms", version 1.0, "last updated August 26, 2026": CC BY-NC-SA 4.0 with added limits. Permitted: "academic research", "algorithmic historical backtesting for purely personal non-production research". Forbidden: "live proprietary trading execution, automated commercial order generation", paid signals, scripts "designed to circumvent rate restrictions" | Honest one-minute prices for a history study. Funding files and delisted symbols are to be confirmed (check C2). Not a price source for a live tool (1.4) |
| **Hyperliquid** (E19) [P] | Its own chain | Archives: book snapshots, asset contexts; node files: fills by block, trades, other events | Not stated | "The requester of the data must pay for transfer costs". Updated "approximately once a month"; "no guarantee of timely updates and data may be missing" | Not read | WAVE-ELSEWHERE's ground. Named here as a source only |
| **Solana** (E48) | Solana | Account transactions, program logs | Archive at providers | Public RPC: 100 requests per 10 s per IP, 40 for one method [T; the page answered 429 to me]. Helius Free: 1M credits a month, 10 requests/s, archival data [P] | Not read | Later. Lending liquidations there need each program decoded; not designed here |

**Not checked, named only:** Tron (where most USDT is said to live), Bitcoin
explorers, Flipside, Bitquery, Covalent, Moralis, Allium, CoinGecko,
Glassnode, CryptoQuant, Whale Alert.

### 1.3 Which questions each answers cheaply

- **"Give me every liquidation of one protocol since it began."** Etherscan
  free key, or The Graph free key. About a hundred calls by the published
  counts (2.1); the exact count is the first check's job. This is the
  first study's need.
- **"Give me every mint and burn of one stablecoin on Ethereum."** The same
  two. Tron needs another source, not checked.
- **"What did this coin cost at this minute?"** Binance's public files, for
  a coin listed there. DefiLlama's free price endpoint for one that is not.
- **"Which address is an exchange?"** Nobody answers this free and dated.
  It is the costly part of any flow study.
- **"Every swap of every pool"** or **"every trade of every wallet."** Only
  bulk sources: AWS's open files, BigQuery, or a paid month of Dune. Days
  of work before the first number.
- **"When does this token unlock, as it was known on that day?"** No free
  source. A paid calendar, or one's own daily record from now on.

### 1.4 The terms, in plain words

- **Etherscan** (E5 [P]; its API Terms of Service, "Last updated: 1 October
  2026").
  - "The Free, Lite and Standard Plans are licensed for Personal & Research
    use only." The definition's proviso: "the use does not generate
    revenue, does not support a revenue-generating product or service".
  - Among the prohibited activities: "Bulk-download, mirror, replicate or
    archive our datasets"; a service that competes with Etherscan's;
    sharing the key.
  - An AI section: by the reader's summary, API data may feed runtime
    features and "agentic workflows", and may not be used to train,
    fine-tune or evaluate AI models. I could not have that section copied
    word for word.
  - "Attribution is not required for purely private use that is not
    displayed or made available to any other person."
  - Etherscan may "limit, throttle, or disable access to the API Service
    for Free Plan users at any time".
  - **My reading, not legal advice:** a private, unpaid study that keeps
    one event type of two contracts (some tens of thousands of rows) as
    its evidence is the use the free plan is licensed for. Keeping a
    mirror of whole datasets is not. The owner reads the terms before
    signing up (section 6, C5).
- **Binance's public data files** (E18 [P]; "Binance Vision Dataset Terms",
  version 1.0, "last updated August 26, 2026").
  - The licence is CC BY-NC-SA 4.0 with added limits. "Permitted
    non-commercial uses are limited to academic research, non-monetized
    open educational projects, algorithmic historical backtesting for
    purely personal non-production research, and non-commercial
    open-source data science evaluations."
  - "You shall not use the Datasets for live proprietary trading execution,
    automated commercial order generation, or signal distribution to third
    parties for direct or indirect compensation."
  - No scripts "designed to circumvent rate restrictions".
  - **My reading, not legal advice:** the history study is "historical
    backtesting for purely personal non-production research", which is
    permitted in so many words. A paper test that only records results is
    close to it. A live page the owner acts on is not clearly covered, so
    a live tool should take its prices from the venue where the owner
    holds an account, under that venue's own terms.
- **The others.** I read prices and limits, not the terms, of Blockscout,
  The Graph, Dune, DefiLlama, AWS and Google. Each is read before its first
  call, as this project does with external-apis.

## 2. The patterns (question 2)

Each pattern below has the same five parts: why it might work; what our own
results suggest; the data and its cost; the honest test; the traps. "Our
results" are polymarket-follow's (E49): copying lost about a round trip's
cost however it was cut (R8, FIND-1 to FIND-6-EXITS), and the one lead is the
liquidation wave in small coins (MARKET-FIND, exploring).

### 2.1 Lending liquidations — the forced flow closest to our wave

**Why it might work**
- A liquidation is a forced sale. On Aave "Liquidators can repay up to 50%
  of the user's total debt", and all of it once the borrower's health
  factor "is at or below 0.95" (E29) [P]. The liquidator takes the
  collateral at a discount.
- The collateral is sold at once: "To repay flash loans, arbitrageurs
  immediately sell the collateral asset" (E31) [P].
- **One paper studies exactly these waves.** Lehar and Parlour (BIS Working
  Paper 1062; I read its version of 18 May 2023) observe "42,324
  liquidations from September 25, 2018 to May 16, 2022 comprising 27,466
  liquidations on Aave and 14,858 liquidations on Compound". They "define
  a liquidation to be part of a wave if it occurs less one hour after a
  previous liquidation of the same collateral token" and "find 1,028 waves
  that involve at least 5 liquidations each". "Liquidation waves are
  common." (E31) [P]. Their hour is our hour.
- **What it finds within minutes.** "A temporary and permanent price impact
  of collateral asset sales in DeFi": "38.7% of the price movement of swaps
  that liquidate collateral persist for the medium term" (five blocks
  later), so about three fifths comes back within a minute or two.
  Arbitrageurs "are neither immediate nor do they completely reverse the
  liquidity trades", and the fall spreads to other exchanges, Binance
  included (E31) [P].
- **What its one chart of the following days shows — my reading of a
  figure.** Figure 8 plots the collateral's return around "227 liquidation
  waves with at least 20 individual liquidations". I read its plotted lines
  from the PDF's drawing commands (the script and its output are in my
  folder). Against the price at the wave's start:
  - the median line stands at −4.4% after one hour, −2.1% after 24 hours
    and −1.1% after 48;
  - the upper-third line at −2.5%, +0.3% and +1.6%;
  - the lower-third line at −6.3%, −5.3% and −5.8%.

  So the fall comes within minutes of the wave's start (the median line is
  at −4.5% four minutes after it). The typical coin then regains about
  half of the fall within a day and three quarters within two; the lower
  third regains little. The authors' own sentence on the chart is that
  "deleveraging leads to lower prices".
- **A single sale moves little; a wave moves the price.**
  - In 18,305 liquidations whose collateral was sold in the same
    transaction, "the average collateral price decline led by the 18,305
    short liquidations is 0.38%", "while the maximal decline reaches
    26.90%", on the exchange where it was sold (Qin et al., 2023; E33) [P].
  - Lehar and Parlour: "For single liquidations … the price impact of
    liquidating swaps are inconsequential." Yet: "For large liquidation
    waves with at least 100 liquidations on average 10.93% of available
    liquidity reserves get liquidated", and in waves the sales make "a
    significant contribution to the overall price movement of the
    collateral token" (E31) [P].
  - It is the same split as MARKET-FIND's: a liquidation alone showed
    nothing, a wave did. There is one difference. On Polymarket the
    liquidation only marked the moment. Here the forced sales are part of
    the fall itself, which is a reason for some of it to come back.
- **What is missing.** That chart is not a test.
  - It has no baseline: what a coin does after an equal fall without
    liquidations.
  - It has no costs, and its prices are from decentralised exchanges.
  - Its waves are chosen by their final size, which nobody knows at their
    start.
  - Its lines are quantiles at each hour, not the path of any one wave.
  - It is mostly ETH, and it ends in May 2022.

  I found no study that tests the next day's return against a baseline
  (E34). A data vendor's blog says spikes are "followed immediately by
  market rebounds", with no sample, hit rate or baseline (E34) [T].

**What our results suggest**
- **For:** the wave. In small coins the price came back +310 ± 68 bps over
  24 hours after two or more tracked accounts were liquidated within an
  hour; a liquidation outside a wave: +22 ± 35; a 4% move of the small
  coins in four hours with a wave: +247 ± 69, without one: +37 ± 74
  (MARKET-FIND, exploring).
- **Against:** BTC's and ETH's own liquidations showed nothing, and on
  lending protocols ETH leads: of 38,414 priced liquidations, 19,487 were
  of wrapped ETH, against 5,583 of LINK, 1,419 of UNI, 1,070 of AAVE, 611
  of YFI, 371 of COMP and 286 of xSushi (E31, Table 1) [P]. So the direct
  twin is the small-coin collateral: about a quarter of the events, and
  more than half of those are one coin, LINK.
- **A difference in kind.** On Polymarket the liquidated are leveraged
  traders, seen through a sample of accounts. On Aave they are borrowers,
  and we see all of them. Whether the marker carries the same information
  is the question the test asks.

**The data and its cost**
- **The event:** `LiquidationCall` on Aave's pool contracts, with the
  collateral asset, the debt asset, the borrower, the debt repaid, the
  collateral taken and the liquidator (E26, E28) [P]. Its block gives the
  time to the second.
- **The contracts:** Aave V3 Ethereum's pool is
  `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2`; Aave V2's is
  `0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9` (E27) [P]. V2 went live on
  2020-12-03 and V3 on Ethereum on 2023-01-27 (E30) [T].
- **How many:** not known for the two pools as a whole. Published counts
  set the scale.
  - From 25 September 2018 to 16 May 2022: 27,466 liquidations on Aave and
    14,858 on Compound; a mean size of USD 64,756 and a median of USD
    3,586; 2,007 loans liquidated on the largest day, 19 May 2021 (Lehar
    and Parlour; E31) [P].
  - To the end of April 2021: 28,138 liquidations on five protocols, of
    which 1,039 on Aave V2 in its first five months and 6,766 on Compound
    (Qin et al.; E32) [P].
  - From 1 May 2019 to 30 September 2022: 48,364 liquidations, of which
    **25,576 on Aave V2**, 5,765 on Aave V1 and 17,023 on Compound; 2.32B
    USD of collateral released, with a monthly peak of 653.11M USD in May
    2021 (Qin et al., 2023; E33) [P].
  - 25,798 liquidations on Aave from March 2022 to December 2024 (E34)
    [T].
  - Small coins are among them. In the week of 19 May 2021 about $310M was
    liquidated on Aave, and the share of a coin's supply liquidated was
    largest for YFI (5.6%), ahead of WBTC (3.2%), LINK (2.4%) and WETH
    (2.3%) (Gauntlet's retrospective; E50) [P].
  - That order of size means about a hundred calls at a thousand rows
    each. How many waves of small coins there are on Aave alone, by our
    rule, and on how many days, is the counting step's job.
- **Cost:** a free explorer key, or a free The Graph key; no paid source.
  Prices from Binance's public files, keyless (E18).

**The honest test:** section 3.2.

**The traps**
- **The bounce after any fall.** Published work reports next-day reversal
  among small, illiquid coins and momentum among the largest (E45) [T]. A
  liquidation happens *because* the price fell, so the baseline must be
  matched on the fall.
- **A few crash days carrying everything.** Count days, not events.
- **Dust and repeats.** One borrower is liquidated in parts; bots sweep
  tiny positions. Count different borrowers above a size floor.
- **Loops that are not a bet on direction:** staked ETH against ETH, a
  stablecoin against a stablecoin. Count only a volatile collateral against
  a dollar debt.
- **A stablecoin off its peg** (March 2023) breaks "a dollar of debt".
- **Coins that left:** delisted futures, renamed tokens. A coin with no
  tradable future at the event's time is counted as such, never dropped
  silently.
- **Look-ahead in the clock:** the entry is the first minute that starts at
  least 120 seconds after the block's time.
- **The oracle's delay.** A liquidation follows the protocol's price feed,
  which follows the market. The event is late by design: harmless for a
  24-hour hold, fatal for anything in seconds.
- **A watched signal.** Liquidation totals are on public dashboards
  (DefiLlama carries the metric, E14), so part of any effect may already be
  traded away.

### 2.2 Large swaps and flows on decentralised exchanges

**Why it might work.** Every swap is public. Studies find that some flow is
informed: swaps that pay a high priority fee have a lasting price impact of
about 5 bps against about 0.5 for the rest, and the gap shrinks by a third
when same-block trades are left out (Capponi, Jia and Yu; E42) [T].

**What our results suggest.** Against. The lasting moves are single bps, as
in our own tape: a public print was followed by about +2 bps its own way
within ten seconds (code-rules, 2026-11-11), and joining an algorithm after
its fifth taker order lost about 10 bps at a taker's cost (FIND-7).

**The data and its cost.** Every swap of a pool is an event; a busy pool has
millions. That needs a bulk source (AWS's open files, BigQuery, a paid
month of Dune): days of work before the first number.

**The honest test.** Large swaps measured against the pool's depth; the
entry one block later at the pool's own price, with its fee and gas; the
baseline, random swaps of the same pool and hour.

**The traps**
- **MEV.** The large swap is often itself an arbitrage or one leg of a
  routed trade. A follower's own order can be sandwiched.
- **The swap is the price.** In a thin pool the move *is* the swap's impact,
  not information, and it is gone when the pool is rebalanced.
- **Wash trading** in small pools; tokens that cannot be sold.
- **Cost:** a pool fee of 5 to 100 bps a side plus gas, against 5 bps on a
  futures exchange.

**Verdict:** low promise, high cost.

### 2.3 "Smart money" and whale wallets — with our copying lesson

**Why people think it works.** Wallets are public, so a wallet that made
money can be listed and followed.

**What our results suggest.** It is our failed idea on another venue.
Traders' results did not persist from week to week (FIND-1: rank
correlation 0.066, p 0.51); no ranking rule picked better traders (FIND-6);
copying exits did not rescue it (FIND-6-EXITS); the edge that exists is
fast (#47 made 81% of its profit within two minutes of its fills).

**The outside evidence**
- I found no study testing whether followed wallets stay profitable out of
  sample (one search, 2026-11-13).
- A 2026 study of meme-coin copy trading says adversaries deploy
  "manipulative bots to front-run trades, conceal positions, and fabricate
  sentiment", "extracting value from naïve copiers at scale" (Luo et al.;
  E40) [P]. Its own defence earns a copier about 3% a coin; by a search
  summary, the plain methods lose (E40) [T].
- One vendor defines its "smart" traders as the top addresses by realised
  profit (E41) [T]: a ranking on the past, which is exactly what failed
  here.
- Where a wallet does know something, it is often an insider: a study put
  trading ahead of the announcement at 10–25% of one exchange's listings in
  2018–2022 (Félez-Viñas, Johnson and Putniņš; E46) [T].

**What, if anything, would make it different.** APPROACH-REVIEW's four
conditions: the leader's information lasts far longer than the copier's
delay; costs are small against the move; the leader is chosen by a rule
about its *kind*, not by past profit; nobody else crowds the trade.
- On-chain, one variant could meet them: wallets that **accumulate a coin
  over weeks**, chosen by a rule fixed in advance (how long they hold, how
  large they are), in coins that also trade on a liquid futures venue, so
  the follower pays 10 bps and not a pool's fee.
- It is costly to test: every holder's balance through time is a paid
  endpoint or a bulk job (E6), and I found no evidence for it. I rank it
  low until something cheaper has passed.

**The honest test.** FIND-1's gate again: form the list on window A by a
rule written first; measure on window B at a follower's price; the labels
rebuilt from raw trades as of each date, never a vendor's label of today.

**The traps**
- **Labels given after the fact.** "Smart" means "was profitable".
- **Survivorship.** Wallets that blew up leave the leaderboards.
- **One person, many wallets; one wallet, many people.**
- **Bait.** A wallet can be built to be followed, then sell into its
  followers.
- **The unseen leg.** An on-chain buy may be a hedge of a position on an
  exchange that we cannot see.
- **Cost and speed.** The copier pays the pool fee, slippage and gas, a
  block or more late.

### 2.4 Flows into and out of exchanges

**Why it might work.** Coins sent to an exchange may be about to be sold;
stablecoins sent there may be about to buy.

**The outside evidence**
- Chi, Chu and Hao (2017–2023, horizons of 1 to 6 hours): USDT net inflows
  to exchanges predict BTC and ETH returns positively; ETH net inflows
  "negatively predict ETH returns"; BTC net inflows mostly predict nothing
  (E37) [P, the abstract]. Earlier papers found that BTC inflows do
  forecast lower BTC returns (Hoang and Baur; E37) [T]. The literature is
  not uniform.
- **The size is small:** "US$ 100 million of USDT net inflows predict 0.11%
  of ETH return and 0.065% of BTC return in the next hour" (E37) [P, the
  paper's text]. That is 11 and 6.5 bps, about one taker's round trip, for
  a hundred million dollars of flow.
- Large transfers: mixed results. By one summary of a central-bank study,
  other wallets react within 15 minutes of a public whale alert (E47) [T].

**What our results suggest.** The target is BTC and ETH, where our data
showed nothing, and the published effect is the size of a taker's cost.

**The data and its cost.** The transfers are free. The list of exchange
addresses, dated, is not: Etherscan's labels are on its $899 plan (E4, E6).
A free daily series may exist at Coin Metrics (E25) [T, not confirmed].

**The honest test.** Net flow by coin and hour into an address list
**frozen at a date before the test window**; the next 1 to 24 hours against
matched hours.

**The traps**
- **Labels learnt later:** an address is labelled once it has become
  important, which leaks the future into the past.
- **Internal shuffles** that look like inflows (E47) [T].
- **Deposit addresses** unknown at the time.
- **A public signal:** alerts go out within seconds.

**Verdict:** low to medium promise, high cost because of the labels.

### 2.5 Stablecoin mints and burns

**Why it might work.** A mint is new dollars arriving to buy.

**The outside evidence**
- Ante, Fiedler and Strehle (565 issuances of seven stablecoins, April 2019
  to March 2020): "market downturns in the week before issuance" and
  "positive abnormal returns in the twenty-four hours around the issuance";
  size does not matter; insignificant for some coins (E38) [P, the
  abstract page].
- Griffin and Shams (Journal of Finance, 2020): purchases with Tether were
  timed after downturns and followed by price rises in 2017–2018 (E39) [T].
- Kristoufek (2021): "no evidence of stablecoins boosting the prices of
  other cryptoassets"; issuance reacts to prices (E39) [T].

**What our results suggest.** Again BTC and ETH. And "after a downturn" is
the same confound as in 2.1: mints follow falls, so the baseline must be
matched on the fall.

**The data and its cost.** The cheapest of all: the mint and burn events of
two or three token contracts on Ethereum, with the same free key. Most USDT
is said to be on Tron, which I did not check.

**The honest test.** Mints above a fixed size; only returns *after* the
mint's block count ("around" includes hours nobody could have traded);
24 hours on BTC, ETH and a small-coin basket against matched minutes.

**The traps**
- **Mints to the issuer's own treasury** are not yet money in the market.
- **Chain swaps** (burnt on one chain, minted on another) are not new
  money.
- **Few independent events:** mints bunch in rising markets.
- **The price led the mint** (Kristoufek).

**Verdict:** low to medium promise, low cost. A cheap second line.

### 2.6 Token unlocks

**Why it might work.** An unlock is new supply on a known date, in the
hands of teams and investors who paid little. It needs no speed.

**The outside evidence — two vendors, no academic study found**
- **Keyrock** (a market maker): "16,000 unlock events", "40 tokens", daily
  prices 30 days before and after, normalised against ETH. "90% of unlocks
  create negative price pressure, regardless of size or type"; "Token price
  impacts often start 30 days before the unlock event"; "Team unlocks
  trigger the worst crashes (-25%)"; ecosystem unlocks "+1.18% on average".
  It says of its own method that it "isn't perfect" (E35) [P].
- **Tokenomist** (a calendar vendor; published 2026-06-29): 236 events, a
  median one-month return of −16.26% against Bitcoin, most of which it
  puts down to the market and the kind of token, not the unlock; a large
  unlock lowers a new token's price by about 15%, established tokens are
  largely unaffected; one of its controls returned nothing (E36) [T — I
  could read the article's date and author, not its body].
- **A 2026 backtest** on 59 Binance perpetual contracts found a negative
  abnormal return around large unlocks and concluded that a plain short
  was not tradable after costs; it suggests unlocks as a risk filter (E36)
  [T].
- **What that means.** Against ETH or BTC, small coins fell in most of
  these years anyway. Without a matched baseline, "90% negative" may be the
  market's drift — the very error our method exists to catch.

**What our results suggest.** Nothing direct. The effect that survives a
baseline, if any, is in **new tokens with large unlocks**.

**The data and its cost**
- **A calendar as it was known on each day.** Tokenomist's API: $249.95 or
  $449.95 a month (E24) [T]. DefiLlama Pro: $300 a month (E14) [P]. I found
  no free API; other calendar sites were not checked.
- **The on-chain confirmation** (tokens leaving a vesting contract for an
  exchange) is custom work for each token.
- **Prices and funding:** Binance's public files, for tokens with a future.

**The honest test.** Unlocks above a fixed share of the circulating supply,
in tokens with a future listed at the time; a short from k days before to
the day after, paying fees and funding; against the same token's matched
windows without an unlock, and against matched peers on the same dates.
Forward only, or on a calendar recorded day by day.

**The traps**
- **A rewritten calendar.** Schedules are postponed and changed; a vendor's
  history shows today's version.
- **Survivorship.** A vendor covers the tokens that came to matter.
- **A crowded short.** The date is public, so the cost shows up in funding.
- **Bunched events.** Many cliffs fall a year after a season of launches:
  few independent periods.
- **"Share of supply"** is defined differently by each vendor.

**Verdict:** low to medium promise as a position of its own, medium cost.
More likely useful as a warning: a large unlock in the next days, shown
beside a wave entry in the same coin. Second.

### 2.7 Bridge flows

**Why it might work.** Money moving to a chain may buy that chain's coins.

**The outside evidence.** Thin, and against. A 2026 study of 20 chains and
16 bridges (Cao et al.; E44): its abstract says nothing on returns [P]; by a
search summary, flows chase returns and are followed by lower ones [T]. A
vendor's own backtest found a random pick did as well as its flow rule
(E44) [T; the page returned 404 to me].

**What our results suggest.** Nothing in its favour.

**The data and its cost.** Daily flows per chain: DefiLlama Pro, $300 a
month (E14).

**The traps.** Flows follow prices; a bridge's own incentives and airdrop
farming move money for reasons that say nothing about price; daily data.

**Verdict:** low.

### 2.8 New-token launches — a plain warning

- **Most are scams.** One study estimates that about half of the tokens
  listed on Uniswap were scam tokens, more than 10,000 of them (Xia et al.,
  2021; E43) [T]. A 2025 report classed 98.6% of the tokens launched on one
  Solana launchpad as rug pulls or pump-and-dumps: of 7 million tokens,
  about 97,000 kept more than $1,000 of liquidity. The launchpad disputes
  it (Solidus Labs, through press reports; E43) [T].
- **Survivorship.** The few everyone remembers are the survivors. A test
  that starts from a list of tokens still alive has already cheated.
- **No price a follower could really get.** Some tokens cannot be sold; some
  tax each sale; the first blocks belong to the launcher's own bots.
- **The counterparty is the author.** The person who wrote the contract
  knows more than any data will show.
- **My recommendation: keep launches out of the project by rule.** No
  honest test here is worth its cost.

### 2.9 More forced flows, beyond the brief's list

- **The at-risk map.** On a lending protocol every borrower's collateral
  and debt are public, so the amount that *would* be liquidated at each
  price can be computed before it happens (positions "by specifying a
  block number", E12). It is a state, not an event: a later arm of
  direction 1 ("does the bounce depend on how much was left to
  liquidate?") and a page no exchange can show.
- **Redeemable tokens sold below their redemption value** (staked-ETH
  tokens, stablecoins) after forced selling. The pull back has an anchor,
  but events are few and survivorship is lethal: some pegs never return.
  Information for a page, not a test.
- **Known forced sellers** (bankruptcy estates, seized coins): a handful of
  events. No test is possible.
- **On-chain perps venues with public accounts** are WAVE-ELSEWHERE's
  question. If it finds one with a long history, the two studies could
  share a price panel and the statistics.

### 2.10 The table of patterns

| Pattern | Promise | Cost to test | Data needed | Main traps |
|---|---|---|---|---|
| **Lending liquidation waves** | Medium: our one lead's twin; one paper studies these waves, and its chart shows the typical coin regaining half its fall within a day (E31); no baseline, no costs, no test published | **Low:** free keys, about a hundred calls, public price files | One event of two contracts; one-minute prices | The bounce after any fall; a few crash days; dust and repeats; delisted coins |
| **Token unlocks** | Low to medium: two vendor studies, one of them cautious; a backtest finds it not tradable after costs (E35, E36) | **Medium:** a paid calendar, or months of own recording | A calendar as known each day; prices; funding | A rewritten calendar; survivorship; funding cost; bunched events |
| **Stablecoin mints and burns** | Low to medium: studies disagree (E37–E39) | **Low:** the same free key | Mint and burn events of two or three contracts | Treasury mints; chain swaps; mints follow falls; few independent events |
| **Exchange flows** | Low to medium (E37, E47) | **High:** dated labels | Transfers; a dated exchange address list | Labels learnt later; internal shuffles; a public signal |
| **The at-risk map** (2.9) | Unknown: no test found | Medium to high: positions through time | Every borrower's position at past blocks | Many free choices; a state, not an event |
| **Bridge flows** | Low (E44) | Low to medium: $300 a month | Daily flows by chain | Flows follow prices; incentive farming |
| **Large swaps on decentralised exchanges** | Low (E42; FIND-7) | **High:** bulk data | Every swap of many pools | MEV; impact that is not information; wash trades |
| **Copying "smart money" wallets** | Low (E40, E41; R8 to FIND-6-EXITS) | **High:** every wallet's history, dated labels | All trades of all wallets | Labels after the fact; survivorship; bait; costs |
| **New-token launches** | Negative (E43) | High | — | Scams; survivorship; no real price |

## 3. The ranking, and the first study (question 3)

### 3.1 The ranking

1. **Lending liquidation waves.** The only pattern here that our own data
   supports, and the cheapest to test. First.
2. **Token unlocks.** Slower, and independent of the first. A real price
   fall is reported; whether it pays after costs is doubtful. Its data
   cannot be had free. What can start now at no cost is the *decision*
   whether to record a calendar daily.
3. **Stablecoin mints and burns.** A cheap line beside the first, sharing
   its tools; expected to show little.
4. Everything else in the table, in its order, and only after one of the
   first three has passed a test.

I would test **lending liquidation waves** first.

### 3.2 LEND-WAVE-1: the first study's rules, drafted for a freeze

These are draft rules L0–L12. They copy MARKET-1's wording wherever the
subject allows (`apps/poller/market1/rules.md`, M4, M5, M10, M11), so that a
pass or a fail means the same thing in both. The numbers marked *(the
owner's)* are proposals for the owner to rule.

**The question.** After a liquidation wave in a small coin on a lending
protocol, does that coin come back over the next 24 hours: (a) by enough to
pay a taker's costs on a liquid futures venue, and (b) by more than after an
equal fall without a wave?

**L0. The order of work — nothing is seen before its rule is fixed**
1. **The counting step (S0).** The events are read and counted. No price is
   joined to an event; no return is computed. S0 may change only what L2
   and L4 say it may, by the rules written there.
2. **The freeze.** The rules and the code are hashed in a list, as
   MARKET-1's are. A fresh reviewer reads the rules. The owner says go.
3. **One look at FIND** (the older period).
4. **If FIND's verdict is KEEP: one look at CONFIRM** (the newer period,
   untouched by any search), with the same frozen code. If it is FALL ONLY,
   the wave study ends there, and CONFIRM's years stay untouched for a
   price-only study with its own rules.
5. **If CONFIRM is KEEP too:** a forward paper test, frozen again, on days
   after the freeze.

**L1. The sources, and the record**
- **Events:** the `LiquidationCall` event of Aave V2's and Aave V3's pool
  on Ethereum mainnet (addresses in 2.1).
- **Two independent paths:** path A, an explorer's log search with a free
  key; path B, The Graph's official Aave subgraphs (or a node's
  `eth_getLogs`). Every event of A must be in B and the reverse, by
  transaction hash and log position, before any price is joined.
- **Prices:** Binance USDⓈ-M futures one-minute klines and funding history,
  from Binance's public data files, each file checked against its
  checksum.
- **The record:** every reply and every file is kept as received, with its
  time (the recorder).

**L2. The period and its split**
- Events from 2020-12-03 to the end of the last full month before the
  freeze.
- **The split is by date, fixed by S0 from counts alone:** the month
  boundary that puts as near as possible to 60% of the wave days in FIND
  and the rest in CONFIRM.
- If CONFIRM would hold fewer than 20 wave days or fewer than 8 coins,
  there is no CONFIRM: FIND is then labelled exploring, and the forward
  test is the only test.

**L3. The coins (small coins)**
- Every reserve of the two pools that is **not** a stablecoin, not ETH or a
  staked or restaked ETH token, not a BTC token, not gold, not a
  fixed-maturity or index token.
- From Aave's address book (E27) that leaves 21 candidates: 1INCH, AAVE,
  BAL, BAT, CRV, CVX, ENJ, ENS, FXS, KNC, LDO, LINK, MANA, MKR, REN, RPL,
  SNX, STG, UNI, YFI, ZRX. Also left out, as wrapped, index or rebasing
  tokens whose price is not a listed future's: xSUSHI, renFIL, DPI, AMPL,
  RAI.
- A coin takes part at an event's time only if its USDT-margined future on
  Binance has a kline file for that month. An event in a coin without one
  is counted as "not tradable" and printed.
- A renamed or migrated token follows a table written into the rules
  before the freeze (as I recall, MKR, FXS and REN are such cases; to be
  confirmed there).

**L4. A counted liquidation**
- A `LiquidationCall` whose collateral is a small coin (L3), whose debt
  asset is USDC, USDT, DAI or GHO, and whose debt repaid is **at least
  $1,000** *(the owner's)*, a unit of those four counted as one dollar.
- Its instant t is its block's timestamp. Its account is the borrower's
  address, lower-case.
- Days on which one of the four was off its peg are a short list written
  into the rules before the freeze (the known case: March 2023); their
  events are counted in a line beside only.
- **What S0 may change, by counts alone:**
  - if FIND would hold fewer than 60 entries or fewer than 30 wave days,
    the events of Compound and of Aave V3 on other chains are added by the
    same rule, their fields mapped in a table that a reviewer reads, all
    recorded before any price is read;
  - if more than one day in two has a wave, the number of borrowers a wave
    needs (L5) is raised to the smallest number that leaves at most one
    wave day in four.

**L5. The wave, and the entry** (MARKET-1's M5)
- **The wave state** holds at t when at least **two** different borrowers
  have a counted liquidation in the 60 minutes up to t, this one included,
  in any of the small coins.
- **An entry** is a counted liquidation at whose instant the wave state
  holds, when its coin has had no entry in the 60 minutes up to it.

**L6. The position and its price**
- $1,000 long the coin's future.
- **In:** the open of the first one-minute kline that starts at or after
  t + 120 s. **Out:** the open of the kline 1,440 minutes later.
- An entry with a missing kline at either end, or whose future stops
  trading inside the hold, is "unpriced": counted, printed, never dropped
  silently.

**L7. The costs**
- A taker's fee of 5 bps a side (Binance's Regular User rate, from this
  project's PAPER-PLAN section 4, read 2026-11-12).
- A spread allowance of 5 bps a side *(the owner's; an assumption, since
  the free files hold no order book)*.
- Funding paid over the hold, from the funding files.
- Printed beside: the result with no spread allowance, and with 25 bps more
  a side.

**L8. The matched baseline — so that a fall alone cannot pass**
- For each entry, the coin's move over the 60 minutes before its entry
  minute is r.
- **Its matched minutes:** every minute of the same coin, within 30 days
  either side, whose own 60-minute move is within a quarter of r (within
  50 bps when r is under 200 bps), and that has had **no wave entry** in
  any small coin in the 24 hours before it. Only the past of a matched
  minute is used to choose it.
- **The baseline** is the mean 24-hour move of a long position opened at
  those minutes. It needs at least 30 of them, from at least five
  different UTC days. Otherwise the window widens to 90 days; if that is
  still too few, the entry is "unmatched" and printed.
- **The entry's excess** is its own 24-hour move before costs minus its
  baseline.

**L9. The statistic** (MARKET-1's M10)
- x is an entry's net result in bps; every entry counts alike.
- The error is two-way: clustered by the UTC day of t and by the coin
  (the kit's CR1 variances; MARKET-1's `twoWay`).
- The bound is Student's t at one-sided 5%, for FIND and again for CONFIRM,
  its degrees of freedom the smaller count of days or coins, less one.
  (MARKET-1 spreads its 5% over three looks; a history study has one look
  a period.)
- The same for the excess.

**L10. The verdict** (MARKET-1's M11, with one word added)
- **WITHHELD** when more than 10% of the entries are unpriced.
- **TOO FEW** when the period has fewer than 20 wave days or 8 coins with a
  priced entry (MARKET-1: 10 markets of 38; here 8 of 21).
- **DROP** when the upper bound of the net result is below **+50 bps**
  *(the owner's; MARKET-1's line)*.
- **KEEP** when the lower bound of the net result is above zero **and** the
  lower bound of the excess is above zero: the position paid, and by more
  than after an equal fall.
- **FALL ONLY** when the lower bound of the net result is above zero and
  the excess's is not, or when more than 20% of the entries are unmatched:
  a bounce after a fall paid; the wave is not shown to add anything.
- **The order is M11's:** the first that holds, in the order above, is the
  verdict; **TOO FEW** when none holds.
- **Stricter than M11 in one place:** M11 asks for a mean excess above
  zero. Here the excess must clear its own bound, because the whole point
  of an on-chain project is that the on-chain event adds something to the
  price.
- These are verdicts on a test, never instructions to trade.

**L11. The lines beside, deciding nothing**
- ETH and BTC collateral, each in its own coin.
- A basket of all the small coins at every wave moment.
- Waves of 3, 5 and 10 borrowers; floors of $100, $10,000 and $100,000.
- Holds of 1, 4 and 48 hours; entries 15 minutes, 1, 3 and 6 hours late.
- Liquidations outside a wave; falls without a wave (the matched minutes
  themselves); one borrower liquidated in several coins within the hour
  with no second borrower.
- Each year alone; V2 and V3 apart; the result without its five largest
  days; the result without LINK.
- The wave by the published rule: liquidations of the same coin, each
  within an hour of the one before (E31).
- The rare opposite case: a small coin borrowed against dollars and
  liquidated (a forced buy).
- Liquidations whose liquidator kept the collateral as a deposit token
  instead of taking the coin (`receiveAToken`): a forced close with no
  sale at that moment.

**L12. The checks before the look**
- The two event paths agree (L1).
- A second, independent program recomputes the deciding numbers from the
  raw files, unit by unit.
- A random-day placebo, drawn at least 1,000 times: the entries moved to
  random days of the same coin.
- Every rule is broken on purpose in a scratch copy, and a test must fail.

### 3.3 What it could see — a rough guide only

- I cannot compute this before the counting step. As a scale: MARKET-FIND's
  error was 68 bps with 47 wave days. If lending waves are as noisy a day,
  the error is about 68 × √(47 ÷ D) for D wave days: about 47 bps at 100
  days, about 33 at 200.
- The smallest true net result that such a test confirms four times in
  five is about 2.5 errors: **about 115 bps at 100 wave days, about 80 at
  200.**
- This borrows another venue's noise for other coins and years. The
  counting step replaces it with the real count; the noise is known only
  after the look.
- For scale: on the published chart (2.1) the median line regains about
  230 bps between the first hour and the twenty-fourth after a large wave.
  That is a chart's median, before costs, with no baseline; it says only
  that a move of that order would be visible to such a test.

### 3.4 What each outcome would mean

| Outcome | What it means | The next step |
|---|---|---|
| KEEP in FIND and again in CONFIRM | A second, independent sighting of the wave, on another kind of venue and over several years | The forward paper test; a live information page; MARKET-1's lead reads stronger |
| FALL ONLY | A bounce after sharp falls in small coins, which needs no on-chain data | A price-only test, rules first; the on-chain project loses its first reason |
| DROP | The wave does not carry to lending protocols in these years | Direction 2 or 3, or stop; MARKET-1 is untouched, its lead reads more local |
| TOO FEW | Not enough waves in small-coin collateral | Widen by L4's rule, once; else stop |

### 3.5 What could still fool us

1. **Few independent crises.** Six years hold perhaps a dozen large
   sell-offs. Days are the unit, and even days bunch.
2. **The baseline may be empty.** If sharp falls almost never happen
   without liquidations, the matched minutes run out. Then the test can say
   whether the position paid, and cannot say whether the wave added
   anything. L10 calls that outcome FALL ONLY.
3. **A spread I assumed.** The free files hold prices, not order books. The
   forward test should price at a recorded book, as MARKET-1 does, or at
   least measure the spread it assumes.
4. **A changing population.** Aave V2's small coins of 2021 are not V3's of
   2025. The by-year line shows it; it cannot repair it.
5. **Translation choices.** Two borrowers, 60 minutes, two minutes' delay
   and 24 hours are MARKET-1's numbers, set on another venue; the $1,000
   floor is mine. All are fixed here before any price is seen; the
   neighbours are printed beside and decide nothing.
6. **A known signal.** If it worked in 2021 and is traded away by 2025, FIND
   passes and CONFIRM fails. That is what CONFIRM is for.
7. **One coin carrying it.** In the published sample LINK has more
   liquidations than all the other small coins together (E31). The error
   is clustered by coin, and the result is printed without LINK.
8. **The wave's own fall.** On the published chart the price is lowest a
   few minutes after a large wave's start. An entry two minutes after the
   first wave liquidation may still be inside the fall; the late entries
   in L11 show what waiting costs or saves.

## 4. What carries over from this project (question 4)

### 4.1 The method — all of it

It is the most valuable thing to carry, and none of it is about Polymarket.
- **Rules before results:** every rule written, hashed and frozen before a
  look; one look.
- **Weeks kept unseen:** a search period and a confirming period that no
  search touches; then forward.
- **A matched baseline,** so that a market's drift cannot pass as an effect.
- **Honest counts:** independent units (days, coins), never rows.
- **Fresh reviews:** a reviewer who did not write the rules reads them
  before the look, and another recomputes what decides, with its own code.
- **Prices a follower could really get,** with fees and funding.
- **A hypothesis register and one error budget** for a batch of studies.
- **A placebo drawn at least 1,000 times;** deliberate breaks in a scratch
  copy; a gate that refuses sealed data before a freeze.

### 4.2 The docs system — as it is

- `CLAUDE.md` with its iron rules, "who edits which doc" and the developer
  preferences.
- The same files: current-task, architecture, decisions (append-only),
  code-rules, the plan page, external-apis; `docs/reviews/` with its index.
- A supervisor's folder outside the repository, with a folder for each
  worker.
- **external-apis matters more there than here.** There will be five or six
  outside sources, each with its own limits and terms, and at least two of
  them changed theirs during 2026 (1.1).
- **code-rules:** the sections "Tests", "Research studies" and "This
  machine" carry whole. "The Perps API" is replaced by each new source's
  facts.

### 4.3 The code — copied once, never shared

| Piece | Where it is here | Carry over? | What changes |
|---|---|---|---|
| **The request budget** | `src/api/admission.ts` (pure, 62 lines) | Copy as it is | The constants: each source's share, about half its published limit |
| **The REST client's frame** | `src/api/rest-client.ts` | Copy the class: one client per API; a route table with a weight and a Zod schema per route; admission before every send; every call a line of the record; a generic User-Agent; back-off on a 429 | New route tables. The lab's nightly pause goes. A key is read from `.env` and never logged |
| **The Zod boundary** | `src/api/schemas.ts`; code-rules, "Parse at the boundary" | The pattern, and the daily log of unknown keys | Every schema is new. An explorer can answer HTTP 200 with a failure inside: "A status of 0 can indicate an error or a valid request that returned no records" (E7) |
| **The recorder** | `src/store/files.ts` | Copy: one line per reply with its receive time; hour files; compression checked by its round trip; a day's manifest; `coverage.jsonl` | The kinds of file |
| **Clock, lock, log, schedule, settings** | `src/clock.ts`, `lock.ts`, `log.ts`, `schedule.ts`, `config.ts` | Copy | Names and settings |
| **Health and status** | `src/health/` | Copy once a program runs for long | The stream parts wait until a stream is recorded |
| **The streams** | `src/ws/` | Only if the forward test records an exchange's book: the no-frame watchdog and the sampler carry | The channels and the frame schemas |
| **The database layer** | `src/store/db.ts` | Not at first: the first study needs files only | — |
| **The kit's statistics** | `research/kit/stats.mjs`: clustered bootstrap, the CR1 error, t-tests, Holm, rank correlation with a permutation test, a seeded generator | Copy as frozen files, with the fingerprint check (`check.mjs`) and the break harness (`mutate.mjs`) | Nothing |
| **The matched null** | `research/kit/nulls.mjs` | The idea, not the code: it draws from a market's trade counts by minute | L8's baseline is new code |
| **The one-minute panel** | `research/kit/panel.mjs` | The design: dense per-minute arrays, pinned by hash, a staleness limit, every row past the cut refused | A new builder, from the exchange's kline files |
| **The wave detector** | `src/market1/waves.ts` (pure, 96 lines) | Copy nearly as it is. It needs only an instant, an account, a side and a market per event | The field names: the borrower is the account, the coin the market |
| **The two-way error and the verdict** | `src/market1/stats.ts` | Copy | The constants (the drop line, the minimum of days and coins), as the owner rules |
| **Pricing at a recorded book** | `src/market1/price.ts`, `book.ts` | For the forward test, if a book is recorded | The history study prices at one-minute klines (L6) |
| **The freeze tool and the gate** | `tools/market1-freeze.cjs`, `src/market1/gate.ts` | Copy: a hash list of everything that runs; a run stops when a file differs; sealed data is refused before the freeze | The scope's file names; the cut |
| **The static page** | `src/market1/page.ts`, `src/paper/page.ts` | The pattern: no script; written after the day's record; a verdict box only after a look | The content |
| **Deploy, tasks, backup** | `tools/deploy.ps1`, `register-tasks.ps1`, `task-access.ps1`, `poller-check.ps1`, `backup.cjs`, `restore.cjs` | Copy | Task names and paths |
| **The tests' discipline** | `test/` (about 50 files, vitest); code-rules, "Tests" | Synthetic data; every branch's outputs asserted; deliberate breaks; an order pinned so that an early read fails loudly | The tests themselves are new |
| **The toolchain** | `pnpm verify`, TypeScript strict, ESLint, Prettier, `.gitattributes` | Copy the configuration | — |

**Polymarket-specific — left behind:**
- `src/jobs/` (boards, competition, instruments, the price audit);
- `src/paper/` (fills, copies, scoring, the rule book, the seed);
- `src/store/universe.ts`;
- the kit's `fills`, `labels`, `entries`, `cells`, `competition`,
  `agreement` and `costs` modules;
- the style classifier and the measured cost table.

**How to copy.** Once, at the founding, from a named commit of this
repository, recorded in the new project's first decisions entry. After that
the two never import from each other, as with polymarket-lab.

**Gotchas to seed the new code-rules** (general knowledge, each to be
confirmed at the build):
- A token amount is an integer in the token's smallest unit, up to 78
  digits: big integers or decimal strings, never a float. Decimals differ
  by token.
- A token's symbol is not an identity: key by chain and address,
  lower-case.
- A contract behind a proxy keeps its address while its code changes: an
  event's shape may differ by block range.
- The block's time is the only clock; read only blocks that can no longer
  be reorganised.

## 5. The new project (question 5)

**I recommend one, small and staged.**

### 5.1 Its scope, in a paragraph

A watch-only research tool for **forced and scheduled flows in public
on-chain data**, for the owner's own use. It tests, by this project's
method, whether a public on-chain event tells something about the next day
or days of a coin's price that a person acting at a taker's cost could use.
It starts with one pattern, liquidation waves on lending protocols, tested
on history and then forward. Token unlocks and stablecoin mints follow only
by the owner's word. It shows measured results on a local page, labelled as
under test, and never tells the owner what to trade. It holds no wallet and
no private key, and contains no code that can sign or send a transaction.

### 5.2 Its iron rules (a proposal)

1. **Watch only.** No wallet, no private key, no code that can sign or send
   a transaction. Read-only data keys in `.env` only.
2. **Its own repository, database and supervisor.** It never writes to
   polymarket-follow or polymarket-lab and shares no code with them at
   runtime.
3. **Every external reply is untrusted input:** parsed at the boundary;
   what fails its schema is logged and dropped.
4. **Every study is honest:** rules frozen before the look, a matched
   baseline, independent units, a follower's real price with fees and
   funding.
5. **Inside each source's limits and terms:** about half the published
   rate; back off on a refusal; the terms read and recorded before the
   first call.
6. **No personalised trading advice.**
7. **No token launches** (2.8), by rule.

### 5.3 Its first three steps

1. **The founding and the checks.** The owner rules the key question
   (5.4). The supervisor founds the repository and docs, with this report
   as founding evidence. The small checks of section 6 run, and their
   facts go into external-apis.
2. **The counting step (S0 of LEND-WAVE-1).** A small recorder pulls the
   liquidation events by two paths and compares them. A report gives the
   counts by coin, year and size, with no price joined. The owner then
   rules the open numbers (the floor, the drop line, the spread
   allowance), and whether the study runs as written, widened, or not at
   all.
3. **The study.** Rules frozen; a fresh rules review; the one look at FIND;
   a Final review with independent code; CONFIRM if FIND passes; then the
   plan of a forward paper test.

### 5.4 Its rate and key needs — so the owner can decide the key question

| Source | Key? | Published limit | What the first study needs | Share to plan |
|---|---|---|---|---|
| Etherscan API V2, free plan | A free key; an account the owner creates | 3 calls/s, 100,000 a day (E2) | An estimated one to a few hundred calls, once (27,466 Aave liquidations to May 2022, E31, at up to 1,000 a call); afterwards a few a day | 1 call/s; under 1% of a day's allowance |
| The Graph, free plan | A free key; a Subgraph Studio account the owner creates | 100,000 queries a month (E11) | An estimated few hundred to a few thousand queries, once (100 rows a query by the README, E12) | Under 10% of a month |
| Binance public data files | None | None published | About 21 coins × up to 71 months × two kinds of file: about 3,000 downloads, once (a few megabytes each for prices, my estimate) | One file a second |
| Etherscan's keyless tool server | None | Unpublished (E9) | Fallback for the checks only | — |
| Later, only by the owner's word: Blockscout (free key, E10), a paid month of a calendar vendor or of Dune (E13, E14, E24) | — | — | Not needed for the first study | — |

- **The decision.** polymarket-follow's Iron Rule 1 stays as it is. The new
  project's rule 1 allows read-only data keys. Each key is created by the
  owner, kept in `.env`, never logged, never in a URL that is written to a
  log.
- **What a key adds as risk:** an account in the owner's name at two
  services, and their terms. It adds no way to move money.
- **Without keys** the first study is still possible, through a public
  node or the keyless tool server, with unpublished limits and no promise
  of a full history. I do not recommend building on that.

### 5.5 The risks

1. **A "no" is the likely answer** to any single test. The project must be
   worth its cost when the answer is no. The first study is: it then says
   the wave does not carry to another venue's forced flow.
2. **More free choices than here.** Thousands of tokens, dozens of
   protocols and chains, any threshold. Without a register and one error
   budget, a pass will be found by trying. This is the largest risk.
3. **Sources change under us.** Etherscan's free plan was cut several
   times in 2026, and Dune's free plan lost its query runs (1.1). A study
   must keep its raw replies, and its plan must name a second path.
4. **Terms.** Etherscan forbids bulk copying and AI training on its data
   (E5). Binance's files are licensed for personal, non-production
   backtesting and not for live trading use (E18). The history study fits
   both; a live tool needs its prices from elsewhere (1.4). The owner
   reads both terms first.
5. **The assumed spread** in the history study (3.5); the forward test
   must repair it.
6. **The supervisor's load.** MARKET-1's daily checks, its second arm, D1,
   D2 and the v1 plan all fall in the same weeks. The new project needs its
   own supervisor, as decisions 2026-11-13 already says.
7. **What a pass would not show:** that it pays at a size that matters, or
   on the venue the owner uses. The history study prices $1,000 at
   one-minute prices.

### 5.6 A rough cost in time

- **Founding and checks:** one working session.
- **The counting step:** one or two sessions (a small recorder, two paths,
  the count report).
- **The rules, their review, the look, the Final review:** two or three
  sessions.
- **CONFIRM:** one session, if it comes to that.
- **Together: about four to six working sessions to a history answer,**
  spread over one to two weeks because the owner rules between the steps.
  MARKET-1 from plan to freeze took about a day of sessions; its answer
  takes until May.
- **The forward test:** a build of about MARKET-1's size, then months of
  waiting. It can be a once-a-day script with no live stream: yesterday's
  events and yesterday's price files (7.3).
- **Disk:** events in megabytes; price files a few gigabytes (my estimate).
- **Money:** none for the first study.

### 5.7 What would change my mind

I would **not** found it, or would stop after step 2, if:
- the counting step finds too few waves in small-coin collateral even
  after widening by L4's rule;
- the owner rules out any key, and the keyless checks show no reliable
  full history.

I would put it **second** if WAVE-ELSEWHERE finds a perps venue with a long
public history of liquidations: that test would be the closer twin and
should go first.

## 6. The next small checks (question 6)

The owner approves each; I made none. All together they are about twenty
small requests.

| # | The check | Key? | What it proves | Recommendation |
|---|---|---|---|---|
| **C1** | No network. Compute the event's topic: the Keccak-256 hash of `LiquidationCall(address,address,address,uint256,uint256,address,bool)` (the signature from E26, E28) | — | The filter value for C3, to be matched against the first reply | Yes |
| **C2** | Three GET requests for checksum files of about 100 bytes: `https://data.binance.vision/data/futures/um/monthly/klines/LINKUSDT/1m/LINKUSDT-1m-2021-05.zip.CHECKSUM`; the same path for one coin of L3 whose future has since been delisted; `https://data.binance.vision/data/futures/um/monthly/fundingRate/LINKUSDT/LINKUSDT-fundingRate-2023-01.zip.CHECKSUM` | None | That one-minute futures prices exist for 2021 with checksums; that a delisted coin's files are kept (no survivorship in the prices); that funding history is on file. The README shows only a spot path and the checksum's name (E18); the futures and funding paths are from my memory of the site, so a 404 is itself an answer | Yes, right after C5 |
| **C3** | With a free Etherscan key, at most ten calls: `https://api.etherscan.io/v2/api?chainid=1&module=logs&action=getLogs&address=0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2&topic0=<C1>&fromBlock=0&toBlock=99999999&page=1&offset=1000&apikey=<key>`; then `page=2`; then both for `address=0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9` | A free key (the owner's account) | That the free plan serves the event's whole history; the reply's shape, for the schema; the first event's date; how paging behaves at 1,000 records | Yes |
| **C3b** | The same question through Etherscan's keyless tool server, `https://mcp-keyless.etherscan.io/mcp`, tool `get_logs` | None | The same, without an account. Its limits are unpublished and its replies come through a tool, not as a recorded HTTP reply | Only if the owner declines a key |
| **C4** | With a free The Graph key, two queries to `https://gateway.thegraph.com/api/<key>/subgraphs/id/Cd2gEDVeqnjBn1hSeqFMitw8Q1iiyV9FYUZkLNRcL87g` (Aave V3 Ethereum): the fields of its `LiquidationCall` type; then its five earliest liquidation calls. The same two for V2, id `8wR23o1zkS4gpLqLNU4kG3JHYVucqGyopL5utGxP2q1N` | A free key (the owner's account) | That a second, independent path holds the same events from each pool's first day, with the borrower and the time | Yes, after C3 |
| **C5** | Reading only: the owner reads Etherscan's API terms (`https://etherscan.io/apiterms`: "Personal & Research use", "Prohibited Activities", "AI Use of API Data and Output") and Binance's dataset terms (`TERMS_AND_CONDITIONS.md` in `github.com/binance/binance-public-data`: clauses 4.1, 4.2 and 7) | — | That the planned use is one the owner accepts, under their own account and name | Yes, first: before C2 and C3 |
| **C6** | One GET: `https://api.llama.fi/stablecoincharts/all` (the path as DefiLlama's free docs list it, E14; the host to be confirmed there first) | None | The depth of the free daily stablecoin history | Later, only if direction 3 is approved |
| **C7** | One `eth_getLogs` call to a public Ethereum node the supervisor picks, for V3's pool and C1's topic over 1,000 blocks | None | That a keyless second path exists | Low priority; only if The Graph is declined |

## 7. Beyond the brief

1. **One error budget from the first day.** The new project's register
   should give the whole first batch (the wave, and unlocks and mints if
   they are approved) one 5% budget, as round 2 did here (IDEAS-REVIEW,
   Appendix A). With thousands of tokens to choose from, this matters more
   there than here.
2. **Record what cannot be read again.** The chain can always be read
   again. A vendor's unlock calendar, an address label and an order book
   cannot. If direction 2 is ever wanted, the cheapest useful act today is
   to start keeping a dated calendar; whether that is allowed by a
   vendor's terms must be read first (E24: "personal or non-commercial,
   non-redistribution use only") [T].
3. **A forward test without a live stream.** Binance's daily files arrive
   "the next day" (E18) [P], and the chain's events can be read at any
   time. So LEND-WAVE's forward test can be a once-a-day script that reads
   yesterday's events and yesterday's price files, like MARKET-1 reading
   closed days: two sources, a few calls a day, nothing to keep alive.
   Its two weaknesses: the price is a kline, not a book; and whether a
   forward paper test is still "non-production research" under Binance's
   dataset terms is the owner's reading to make (1.4).
4. **Three looks at one idea.** MARKET-1 (one venue, a sample of
   accounts, forward), LEND-WAVE-1 (lending protocols, every borrower,
   history) and whatever WAVE-ELSEWHERE proposes (other perps venues)
   would be three independent readings of "forced flow, then a move back".
   Agreement across different data is worth more than one large number.
   The supervisor could keep one table of the three.
5. **The population test.** On Aave every borrower is visible, so
   MARKET-FIND's side findings can be checked on a full population: that
   one account wiped out in several coins is not a wave; that size does
   not matter; that late entries lose little. They are lines beside in
   L11, at no extra cost.
6. **A page later.** If the wave holds, the same events give a live
   "liquidations and waves" view at about one call a minute a pool, well
   inside a free plan. It is the on-chain twin of "waves live in v1".
7. **One decision on keys answers two questions.** This project's parked
   item H13 (deposits and withdrawals of the exchange's accounts on its own
   chain) needs the same kind of key: the docs sweep named Polygon, and
   Etherscan's free plan covers Polygon (E3) [P]. H13 stays inside
   polymarket-follow and would need its Iron Rule 1 amended there. I only
   note that the owner's ruling on keys bears on both.
8. **The honest frame for the owner's idea.** The owner asked for "the same
   or a similar market pattern" on-chain. What on-chain data offers is not
   a new kind of edge. It is a **second witness**: the same forced flow,
   seen whole and for years, on venues that have nothing to do with
   Polymarket. That is why the first study copies MARKET-1's rule instead
   of searching for a new one.

## 8. What stays unknown

- **How many liquidations and waves there are** in small-coin collateral.
  It decides the study, and only the counting step can tell.
- **Whether Binance's public files keep delisted symbols and funding
  history** (C2).
- **How the free explorer plan behaves on a long pull:** paging at 1,000
  records, the effect of a wide block range, any unstated cap (C3).
- **History depth of every source:** none states it; C3 and C4 show it for
  the two that matter.
- **The exact wording of Etherscan's AI clause and its definition of
  Personal & Research use:** my reader returned summaries with short
  quotes. C5 is the owner's own read.
- **Every source's terms but Etherscan's and Binance's dataset terms:**
  not read. Neither of those two defines "non-commercial" or says whether
  research that informs one's own trading counts.
- **Google BigQuery's pricing:** the page did not load. **Solana's public
  limits:** the page answered 429; known through a search summary only.
- **The numbers behind Lehar and Parlour's Figure 8:** the paper prints no
  table of them. Mine are read from the drawn lines, which are quantiles
  at each hour and not the path of any wave.
- **The body of Tokenomist's unlock study,** and whether any academic
  study of unlocks exists: I found none in two searches.
- **Not checked at all:** Tron, Bitcoin explorers, Flipside, Bitquery,
  Covalent, Moralis, Allium, CoinGecko, Glassnode, CryptoQuant, Whale
  Alert; Compound's, Morpho's and Maker's liquidation events.
- **The real spread and depth** for $1,000 in a small coin's future at a
  wave's minute, in any past year.

## 9. Questions for the owner, each with a recommendation

1. **Found a new project, staged, with the counting step as its first
   exit?** Recommendation: **yes.**
2. **Allow free, read-only data keys there** (Etherscan, The Graph), each
   account created by you? Recommendation: **yes.** polymarket-follow's
   Iron Rule 1 stays unchanged.
3. **Approve the checks C1 to C5?** Recommendation: **yes**, in the order
   C5 (your own reading of the two terms), C1, C2, C3, C4. C6 and C7 wait.
4. **LEND-WAVE-1's deciding line: small coins only, with ETH and BTC
   beside?** Recommendation: **yes.** It is the wave's twin, and our data
   showed nothing in BTC and ETH. The cost: fewer events. The published
   chart (2.1) is mostly ETH, so the ETH line beside deserves a careful
   read too; with one error budget only one line can decide.
5. **The open numbers:** the floor ($1,000), the drop line (+50 bps, as in
   MARKET-1), the spread allowance (5 bps a side). Recommendation: **these
   three**, ruled after the counting step and before any price is read.
6. **Where would you act on it?** The study prices on Binance futures
   because you named Binance for later (decisions 2026-11-13). If another
   venue is meant, its prices and costs replace Binance's before the
   freeze. Recommendation: **Binance futures, unless you say otherwise.**
7. **Token unlocks as the second study?** Recommendation: **not yet.**
   Decide after LEND-WAVE-1's FIND look. It needs paid data ($250 to $300
   a month for a month or two) or a daily calendar record.
8. **Timing.** Recommendation: **found it after WAVE-ELSEWHERE's report is
   in,** so that the two wave studies are planned together, and with its
   own supervisor.

## 10. The evidence list

Every source was read on 2026-11-13 between 22:05Z and 22:43Z. [P] = read
at the source. [T] = a third party's statement or a search engine's
summary.

**Platforms and data**
- **E1** [P] Etherscan docs, landing and index:
  `https://docs.etherscan.io/`, `https://docs.etherscan.io/llms.txt`.
- **E2** [P] Etherscan rate limits:
  `https://docs.etherscan.io/resources/rate-limits`.
- **E3** [P] Etherscan supported chains and plan availability:
  `https://docs.etherscan.io/supported-chains`.
- **E4** [P] Etherscan API plans and prices: `https://etherscan.io/apis`.
- **E5** [P] Etherscan API Terms of Service, "Last updated: 1 October
  2026": `https://etherscan.io/apiterms`.
- **E6** [P] Etherscan endpoint overview (which endpoints are PRO):
  `https://docs.etherscan.io/endpoint-overview.md`.
- **E7** [P] Etherscan log endpoints and the research use case:
  `https://docs.etherscan.io/api-reference/endpoint/getlogs`,
  `.../getlogs-topics.md`, `.../getlogs-address-topics.md`,
  `https://docs.etherscan.io/resources/analytics-and-research.md`.
- **E8** [P] Etherscan changelog (the record limit, Gnosis and HyperEVM
  moving to paid plans): `https://docs.etherscan.io/changelog.md`.
- **E9** [P] Etherscan's tool server and Claude connector:
  `https://docs.etherscan.io/build-with-ai/mcp.md`,
  `https://docs.etherscan.io/build-with-ai/claude-connector.md`.
- **E10** [P] Blockscout limits and plans:
  `https://docs.blockscout.com/rate-limits.md`,
  `https://docs.blockscout.com/devs/apis/requests-and-limits`.
- **E11** [P] The Graph pricing and API keys:
  `https://thegraph.com/studio-pricing/`,
  `https://thegraph.com/docs/en/subgraphs/providers/subgraph-studio/managing-api-keys/`.
- **E12** [P] Aave's official subgraphs:
  `https://github.com/aave/protocol-subgraphs`.
- **E13** Dune. [P] `https://docs.dune.com/learning/how-tos/pricing-faqs.md`,
  `https://docs.dune.com/api-reference/overview/billing`. The plan table at
  `https://dune.com/pricing` did not load. [T] The Analyst and Plus prices:
  a search summary of third-party price pages.
- **E14** [P] DefiLlama API docs:
  `https://api-docs.defillama.com/llms-free.txt`,
  `https://api-docs.defillama.com/llms-pro.txt`.
- **E15** [P] AWS Public Blockchain Data:
  `https://registry.opendata.aws/aws-public-blockchain/`.
- **E16** [P] Google's blockchain datasets in BigQuery:
  `https://docs.cloud.google.com/blockchain-analytics/docs/supported-datasets`.
  The pricing page did not load.
- **E17** [P] cryo: `https://github.com/paradigmxyz/cryo`.
- **E18** [P] Binance public data, its README and its dataset terms:
  `https://github.com/binance/binance-public-data`,
  `https://raw.githubusercontent.com/binance/binance-public-data/master/TERMS_AND_CONDITIONS.md`.
  [T] Futures files from 2019-09-25: a search summary of a community
  tool's page.
- **E19** [P] Hyperliquid historical data:
  `https://hyperliquid.gitbook.io/hyperliquid-docs/historical-data`.
- **E20** `eth_getLogs` limits. [P] Alchemy:
  `https://support.alchemy.com/articles/1883074130-why-do-i-see-a-free-tier-error-when-calling-eth-getlogs-with-a-large-block-range`.
  [T] Public endpoints' caps, a vendor's guide dated 2026-06-30:
  `https://sqd.dev/learn/eth-getlogs-limits/`. [T] QuickNode's 5-block free
  limit on one chain: a search summary.
- **E21** [P] SQD and Envio HyperSync landing pages:
  `https://docs.sqd.dev/`,
  `https://docs.envio.dev/docs/HyperSync/overview`.
- **E22** [P] Nansen credits and prices:
  `https://docs.nansen.ai/getting-started/credits.md`.
- **E23** [T] Arkham's API by application: a search summary.
- **E24** Tokenomist. [P] `https://tokenomist.ai/llms.txt` ("500+ crypto
  assets"). [T] Plan prices, history by plan and the terms sentence: a
  search summary of its docs and changelog.
- **E25** [T] Coin Metrics community API: a search summary of
  `https://docs.coinmetrics.io/packages/coin-metrics-community-data`; my
  own fetch of its API page returned 404.
- **E26** [P] Aave V3's pool interface, the `LiquidationCall` event:
  `https://raw.githubusercontent.com/aave-dao/aave-v3-origin/main/src/contracts/interfaces/IPool.sol`.
- **E27** [P] Aave's address book, the pools and the reserve lists:
  `https://raw.githubusercontent.com/bgd-labs/aave-address-book/main/src/AaveV3Ethereum.sol`,
  `.../src/AaveV2Ethereum.sol`.
- **E28** [P] Aave V2's pool interface:
  `https://raw.githubusercontent.com/aave/protocol-v2/master/contracts/interfaces/ILendingPool.sol`.
- **E29** [P] Aave's developer docs, the pool:
  `https://aave.com/docs/developers/smart-contracts/pool`.
- **E30** [T] Aave's launch dates (V2 on 2020-12-03; V3 on Ethereum on
  2023-01-27): a search summary of press reports.
- **E48** Solana. [T] The public endpoint's limits: a search summary of
  `https://solana.com/docs/references/clusters` (429 to me). [P] Helius:
  `https://www.helius.dev/pricing`.

**Studies and reports**
- **E31** [P] Lehar and Parlour, "Systemic fragility in decentralised
  markets", BIS Working Paper 1062, 16 December 2022:
  `https://www.bis.org/publications/working-paper-1062-systemic-fragility-decentralised-markets`.
  Its numbers are from the version of 18 May 2023, a seminar copy whose
  PDF I read with a local text extractor:
  `https://snb.ch/dam/jcr:12bc6015-1616-4f49-a89f-83ecbe2708a2/sem_2023_05_26_lehar.n.pdf`.
  **Figure 8's values are my own reading** of the lines drawn in that PDF,
  from its drawing commands and its own axis labels: the supervisor
  folder, `workers/ONCHAIN-SCOUT/evidence/` (`pdf-streams.mjs`,
  `fig8.mjs`, `fig8-near0.mjs`, `fig8.out.txt`).
- **E32** [P] Qin, Zhou, Gamito, Jovanovic and Gervais, "An Empirical Study
  of DeFi Liquidations", 2021; the abstract and, from the HTML version,
  the counts of its section 4 and Table 1:
  `https://arxiv.org/abs/2106.06389`,
  `https://ar5iv.labs.arxiv.org/html/2106.06389`.
- **E50** [P] Gauntlet, "Aave Protocol Liquidation Retrospective: May
  2021":
  `https://gauntlet.xyz/resources/aave-protocol-liquidation-retrospective-may-2021`.
- **E33** [P] Qin, Ernstberger, Zhou, Jovanovic and Gervais, "Mitigating
  Decentralized Finance Liquidations with Reversible Call Options", 2023;
  the abstract and, from the HTML version, its section 6 (the sample, the
  price decline of same-transaction sales):
  `https://arxiv.org/abs/2303.15162`,
  `https://ar5iv.labs.arxiv.org/html/2303.15162`.
- **E34** [T] A data vendor's blog on liquidation spikes:
  `https://insights.santiment.net/read/liquidations-galore-wake-up-traders-from-their-snore-8443`.
  [T] A study of 25,798 Aave liquidations (March 2022 to December 2024),
  through a press article. Both from one search summary. Two searches of
  mine found no study of returns after liquidation spikes.
- **E35** [P] Keyrock, "From Locked to Liquidity: What 16,000+ Token
  Unlocks Teach Us":
  `https://keyrock.com/from-locked-to-liquidity-what-16000-token-unlocks-teach-us/`.
- **E36** Tokenomist, "When Token Unlocks Actually Move Price", 2026-06-29:
  `https://tokenomist.ai/research/do-token-unlocks-crash-prices`. [P] its
  title, author and date. [T] its numbers: a search summary. [T] A 2026
  backtest on 59 Binance perpetual contracts, published on an exchange's
  news pages: the same search summary. Two searches found no academic
  study of unlocks.
- **E37** [P] Chi, Chu and Hao, "Return and Volatility Forecasting Using
  On-Chain Flows in Cryptocurrency Markets", 2024, revised 2025; the
  abstract, and the paper's text read from its PDF with a local text
  extractor (sample 16 December 2017 to 20 January 2023):
  `https://arxiv.org/abs/2411.06327`, `https://arxiv.org/pdf/2411.06327`.
  [T] Hoang and Baur's earlier results: a search summary.
- **E38** [P, the abstract page] Ante, Fiedler and Strehle, "The influence
  of stablecoin issuances on cryptocurrency markets", Finance Research
  Letters 41, 2021:
  `https://ideas.repec.org/a/eee/finlet/v41y2021ics1544612320316810.html`.
- **E39** [T] Griffin and Shams, "Is Bitcoin Really Untethered?", Journal
  of Finance 75(4), 2020, doi 10.1111/jofi.12903. Kristoufek, "Tethered,
  or Untethered?", Finance Research Letters 43, 2021, doi
  10.1016/j.frl.2021.101991. Both through search summaries.
- **E40** Luo, Feng, Xu and Liu, "Resisting Manipulative Bots in Meme Coin
  Copy Trading", 2026. [P] the abstract:
  `https://arxiv.org/abs/2601.08641`. [T] that the plain methods lose: a
  search summary.
- **E41** [T] A vendor's definition of "smart" traders: a search summary of
  `https://research.nansen.ai/article/451`.
- **E42** [T] Capponi, Jia and Yu, "Price discovery on decentralized
  exchanges"; Klein and co-authors on Uniswap V3 against exchanges. Search
  summaries.
- **E43** [T] Xia and co-authors, "Trade or Trick?", 2021
  (`https://arxiv.org/abs/2109.00229`); Solidus Labs' 2025 report through
  press coverage
  (`https://thedefiant.io/news/defi/alarming-99-of-memecoin-launches-on-pumpfun-are-pump-and-dumps-or-rug-pulls-report`).
  Search summaries.
- **E44** Cao, Zheng, Cong, Li and Wang, "The Price of Interoperability",
  2026. [P] the abstract: `https://arxiv.org/abs/2604.03083`. [T] its
  findings on returns, and a vendor's bridge backtest
  (`https://nansen.ai/research/money-under-the-bridge`, 404 to me): search
  summaries.
- **E45** [T] Bianchi, Babiak and Dickerson, Journal of Banking & Finance
  142, 2022; "Up or down? Short-term reversal, momentum, and liquidity
  effects in cryptocurrency markets", 2021; Kozlowski, Puleo and Zhou,
  2020. Search summaries.
- **E46** [T] Félez-Viñas, Johnson and Putniņš, "Insider Trading in
  Cryptocurrency Markets", 2022, through press coverage. A search summary.
- **E47** [T] Studies of large transfers and of public whale alerts. A
  search summary.

**This project's own record**
- **E49** `docs/claude-decisions.md` (2026-11-11 to 2026-11-13);
  `docs/claude-code-rules.md`; `docs/claude-architecture.md`;
  `docs/reviews/strategy-review-2026-11-12.md`;
  `docs/reviews/approach-review-2026-11-12.md` (section A);
  `docs/reviews/market-find-2026-11-13.md` (page one);
  `docs/reviews/paper-plan-2026-11-12.md` (section 4, Binance's fee);
  `apps/poller/` as listed under "The limits held".
