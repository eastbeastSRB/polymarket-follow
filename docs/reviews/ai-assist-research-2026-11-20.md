# AI-ASSIST-RESEARCH: can an AI model honestly help the tool? (Claude through the API, about $100 a month)

AI-RESEARCH (Sonnet 5.5), 2026-11-20, for polymarket-follow's supervisor. Worked 09:28Z to about 09:45Z (stamps from `date -u`). Save as `docs/reviews/ai-assist-research-2026-11-20.md`.

**A research report decides nothing.** What it concludes is copied into the other docs, or it does not exist. Web research only: official docs, papers, publishers' pages. No code, no repository edits, no API calls, no key used, no data opened. No project or owner name was sent to any site. Watch-only stays absolute: the AI may label, explain or flag, never trade and never tell anyone what to trade. Nothing here is personalised trading advice.

---

## For the owner, in one page

**The short answer.** Claude can help you. It cannot, honestly, help you decide. The one thing you asked for, a check that says "this crash is news-driven, skip it", is the one thing no test can verify at your trade rate. A fair test would need about two years of waves. The model would be retired before then.

**Why, in three points:**
1. **Nobody has shown that an AI model predicts short-term crypto moves after costs.** The best clean study (headlines to US stock returns, 2021 to 2024) found a real next-day effect. The effect shrank year after year, and it vanished at a 20 bps cost. It found nothing in the first 15 minutes after news, and your entry is at 2 minutes. Live tests of AI models trading crypto perpetuals on Hyperliquid, the venue you record, found no edge (section 1.3).
2. **Every back-test of an AI on the past is contaminated.** Claude Sonnet 5.5, Opus 5.5 and Haiku 5.5 were trained on text up to June 2026. That covers every month your project has tested so far (2025-06 to 2026-05). The model may "remember" how those crashes ended. Only waves from now on are clean.
3. **Your sample is too small to see a filter's value.** About 30 trades a month, bunched on crash days. For an AI filter to show a proven gain in a year, the waves it drops would have to earn about 300 bps less per trade than the waves it keeps (section 4.4). Real filters do not separate that cleanly.

**What I recommend (ranked, cheapest and safest first):**
1. **Keep using Claude as a research and review partner.** Reading papers, auditing code and docs, red-teaming a plan, writing tests. It is the best value, and it costs nothing from the API budget. One rule: never let it hunt for new trading rules. Every idea it suggests goes into the try log like any other try (section 2, P6).
2. **Add a plain-language "what happened" note to alerts, when you want it.** Facts and links only, never "buy", "skip" or "good setup". About $3 a month. Build it after the exam's freeze, not before.
3. **Optional: an 8-week "can it even find news in time?" pilot.** Not a P&L test. It measures four things:
   - how often news exists at +2 minutes;
   - whether repeated runs agree;
   - how long a call takes;
   - what it costs.

   It costs $15 to $40 a month. It runs in the shadows, never gates a trade, and its labels are not matched to outcomes until the exam is done (section 4).
4. **Do not** put an AI verdict in front of the entry. Do not re-label your 12 months of past waves with Claude. Do not judge the AI by P&L inside a year.

**An outside-the-box alternative.** Most of what you want the AI to tell you ("is it a token unlock, a delisting, a scheduled macro event?") may exist as a plain, dated, public calendar. A calendar is deterministic, free of look-ahead, and available before the event. A flag from one is a normal pre-registered feature, tested like W4 was. I did not verify any such feed's availability or terms. Under Iron rule 1 any new data source needs your approval. Unscheduled events (a hack) cannot be found by anyone, human or AI, within 2 minutes.

**Your $100.** I found that this is the Claude Max plan's monthly API credit. It expires each billing cycle with no rollover. It covers the API and the Agent SDK. It does not cover Claude Code. When it runs out, API calls simply stop until the next cycle (section 6).

**Decisions that are yours** (my recommendation is in section 7):
- Allowing an outbound call to Anthropic's API under the Iron rules. It is not on rule 1's list of allowed external reads.
- Whether to run the 8-week pilot.
- Whether to add a calendar-flag research item.

---

## 1. The evidence

How I read each item is in brackets: **full text**, **abstract page** (the publisher's or arXiv's own abstract), or **listing** (a bibliographic summary, not the paper). Every title below was checked against the page named.

### 1.1 Language models predicting returns from news and sentiment

