# WAVE-CHECKS — what Hyperliquid's and Lighter's public data contains

WAVE-CHECKS (Sonnet 5.5, high), 2026-11-13 23:27Z – 23:36Z (UTC; every stamp
from `date -u`), for polymarket-follow's supervisor: the first keyless checks
for WAVE-H that decisions 2026-11-13 ("the two outside researches — the
owner's ruling", call 3) approved. Evidence: the numbered request table in
the supervisor folder's `workers/WAVE-CHECKS/progress.md` (38 requests) and
the facts in `docs/claude-external-apis.md`, section "Other venues (research,
read-only)". **A review decides nothing.**

**Conduct.** 38 requests of the 40 allowed: 9 web or browser reads (the
terms), 22 to AWS's public bucket (20 listings, 2 files), 7 read-only POSTs to
Hyperliquid's `/info`. Generic User-Agent `research-check/1.0`; at least 1.5 s
between requests in a batch; no account, no key, no payment, no `/exchange`,
no requester-pays bucket, no call to Polymarket. K8's wording was read before
either download. Two files were downloaded (K0's one hour, L1's one day) and
deleted. Packages, in the scratchpad only: `lz4js` 0.2.0 (ISC), `hyparquet`
1.33.0 (MIT); ZSTD read through Node 24's own `zlib.zstdDecompressSync`.
Nothing was installed in the repository. Nothing counted, no price analysed:
the examples below show fields; the replies' dates were 2025-07-28 (sizing
months) and, for the one backstop example, 2026-08-22 (Polymarket's own
months, shape only). **No record of 2025-08-01 → 2026-05-28 was read.**

## Answers

**K0 — the free AWS copy holds Hyperliquid's fills, and more. Yes.**
- `s3://aws-public-blockchain/v1.1/hyperliquid/mainnet/` is the only
  sub-prefix, and holds seven datasets (listed 2026-11-13):

  | Dataset | Days listed | Notes |
  |---|---|---|
  | `node_fills_by_block/hourly/<YYYYMMDD>/<h>.lz4` | 2025-07-27 → 2026-11-13, 475 days, no day missing | one sampled day, 2025-07-28: 24 files, 744,235,010 B (0.74 GB), 21–31 MB an hour |
  | `node_fills/hourly/…` | 2025-05-25 → 2025-07-27, 64 days | one sampled day, 2025-07-01: 24 files, 392,895,496 B, 13–15 MB an hour |
  | `node_trades/hourly/…` | 2025-03-22 → 2025-05-25, 65 days, plus one stray day 2025-06-21 | not opened |
  | `market_data/<date>/<hour>/l2Book/<COIN>.lz4` | 1,285 days 2023-04-15 → 2026-11-12, with holes | below |
  | `asset_ctxs/<date>.csv.lz4` | 2023-05-20 → 2026-11-12, 1,272 files | whole folder about 10.3 GB; 1–12 MB a day; not opened |
  | `explorer_blocks/<n>/` | 13 block-number buckets, 0 → 1,200,000,000 | not opened |
  | `misc_events_by_block/hourly/` | not listed deeper | not opened |

- **Books:** `market_data` holes (days with no folder), by the listing:
  2024-01-10, 2024-02-01, **2025-10-17 → 2025-10-22**, 2025-11-18 → 2025-11-25,
  2026-07-08, 2026-07-12 → 2026-07-17. 2025-10-10, the crash day, is present.
  One hour (2025-07-28 12h) holds 201 coin files of 0.1–0.7 MB each, 101 MB
  all together; the files can be fetched one coin-hour at a time. 31 of
  MARKET-1's 38 coins have a file in that hour; ZEC, LIT, PONS, CASHCAT,
  USELESS, XPL and XMR do not (by name; not yet listed that day, I assume).
- **The fill file's schema** (one downloaded hour, `node_fills_by_block`
  2025-07-28 12h, 25,096,071 B, 120,851,547 B decoded, 46,562 lines): one JSON
  object a line, `{local_time, block_time, block_number, events}`; `events`
  is a list of `[user, fill]` pairs (empty in many blocks). A fill has
  `coin, px, sz, side, time, startPosition, dir, closedPnl, hash, oid,
  crossed, fee, tid, feeToken` and optionally `cloid, builder, builderFee,
  liquidation`. `side` "A" sells, "B" buys. `liquidation` is
  `{liquidatedUser, markPx, method}`.