- **Lopez-Lira and Tang, "Can ChatGPT Forecast Stock Price Movements? Return Predictability and Large Language Models"**, arXiv 2304.07619 (v1 2023-04-15; v6 2025-10-28) [arXiv HTML v6, first 100,000 of 282,000 characters, plus the abstract page]. This is the cleanest positive result.
  - Setup:
    - 4,123 US stocks, 159,137 firm-headline observations, October 2021 to May 2024.
    - Model gpt-4-0314, whose training data ends September 2021, so the sample is after its cutoff.
    - One prompt at temperature 0.
  - What worked:
    - The model's score captures the initial reaction, but only for someone with early access to the news (daily long-short hit rate about 89 to 93%).
    - A next-day drift remains: about 34 bps a day before costs, mainly in small stocks and negative news.
  - What did not:
    - The 1 to 15 minute window after news was insignificant (Table 3).
    - Cumulative return: about 700% before costs, over 300% at 5 bps round trip, over 100% at 10 bps, **unprofitable at 20 bps** (Section 6.2, Fig. 4).
    - The annualised Sharpe fell **6.54 (2021 Q4), 3.68 (2022), 2.33 (2023), 1.22 (Jan to May 2024)**. The authors link this suggestively to wider LLM adoption.
  - The authors say it is feasible only "for market participants whose transaction costs are sufficiently low".
  - It is a working paper. I found no peer-reviewed version.
- **Glasserman and Lin, "Assessing Look-Ahead Bias in Stock Return Predictions Generated By GPT Sentiment Analysis"**, arXiv 2309.17322, 2023-09-29 [abstract page]. Company names in the headlines can distract the model ("distraction effect"). Anonymising them helped in-sample. Out-of-sample, look-ahead is not an issue.
- **Haase, Celig, Rath, Schoder, "Wisdom of the crowd signals: Predictive power of social media trading signals for cryptocurrencies"**, Electronic Markets 35(1), article 64, online 2025-07-11 [abstract via Crossref]. A language model pulled 28,000+ explicit buy and sell calls out of social media posts. They predicted short-term moves, especially in small coins and after negative returns. An out-of-sample strategy beat a crypto index and the S&P 500 on risk-adjusted return. I did not read costs, sample dates or sizes. This is a model used as an extractor of other people's signals, not a predictor.
- **Li et al., "CryptoTrade: A Reflective LLM-based Agent to Guide Zero-shot Cryptocurrency Trading"**, EMNLP 2024 main, pp. 1094 to 1106 (arXiv 2407.09546) [abstract page]. The authors claim higher returns than time-series baselines on BTC, ETH and SOL with GPT-4 and GPT-4o. I could not see the test period, out-of-sample status or limitations. I give it no weight.

### 1.2 Look-ahead bias: why a back-test on the past is void

- **Lopez-Lira, Tang, Zhu, "The Memorization Problem: Can We Trust LLMs' Economic Forecasts?"**, arXiv 2504.14765 (v1 2025-04-20; v2 2025-12-15) [abstract page]. Models recall exact economic and financial values from before their cutoff. Telling them to respect a date fails. Masking fails, because they rebuild entities and dates from small clues. No recall after the cutoff. Forecasting skill cannot be told apart from memory while the model has seen the outcome.
- **Gao, Jiang, Yan, "Detecting Lookahead Bias in LLM Forecasts"**, arXiv 2512.23847 (v1 2025-12-29; v2 2026-06-12; v1's HTML is headed "A Test of Lookahead Bias in LLM Forecasts") [HTML v1]. For news headlines predicting next-day returns (Llama-3.3 70B, cutoff December 2023), the part of the effect carried by memory is about **37% of the model's whole standalone effect**. It disappears after the cutoff: the interaction is −0.007, t = −0.74, against +0.012, t = 3.44 before. Their advice: do not trust masking, use open models where possible, and design for short out-of-sample windows.
- **Sarkar and Vafa, "Lookahead Bias in Pretrained Language Models"** (NBER conference draft 2024-06-28; ICML 2025 listing) [abstract page]. Direct tests show the bias in two forecasting tasks. Prompt-based fixes have limits.
- **Levy, "Caution Ahead: Numerical Reasoning and Look-ahead Bias in AI Models"**, Chicago Booth Fama-Miller working paper 2025, SSRN 5082861 [abstract page]. Models reason about numbers poorly. Commercial models show substantial look-ahead bias, which may explain much of their apparent predictive power.
- **Didisheim, Fraschini, Somoza, "AI's predictable memory in financial analysis"**, Economics Letters 256 (2025) 112602 [listing only]. Bias is smaller for smaller models and finer data.
- **He, Lyu, Manela, Wu, "Chronologically Consistent Large Language Models"**, AFA 2026 program, 2026-01-04 [abstract page]. Models trained only on text available at each date give next-day news predictions comparable to the state of the art. The authors read this as "modest" look-ahead, and say it is "model and application-specific". Not all studies agree on size. Every one agrees you cannot test a model on events inside its training window.
- **Benhenda, "Look-Ahead-Bench: a Standardized Benchmark of Look-ahead Bias in Point-in-Time LLMs for Finance"**, arXiv 2601.13770, 2026-01-20 [listing only]. Standard models show alpha decay across periods, which points to contamination.

**What it means here.** The Claude 5.5 family documents a training-data cutoff of **June 2026** (Models overview, read 2026-11-20). Every month the project has tested is inside it. Any retrospective run proves nothing. Only waves after June 2026 are clean, and the cleanest are the ones that happen after the model id is frozen.

### 1.3 AI "trading agents": do the results survive?

- **Li, Kim, Cucuringu, Ma, "Can LLM-based Financial Investing Strategies Outperform the Market in Long Run?"** (FINSABER), arXiv 2505.07078 (v1 2025-05-11; v6 2026-06-26; KDD 2026 Datasets and Benchmarks, oral) [abstract page]. Over two decades and 100+ symbols, earlier reported gains "deteriorate significantly". The agents were too timid in bull markets and too aggressive in bear markets.
- **Ye et al., "The Alpha Illusion: Reported Alpha from LLM Trading Agents Should Not Be Treated as Deployment Evidence"**, arXiv 2605.16895, 2026-05-16 [abstract page; a position paper]. Public evidence cannot separate skill from temporal contamination, unmodelled frictions, short-window Sharpe noise and narrative fitting. It names six well-known agent systems.
- **Gençay, "What survives honest evaluation? Leakage-safe, search-aware assessment of LLM-driven trading strategy discovery"**, arXiv 2608.27734, 2026-08-27 [abstract page]. Two frontier models generated candidate strategies on 453 point-in-time US stocks and 39 ETFs, with costs, borrow and impact. Search budgets ran to 100 candidates, over five runs. Each result was deflated by the number of tries. **Every LLM-discovered strategy was rejected.** Passive benchmarks were certified.
- **Chen et al., "StockBench: Can LLM Agents Trade Stocks Profitably In Real-world Markets?"**, arXiv 2510.02209 (2025-10-02; v2 2026-03) [listing]. A contamination-free window of 2025. Most agents beat buy-and-hold mildly but "rarely outperform simple baselines". The benchmark does not model costs or slippage.
- **Qian et al. (with Lopez-Lira), "When Agents Trade: Live Multi-Market Trading Benchmark for LLM Agents"** (Agent Market Arena), arXiv 2510.11695 (2025-10-13; v2 2025-10-30) [abstract page]. Live, crypto and stocks. The agent framework changed behaviour more than the backbone model did.
- **Fan et al., "AI-Trader: Benchmarking Autonomous Agents in Real-Time Financial Markets"**, arXiv 2512.10971, 2025-12-01 [abstract page]. Live on US stocks, China A-shares and crypto. Most agents had "poor returns and weak risk management". A listing I saw reports all six crypto runs lost money. I did not verify that from the paper.
- **Barton et al., "What LLM Trading Agents Actually Do in Production: A Six-Month, Population-Scale Record from Two Fleets"**, arXiv 2609.05663, 2026-09-04 [abstract page and part of the HTML]. This is the closest match to your venue.
  - It covers 500 to 599 user-built agents trading **Hyperliquid perpetuals**, June to August 2026 (about 91 to 117 active at a time), plus 3,505 funded memecoin vaults.
  - It finds no directional edge in either fleet. The perp fleet is not profitable and trails a matched retail benchmark (41% against 50% round-trip win rate).
  - Leverage did not change with volatility. One setting cell (11% of the book) caused 62% of liquidations.
  - Of positions that saw 300+ bps of favourable move within 24 hours, 49.3% still closed negative.
  - A replay of three frontier models on 416 scenarios found decision quality statistically indistinguishable (regret 263 to 264 bps; Holm-adjusted p ≥ 0.46).
  - It is a preprint. The page says "not peer reviewed" for a lab report cited inside it.
- **Alpha Arena Season 1** (nof1), 2025-10-18 to 2025-11-03. Six models, $10,000 each, real money, Hyperliquid perpetuals [secondary only: Decrypt, 2025-10-20, "AI Crypto Trading Showdown: DeepSeek and Grok Are Cashing In as Gemini Implodes"; Forklog, 2025-11-04, "Four out of six AI models suffer losses in trading tournament"]. I could not open nof1's or alphaarena.ai's own pages (HTTP 429 and 404).
  - Final (Forklog's balances; the returns are its table's, which the page itself calls its own arithmetic): Qwen3 Max +22.3%, DeepSeek +4.9%, Claude Sonnet 4.5 −42.0%, Gemini 2.5 Pro −45.5%, Grok −57.9%, GPT-5 about −59%. One source gives −62.7%.
  - On 2025-10-20 the leaders were Grok, DeepSeek and Claude, each above +25%. Two weeks later two of them were deep in loss. Rankings flip fast, which is the point: a small sample is noise.
  - The organiser's own words (Forklog): the season was a "first experiment"; "LLMs do not handle numerical time series data well, but that was the entire context we provided them".

**Do the results hold out of sample and after costs?** The only clean out-of-sample line (headlines to stock returns) holds at next-day horizon, decays year by year, and dies at a 20 bps cost. The agent literature is mostly contaminated, short, or cost-free. Where it was made strict (FINSABER, Gençay, the Hyperliquid fleet), the edge disappears. I found **no study of any AI model doing what you propose**: labelling a liquidation wave or a crash as news-driven or not and checking if it reverts. Absence of evidence, searched 2026-11-20.

### 1.4 The economic idea behind the filter, and its limits

- **Chan, "Stock price reaction to news and no-news: drift and reversal after headlines"**, Journal of Financial Economics 70(2): 223 to 260, November 2003 [listing: EconPapers and bibliographic summaries]. After bad news there is drift (continuation). After large price moves with no identifiable news there is reversal. Concentrated in small and illiquid stocks.
- **Savor, "Stock returns after major price shocks: The impact of information"**, Journal of Financial Economics 106(3): 635 to 659, 2012 [listing: EconPapers and Penn repository]. Shocks accompanied by analyst reports are followed by drift. Shocks without them reverse.

This is exactly the logic of "does news explain the crash?". It is the strongest reason the idea is not silly. Its limits:
- It is about stocks, at days to months, with news defined by a human-curated feed (stock news items, analyst reports). It is not about forced liquidations seconds after they happen.
- The split is not binary in crypto. The project's worst day, 2025-10-10, had both a news trigger (a tariff announcement) and a mechanical cascade, according to secondary analyst reports (CoinShares, FTI Consulting, Amberdata; vendor sources, figures differ). An AI "news-driven? yes or no" would be wrong in one direction or the other on the day that matters most.
- My arithmetic from the explore report's tail table: removing 2025-10-10 alone would add roughly +25 bps to N's mean on E. A perfect flag on that one day is worth about that, and it is a single observation.

### 1.5 Where Claude's own documentation matters (read 2026-11-20)

| Fact | Source and date |
|---|---|
| Sonnet 5.5 `claude-sonnet-5-5`: $2 input and $10 output per million tokens. Released 2026-09-28. Retirement "not sooner than" 2027-09-28. | Models overview and the Sonnet 5.5 page |
| Haiku 5.5 `claude-haiku-5-5`: $0.10 and $0.50 (rises past 100,000 tokens). Retirement not sooner than 2027-10-07. | Haiku 5.5 page |
| Opus 5.5 `claude-opus-5-5`: $4 and $20. Fable 5.2: $8 and $40. | Models overview |
| Training-data cutoff and reliable knowledge cutoff: June 2026, all four. | Models overview |
| Latency is published only as a ranking: Haiku fastest, Sonnet fast, Opus and Fable moderate. No seconds are given. | Models overview |
| Setting `temperature`, `top_p` or `top_k` on Sonnet 5.5 returns a 400 error. They are removed from API version 2026-10-21. | Sonnet 5.5 page; Model deprecations |
| Thinking is adaptive and on by default. On Sonnet 5.5 "disabled" is not supported. The lowest setting is `between_tools`. | Sonnet 5.5 page; Models overview |
| A model id is a pinned snapshot, but "serving infrastructure" (router, safety classifiers, sampling logic) can change. | Model IDs and versioning |
| At least 60 days' notice before retiring a public model. Sonnet 4.5 (released 2025-09-29) retires 2026-11-30. | Model deprecations |
| Web search costs $10 per 1,000 searches plus tokens. Results count as input tokens. Results carry `url`, `title`, `page_age` ("when the site was last updated"). There is no date-range filter. | Web search tool page; Pricing |
| Max plan: $100 a month of API credit. Expires each cycle. If the balance is exhausted, API requests stop until the next cycle. Covers the API, Agent SDK and playground. Not Claude Code. | API credits for Max, Ultra and Team plans |

Batch API gives 50% off, and prompt-cache reads cost 5% of the input price on Sonnet 5.5 (Pricing).

---

## 2. The pitfalls that decide whether a test means anything

**P1. Look-ahead from training data.** Section 1.2. The practical rules:
- Test forward only.
- Freeze the model id first. The log is a frozen artefact: **never re-label old alerts with a newer model**, which would have seen them.
- Never "debug" the prompt on the past 12 months and call it a pilot. At most use it to check plumbing, never to tune.

**P2. The web-search leak.** The search tool has no date filter, and `page_age` is only "when the site was last updated". If alerts are processed late (for example a nightly batch to save money), the search returns articles written after the crash and the label sees the future. Process at alert time. Log every returned URL and the time of the call.

**P3. At +2 minutes the news usually is not there yet.** This is my reasoning, not a finding. I found no study that measures the minutes-level lag between a crypto event and its explanation. In a cascade the explanation (a post, an article) often appears after the entry, or the "cause" is the flow itself. A filter that mostly returns "no news found" is not informative. This is cheap to measure (the pilot's coverage number) and should be measured before anything else.

**P4. Non-determinism, and no temperature knob.** You cannot set temperature to 0 on Sonnet 5.5 (400 error). Independent work shows that even "deterministic" settings give different answers:
- Atil et al., "Non-Determinism of 'Deterministic' LLM Settings", arXiv 2408.04667 (2024-08-06; v5 2025-04-02) [abstract page]: five models, eight tasks, ten runs each. Accuracy moved up to 15% between runs, and the best-to-worst gap reached 70%.
- Horace He et al. (Thinking Machines Lab), "Defeating Nondeterminism in LLM Inference", 2025-09-10 [full text]: 1,000 samples at temperature 0 from one open model gave 80 distinct outputs. The cause is varying server batch size.
- Sclar, Choi, Tsvetkov, Suhr, "Quantifying Language Models' Sensitivity to Spurious Features in Prompt Design or: How I learned to start worrying about prompt formatting", arXiv 2310.11324 (2023-10-17; v2 2024-07-01) [abstract page]: formatting changes alone moved accuracy by up to 76 points on an older model.

So: ask the same question three times and log all three. Treat the answer as a sample. Use a structured output, never free text.

**P5. Prompt-hacking is p-hacking.** Thomas, Gligoric, Shah, "Mitigating LLM-based p-Hacking by Preregistering for the Next LLM", arXiv 2606.27687, 2026-06-26 [abstract page]: tweaking prompts and settings until the result looks good is a real problem. Their protection is to freeze the design, then confirm on the next model that did not exist at freezing. For this project: freeze the prompt text (SHA-256), model id, effort setting, tool version, output schema and counting rules before the first live alert. Any change makes a new test.

**P6. An AI used to find rules multiplies your tries.** The same Gençay paper (section 1.3) shows LLM-driven search needs deflation by the number of tries. This project already counts tries (35 on E). Every rule an AI suggests, however casually, is a try. This is the largest risk of use 1, and it is a bookkeeping rule, not a reason to stop.

**P7. Explanations that sound right and are wrong.**
- Turpin, Michael, Perez, Bowman, "Language Models Don't Always Say What They Think: Unfaithful Explanations in Chain-of-Thought Prompting", NeurIPS 2023 (arXiv 2305.04388) [abstract page]: explanations follow cues the model never mentions.
- Chen et al. (Anthropic and others), "Reasoning Models Don't Always Say What They Think", arXiv 2505.05410, 2025-05-08 [abstract page]: reasoning models mention a hint they used in at least 1% of cases, but often under 20%.

A model asked "why did it crash?" will write a plausible story even when the real cause is a flow cascade. Protect the owner:
- "None found" must be an allowed answer.
- Every claim needs a URL with its own timestamp.
- Spot-check by a person (section 4.3).

**P8. Numbers and tables.** Language models do poorly with raw numeric series. Levy (above), and the organiser of Alpha Arena in his own words. For time-series anomalies: Zhou and Yu, "Can LLMs Understand Time Series Anomalies?", ICLR 2025 (arXiv 2410.05440) [abstract page]: they find trivial anomalies but "no evidence" for subtle real ones, and chain-of-thought did not help. So monitoring and anomaly checks stay rule-based.

**P9. Web pages are untrusted input.** A page the search returns can contain text aimed at the model. This is Iron rule 3. The model has no tool that can move money (none exists), but a poisoned label would still pollute the log. Parse every reply with Zod against a closed schema (enums, bounded lists, URLs as strings). Drop and log anything that fails. Never pass model text into a command.

**P10. The model id will be retired before a long test finishes.** Sonnet 4.5 lived about 14 months from release to retirement. Sonnet 5.5's earliest retirement is 2027-09-28. At least 60 days' notice. A two-year test on one model id is impossible. A model change makes a new test with a new count. This matters more than any statistics: it caps how long the AI can be judged on one frozen configuration.

**P11. Project rules.**
- **Rule 1.** Its list of allowed external reads does not name an LLM API. The owner must rule on it, as with decision 2026-11-13. Only public data would be sent. The key stays in `.env`.
- **Rule 6.** The AI shows facts and sources. No "skip", no "good wave", no "buy" or "sell".
- **The exam.** Joining AI labels to FRESH outcomes before the exam's two looks are finished is a new forking path. Join them only after the looks, or on positions outside FRESH.

---

## 3. The candidate uses, ranked by value against risk and cost

| # | Use | Value | Risk | Cost a month | Verdict |
|---|---|---|---|---|---|
| 1 | **Research and review partner** (read papers, audit code and docs, red-team a pre-registration, write tests, independent re-computation) | High. Already how this project works | Counted tries (P6). Hallucinated citations: title-check, as here | No API budget needed (Claude Code is a separate product) | **Yes, keep.** Add the rule: AI-suggested rules go in the try log |
| 2 | **Plain-language alert explainer** ("what moved, how big, which coins, when", facts and links) | Medium: helps you read an alert in 10 seconds | Wrong story if it reaches for causes (P7). Keep it to the alert's own numbers; causes only with a URL | About $3 (100 alerts, no web search, Sonnet 5.5) | **Yes, after the exam freeze.** Separate process, writes its own file |
| 3 | **Shadow "news-context" label** (the filter idea, never gating) | Unknown. Cannot be measured by P&L in under about 2 years (section 4.4) | P1 to P5, P10 | $14 to $40 (Haiku 5.5 or Sonnet 5.5, 3 repeats, 100 alerts) | **Optional, as an 8-week pilot only** |
| 4 | **Monitoring and anomaly checks on the data** | Low for the AI part | LLMs weak on time series (P8) | $1 to $3 | **No AI detection.** Keep rules. A summary of a nightly check in words is fine, and is use 2 |
| 5 | **AI verdict in the entry path** (skip, keep, size) | Unproven, probably zero | Breaks the exam's fixed rules and Iron rule 6. Selection effects from timeouts | n/a | **No** |
| 6 | **Re-label the past 12 months with Claude** | None. Contaminated (P1) | Gives false confidence | n/a | **No** |

**Other uses the evidence supports:**
- **Structured calendars instead of an LLM** (the outside-the-box item above). Not verified for availability or terms.
- **Cross-checking.** Ask Claude to find the largest holes in a result before you rely on it. It found nothing the exam's own reviews would miss, but it is cheap. This sits inside use 1.
- **Do not use it as an oracle for "will it bounce".** The live tests (section 1.3) say it adds nothing, and answers differ run to run (P4).

---

## 4. An honest test design for the best candidate (use 3, as a shadow)

### 4.1 What it is and is not
- **It is** a frozen, logged, never-gating label on each wave alert.
- **It is not** a trading rule. The paper-follow log's rule (the same rule without the AI) goes on unchanged. The "kept" set of the AI is a subset of the same entries, so the comparison "with AI against without" needs no second book and no second fee model.

### 4.2 Frozen before the first live alert (and hashed, with the date)
- Model `claude-sonnet-5-5` (one id; Haiku 5.5 is the cheaper alternative, never both).
- A fixed effort setting; a fixed web-search tool version, `max_uses` 3, no custom domain list.
- A prompt and a closed output schema, SHA-256 of both. Counted as one try.
- Outputs, enums only:
  - `news_found`: yes, no or unclear;
  - `catalyst_type`: hack or exploit, listing or delisting, unlock or supply, exchange or infrastructure incident, macro or regulatory headline, none found;
  - `scope`: market-wide, coin-specific or unclear;
  - `sources`: a list of {url, title, published}, each with the page's own timestamp.
- The prompt must **not** ask about direction, bounce or what to do.
- **Three independent calls per alert.** All three are logged. The label is the majority. A split is its own label: "unstable".

### 4.3 What gets logged, and when
- Per alert: alert time `t0`; call start and end; model id; prompt hash; response id; all three full replies; every URL and `page_age` returned; token counts; cost; timeouts.
- Append-only JSONL, one SHA-256 per line, a daily hash committed.
- A call that has not returned by `t0 + 90 s` counts as "too late" and is logged. This measures whether a gate could ever have worked.
- **No outcome field exists in this file.** Outcomes are joined by a separate script, later (section 4.5).

### 4.4 How many waves it needs to say anything

**Feasibility questions (cheap, answerable in 8 weeks).**
- **Coverage:** the share of alerts where a cited item dated before `t0` exists.
- **Stability:** the share where all three replies agree.
- **Timing:** the share that return before `t0 + 90 s`.
- **Accuracy:** a person audits 30 random alerts after 48 hours with hindsight. 30 alerts give an uncertainty of about ±18 points on an accuracy (60 give about ±13).
- 50 alerts are enough to measure coverage and stability to within about ±7 points.

**The value question (does skipping flagged waves improve the rule?)**
- The measure: the rule's mean net with and without the flagged waves.
- The error comes from the project's own placebo: the rule's median window error is **88.1 bps at 100 days and 68.8 bps at 182 days** (`beside.json`, explore report 5.7). I scale it by 1/√days beyond that.
- If the AI drops a share d of waves, the gap in mean net between kept and dropped waves that gives t = 2.8 (the exam's own z) is 2.8 × SE ÷ √(d × (1−d)).

| Window | Rule's error (bps) | Gap needed if the AI drops 30% | Gap needed if it drops 10% |
|---|---|---|---|
| 100 days | 88 | about 540 bps | about 820 bps |
| 182 days | 69 | about 420 bps | about 640 bps |
| 1 year | about 49 | about 300 bps | about 460 bps |
| 2 years | about 34 | about 210 bps | about 320 bps |

For comparison: the rule's whole mean on the check months was about +211 bps (+95 on the explore months).

Three reasons this table is a floor, not a forecast:
- The errors are for the 336-account rule over all 147 slices. A one-follower line at the 715 cut has fewer positions, so a larger error.
- The unit is the **crash day**, not the trade. At the 336 cut the explore found positions on 99 days of 7 months (E) and 50 days of 5 months (C). The 715 cut will have fewer days.
- The table assumes the AI's flags are independent of other things. They are not (a quiet day is a quiet day).

**Conclusion on size.** No realistic effect shows in under about 2 years. A model id lasts about 12 to 14 months (P10). So the P&L value of a frozen AI filter **cannot be verified at this project's rate.** That is a finding, not a failure of effort.

### 4.5 When the labels may meet outcomes
- Not before the exam's two looks are done, and not on FRESH's positions until then.
- Then one pre-stated, descriptive comparison: the mean net of "news found" against "none found", day-clustered, with the table above beside it. No decision from it unless it clears the exam's own bar.

### 4.6 The cost a month

Assumptions (mine, from the docs' prices): per call about 30,000 input tokens (mostly search results, which count as input), about 3,000 output tokens (thinking counts as output), 4 searches; 100 alerts; 3 repeats = 300 calls.

| Model | Per call | 300 calls |
|---|---|---|
| Haiku 5.5 | about $0.045 | about $14 |
| Sonnet 5.5 | about $0.13 | about $39 |
| Opus 5.5 | about $0.22 | about $66 |

- **Search is the main cost for Haiku** ($0.04 of the $0.045).
- Without web search the explainer (use 2) is about $0.03 a call: **about $3 a month**.
- Alerts arrive in bursts on crash days. A burst of 200 alerts could cost $26 in one hour on Sonnet 5.5. So: one call set per **wave**, not per coin; a daily cap; and a **workspace spend limit** in the Console. Otherwise the credits can run out in the middle of the crash that matters, and calls just stop (credits do not roll over).
- I did not read the rate limits for the Start tier. Check them before relying on a burst of calls.

---

## 5. What would make it not worth doing

Stop the pilot, pre-stated (the numbers are my suggestion; the owner rules):
1. **Coverage under about 20%** over the first 50 alerts. There is nothing to find in time, and the filter question is closed.
2. **Stability under about 80%** (all three replies agree). The label is noise.
3. **Most calls return after `t0 + 90 s`.** A gate could not have worked in time.
4. The audit of 30 shows the catalyst label wrong more than about 30% of the time.
5. Spend above budget, or the prompt or model changed. A change is a new test.
6. Anyone looks at labels against outcomes before section 4.5 allows.

And, apart from the pilot:
- If the owner needs a P&L answer within a year, no design here gives one.
- If using the AI means more rules to try on the same months, it hurts the one thing that makes this project honest.
- If the label is read as advice ("it said skip"), it breaks Iron rule 6.

---

## 6. Recommendation and cost

**Do now (no API spend):** keep using Claude for reading, review and red-teaming (use 1). Add one line to the working rules: an AI-suggested rule is a try and goes in the try log.

**Do after the exam's freeze, if you want it:**
- Use 2, the explainer: about $3 a month, facts and links only, in its own process and file.
- Optionally the 8-week pilot (use 3): $14 to $39 a month, one frozen id (Sonnet 5.5, or Haiku 5.5 if cost matters most), shadow only.
- Both together stay under $45 a month, well inside the $100 credit.
- Set the spend limit and the daily cap first.

**Do not do:** an AI verdict in the entry path; labelling the past with Claude; a P&L-based judgment of the AI inside two years.

**What will probably happen:** the pilot will most likely show that at +2 minutes there is little to find. That closes the AI-filter idea at $20 to $80 in total, which is a good price for a clear answer.

**Where this goes in the docs** (supervisor's call):
- **decisions:** your ruling on Iron rule 1 for outbound calls to Anthropic's API, public data only, key in `.env`.
- **docs/claude-external-apis.md:** Anthropic API facts from section 1.5, each dated 2026-11-20 with its source.
- **plan page:** an optional item "AI shadow pilot" and an optional item "calendar flags, research".

---

## 7. Questions for the owner, each with my recommendation

1. **Allow outbound calls to Anthropic's API, with public market data only?**
   - Recommendation: yes, but only for uses 1 to 3, and only after the exam's freeze. Reason: Iron rule 1's list does not name it, so it needs your ruling.
2. **Run the 8-week pilot?**
   - Recommendation: yes, shadow only, one model (Sonnet 5.5). It answers the only cheap question, whether news exists in time.
3. **Add the plain-language explainer to alerts?**
   - Recommendation: yes, facts and links, no trade words, after the freeze.
4. **Commission a small research item on calendar and announcement flags?**
   - Recommendation: yes. It is deterministic, free of look-ahead, and fits the way W4 was tested. Any new data source needs your approval under rule 1.
5. **Keep AI out of the entry path for good?**
   - Recommendation: yes, until a forward test with a frozen config can clear the exam's own bar. By section 4.4 that is not before 2028.

---

## 8. What I could not verify

- **Alpha Arena:** nof1's own pages returned 429 and 404. The numbers come from two news sites. The organiser's quotes are from Forklog, not nof1.
- **Listings only (not the papers):** Didisheim et al. (Economics Letters 2025); Look-Ahead-Bench; Chan 2003; Savor 2012; StockBench's numbers. The Sarkar-Vafa PDF would not extract, so I used the ICML listing.
- **Abstract pages only:** most arXiv items above. No full text was read beyond Lopez-Lira and Tang (first 100,000 characters), Gao et al. (HTML), the Thinking Machines post and the Anthropic docs.
- **2609.05663:** the summary I got was unclear on one number (the "choice stability" figures). I did not use it. The "not peer reviewed" note refers to a lab report it cites; the paper itself is a preprint.
- **2025-10-10:** I used secondary vendor and analyst pieces. They disagree on sizes and on whether a stablecoin de-peg played a part.
- **Not read:** Anthropic's rate limits; the `between_tools` thinking setting's effect on latency; real latency seconds (Anthropic publishes only a ranking, so plan to measure it).
- **Not searched:** a head-to-head of Claude and other model families on news labelling. The AMA and fleet papers suggest the backbone matters less than the setup, which is why I recommend a single frozen id and no model comparison.
- **ForecastBench** (Karger et al., ICLR 2025, arXiv 2409.19839) shows models approaching human superforecasters on general-event questions. I saw only search summaries, and it is a different task from short-horizon price prediction, so I give it no weight here.

*Holds and does not hold are verdicts on a test, never instructions to trade.*