- **Whether a fill names its account: yes** (the `user` of the pair).
- **Whether liquidations are marked: yes, on both legs of the match.** In the
  hour's file the only method seen was "market". Three records (the third
  needs no more than the second's `liquidatedUser`):
  1. a plain fill: `["0x644f…", {"coin":"AVAX","px":"27.325","sz":"16.39","side":"B","time":1753704000092,"startPosition":"-56.83","dir":"Close Short","closedPnl":"-0.059004","hash":"0x000…0","oid":122245217342,"crossed":false,"fee":"-0.004478","tid":964005809299725,"cloid":"0x1f73…","feeToken":"USDC"}]`
  2. the counterparty's leg of a liquidation (an HLP child vault, the
     maker): `["0x31ca8395cf837de08b24da3f660e77761dfb974b", {"coin":"ALT","px":"0.039114","sz":"1133.0","side":"B","time":1753704242362,"startPosition":"-262454.0","dir":"Close Short","closedPnl":"0.833888","oid":122246476694,"crossed":false,"fee":"0.0","tid":36189424002055,"liquidation":{"liquidatedUser":"0xa6c1437a71817662fba2cd53f892f68846d7d3ae","markPx":"0.03915","method":"market"},…}]`
  3. the liquidated account's own leg of the same trade (same `tid` and
     `hash`): `["0xa6c1…d3ae", {"coin":"ALT","px":"0.039114","sz":"1133.0","side":"A","time":1753704242362,"startPosition":"1133.0","dir":"Close Long","closedPnl":"-5.550567","oid":122246479855,"crossed":true,"fee":"0.019144","tid":36189424002055,"liquidation":{"liquidatedUser":"0xa6c1…d3ae","markPx":"0.03915","method":"market"},…}]`

  So WAVE-ELSEWHERE's H4 holds for method "market": the record whose user
  equals `liquidatedUser`, `crossed` true, `startPosition` non-zero and
  opposite in sign to the side. **The free copy is enough for the fills, with
  no AWS account and no requester-pays.**

**L1 — Lighter's day file carries the liquidation mark and both accounts.
Yes.**
- The prefix lists one file, 53,421,855 B (51 MB), for 2025-07-01. ZSTD
  Parquet, one row group, 43 columns, a header of 770,163 rows (read from
  the header, not counted), written by `parquet-cpp-arrow` 24.0.0 from a
  Spark 3.5.5 job.
- **Columns:** `id, created_at, updated_at, ask_account_id, bid_account_id,
  size, price, usdc_amount, ask_id, bid_id, l2_block_height, timestamp,
  tx_hash, market_id, trade_type, is_maker_ask, fee_account_id, maker_fee,
  taker_fee, taker_position_size_before, taker_entry_quote_before,
  taker_initial_margin_fraction_before, taker_position_sign_changed,
  maker_position_size_before, maker_entry_quote_before,
  maker_initial_margin_fraction_before, maker_position_sign_changed,
  ask_client_id, bid_client_id, transaction_time, ask_account_pnl,
  bid_account_pnl, integrator_taker_fee, integrator_taker_fee_collector_index,
  integrator_maker_fee, integrator_maker_fee_collector_index,
  taker_allocated_margin_usdc_before/_after,
  maker_allocated_margin_usdc_before/_after, ask_order_version,
  bid_order_version, public_market_index`. Integers, 64-bit, as numbers
  (price and size are scaled integers; the scale is not in the file).
- **The type:** `trade_type`, a string; its values in that day's file are
  `"trade"` and `"liquidation"` (the distinct values only, nothing counted).
  `deleverage` and `market-settlement` did not appear that day.
- **Both accounts:** `ask_account_id` and `bid_account_id`, with
  `is_maker_ask` (the taker is the other side). **The position before the
  taker's trade is in the file** (`taker_position_size_before`,
  `taker_position_sign_changed`), so M4's "reducing" can be tested as M4
  tests it.
- **Two example rows** (long fields cut; every column is in the row):
  - a liquidation: `trade_type "liquidation"`, `ask_account_id 37274`,
    `bid_account_id 281474976710654`, `is_maker_ask false` (so the ask side,
    37274, is the taker), `market_id 2`, `taker_position_size_before 8`,
    `taker_position_sign_changed true`, `taker_fee 10000`, `maker_fee 0`,
    `timestamp 1751328330567` (ms; 2025-07-01T00:05:30Z);
  - a plain trade: `trade_type "trade"`, `ask_account_id 18224`,
    `bid_account_id 281474976710654`, `market_id 24`, `taker_fee 0`.
- **Not in the file:** a coin name (only `market_id`; the id-to-coin map must
  come from Lighter's API, not read here); the 281474976710654 account is on
  the maker side of both rows (my reading: a pool account, 2^48 − 2; not
  verified).
- One line for the plan: the liquidated account is the taker; the file's
  taker position fields say whether the trade reduced it.

**K1 — all 38 of MARKET-1's coins trade on Hyperliquid's first dex, none
delisted. Yes.** `{"type":"meta"}`: 235 `universe` entries, 179 not flagged
`isDelisted`; each name matches by name, KPEPE and KSHIB as `kPEPE` and
`kSHIB`. The entry position (the asset id) shows how late each was listed:
SOL 5, AVAX 6, BNB 7, ARB 11, DOGE 12, SUI 14, kPEPE 15, XRP 25, … HYPE 159,
VIRTUAL 162, FARTCOIN 165, MORPHO 173, VVV 178, KAITO 185, PUMP 200, XPL 203,
ZEC 214, LIT 223, XMR 224, CASHCAT 231, PONS 232, USELESS 233. The seven
without a book file on 2025-07-28 are all among the last. Same name does not
prove the same asset: LIT, PONS, CASHCAT and USELESS in particular are small
tokens; to be checked against the pair on Polymarket before the freeze.
`{"type":"perpDexs"}`: 11 elements, the first `null` (the main dex), then
`xyz flx vntl hyna km abcd cash para mkts io` (builder dexes; `xyz` lists
stocks and commodities as `xyz:AAPL`). 139 other live first-dex markets exist
beside the 38, BTC and ETH.

**K2 — a real liquidation fill in the API. Yes.** Five reads:
1. `vaultDetails` for HLP: name "Hyperliquidity Provider (HLP)",
   `relationship {type: "parent", data: {childAddresses: [7]}}` (the vault's
   own address is the documentation's example).
2. `userFills` for child `0x31ca…` (the maker in K0's example): 2,000 fills,
   none with a `liquidation` object (a market maker, not the liquidator).
3. `userFillsByTime` for the liquidated account of K0's example, a 100-second
   window of 2025-07-28: **the one own fill, identical to the file's
   record**, plus `twapId: null`. The API reaches back to July 2025 for an
   account.
4. `userFills` for child `0x2e3d…`: 2,000 fills; fills with `liquidation`
   objects, method "backstop" (this child is the liquidator vault).
5. `userFillsByTime` for the account that read 4 named as liquidated, 100 s
   of 2026-08-22: **seven market-method fills** (all `crossed` true, `dir`
   "Close Short", `startPosition` non-zero, one block time) and, 21 s later,
   **one backstop fill of the account's own: `side` "B", `dir` "Liquidated
   Isolated Short", `crossed` false, `fee` "0.0"**, `startPosition` the
   remaining short; the vault's leg of that backstop fill (read 4): `side`
   "A", `startPosition` "0.0", `crossed` true, `fee` "0.0", the
   `liquidatedUser` the other account.
- **For H4:** a backstop liquidation's own leg is **not** `crossed`, so H4
  as written counts only market liquidations. The plan decides whether
  backstop counts, and how, before the freeze (one example only; not counted
  or settled here).
- Also: every fill of one order shares a `time` and a `hash`; the liquidated
  account's market fills come as several fills at one instant, so a plan must
  group by `oid` or `time`.

**K8 — the terms. Nothing forbids this use; nothing grants it either.**
(Paraphrase; the pages are not mine to copy. The read dates are 2026-11-13.)
- **AWS's registry entry** (`registry.opendata.aws/aws-public-blockchain/`):
  its "License" is a link to the GitHub LICENSE of `aws-samples/digital-assets-examples`,
  an MIT-style text covering "the Software and associated documentation
  files" — code, not data; the README says MIT-0 for the code. **The registry
  page states no terms for the data.** The data's own words:
  Lighter's guide says the files "can be downloaded without an AWS account,
  credentials or payment"; it states no licence.
- **Hyperliquid** (`app.hyperliquid.xyz/terms`, a JavaScript page that a
  plain fetch reads as empty; read in the browser pane, "Last updated on
  June 15, 2026", Hyperliquid Corp.): they govern the website **Interface**,
  not the API or the archive. Nothing on personal or non-commercial research,
  scraping of public data or bulk download. What bears: 1.6 — the Interface
  is not available to "Restricted Persons" (residents or entities of the
  United States or Ontario, sanctioned places); 3.1.5 — no VPN or proxy to
  hide location; 3.1.8 — no bots or scripts that exceed reasonable use,
  bypass rate limits or disrupt the Interface. No clause about the
  documentation's API or the S3 data.
- **Lighter** (`lighter.xyz/terms`, renders; "LAST UPDATED DECEMBER 29, 2025",
  Elliot Technologies, Inc.): cover the website, the Interface, the Protocol,
  the API and the token. Not available to persons in the United States,
  Canada, the United Kingdom, China, North Korea, Russia, Ukraine, Cuba,
  Iran, Venezuela, Sudan, Belarus, Myanmar or Syria. Section 5 (API): no use
  that damages or impairs the Services, nothing unlawful or fraudulent, no
  malware; it may end API support or limit it at any time; section "Access":
  it may suspend for "unauthorized access to the API". **Nothing on research,
  public data, the dataset or bulk download.**
- **What it means.** No text read prohibits a personal, non-commercial,
  low-rate read of the public API or the public bucket; none grants a licence
  to the data either (the bucket has no licence text; Hyperliquid's data
  carries none read). The geographic limits are on using the Services; the
  owner knows where they are and is the one to judge whether they apply to
  a bucket read. This is a reading of the texts, not legal advice. Keep the
  data to this project: no redistribution.

## Can WAVE-H be done for free?

**Yes, for everything the design needs that was checked.**
- **Fills with accounts and liquidation marks** for the test months: free,
  in the AWS bucket, no account, no key, no requester-pays. The files are
  the node's own "by block" files in the API format (the same names as
  Hyperliquid's paying bucket; a byte comparison with the paying copy was not
  made).
- **Size is the only cost:** one sampled day was 0.74 GB compressed
  (2025-07-28); a day in the crash months may be several times that. If the
  test's 300 days resembled that day it would be about 220 GB compressed,
  which a streaming reader (download an hour, reduce, delete) never holds at
  once. [A: one day sampled; the listing of every day's size was not made.]
- **Books:** the free bucket's `market_data` also holds the L2 books, per
  coin and hour, with holes (2025-10-17 → 22 and 2025-11-18 → 25 among them);
  a leg in a hole is priced at the tape (H8 (2)) or counted unpriced.
  Whether the books' depth and spacing serve M7's walk is for the plan to
  check on one hour.
- **Funding:** `asset_ctxs` (daily CSV) is in the free bucket; not opened.
  Funding history is also in the API (not read here).
- **What the paid route would buy:** nothing found. At most a cross-check of
  the free copy against the paying bucket and, if the paying bucket has no
  holes where the free one has (unknown; its own page warns that data may be
  missing), those days' books. Not a reason to open an AWS account now.
- **Lighter** is also free and needs no account: one day 51 MB, with the
  liquidation mark and both accounts. Its `market_id`-to-coin map and the
  prices (no book) are the open points.

## Questions, each with a recommendation

1. **Is a read of public data under the terms in K8 acceptable?** The owner
   decides (the terms limit the Services by country and are silent on data).
   *Recommend: yes, as a low-rate personal read; keep the data local.*
2. **Should the plan treat backstop liquidations?** One example says the own
   leg is not a taker's. *Recommend: the plan's first rule to settle on a
   counted day of the sizing months (counts only), before the freeze; M4's
   "taker true" on Polymarket's own backstop fills should be looked up in
   the frozen MARKET-1 data first.*
3. **Seven of the 38 coins had no book on 2025-07-28.** *Recommend: H3 as
   written (the coins with a fill in the sizing window's first week); the
   plan prints the list.*
4. **Lighter's `market_id` map** is not in the file. *Recommend: a separate
   small check (one read of Lighter's public market list) only if WAVE-L
   is wanted; WAVE-H does not need it.*
5. **A sizing hour of the books** (one coin, one hour) is the next free
   check for H8. *Recommend: in the plan's first step.*

Never opened: the recordings, the collector's database, the run folder, the
paper experiment's and MARKET-1's data, anything of the supervisor's folder
but this worker's own. No agent started; polymarket-lab not touched; no push.
