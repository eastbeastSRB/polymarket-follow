# External APIs — what we have VERIFIED

Each fact is dated and sourced: a live call, the provider's spec, or its
documentation. Read the section before calling an API; append what you learn;
never trust an undated claim about someone else's API. A fact that changes is
corrected in place with the new date, and its old form goes to decisions only
if a choice rested on it.

## Polymarket Perps — the public API (verified 2026-11-06; R1-API)

**Sources:** the OpenAPI spec (`docs.polymarket.com/api-spec/perps-openapi.json`,
383,007 bytes, byte-identical on 2026-11-06 22:16Z to the copy saved the same
day; it LAGS the live API and the changelog: `/v2/info/pnl`, `/v1/info/pnl`,
`/v1/info/equity`, `/v1/info/markets` and `/v1/info/stock-splits` answer live
but are not in it), the WebSocket spec (`asyncapi-perps.json`, 407,525 bytes,
identical), the changelog (`docs.polymarket.com/changelog/perps.md`, read
2026-11-06), the docs pages (downloaded 22:16Z on) and live calls from
2026-11-06 22:19Z to 2026-11-07 00:07Z. Evidence (scripts, outputs, raw replies, the docs as downloaded): the
supervisor folder's `workers/R1-API/`; the report is
`docs/reviews/r1-perps-api-2026-11-07.md`.
Earlier probe: `verify/SEED-PERPS-1106/` (13:59Z, 14:35Z).

### Access, terms, geography

- **Hosts:** HTTP `https://api.perpetuals.polymarket.com` (CloudFront + istio
  envoy; the `x-pmp-pod` header names the pod); WebSocket
  `wss://ws.perpetuals.polymarket.com/v1/ws`. Everything below is keyless GET
  under `/v1/info/` or `/v2/info/`; the public WebSocket channels need no
  authentication. Account, trade and blp routes are never called (Iron Rule 1).
  `POST /v1/info/position-snapshots` is a public read by POST — not called.
- **Terms** (polymarket.com/tos, effective 2026-08-11, read 2026-11-06): 4.2
  bans "robots, crawlers or similar data gathering and extraction tools to
  scrape or otherwise remove data from the Site, any other Interface, or
  Features"; the terms set no separate API rules and say Limits may be imposed;
  data may not be resold to professional capital-markets entities. Whether the
  public API counts as an "Interface" is not stated.
- **Geography:** order placement is barred in the US, Canada, Cuba, Iran, North
  Korea, Syria, Crimea, Donetsk, Luhansk; "read-only market data is not subject
  to these restrictions" (docs, Geographic Restrictions page, 2026-11-06).
- **The web app calls the same host:** polymarket.com's JavaScript bundles
  contain `api.perpetuals.polymarket.com/v1` and `ws.perpetuals.polymarket.com`
  (2026-11-06), so a browser open on polymarket.com/perps from this IP most
  likely spends the same bucket. Whether polymarket-lab's prediction-market
  hosts share it is not stated anywhere; no sign of sharing was seen.

### Rate limit — measured

- **Published:** 1,000 weighted tokens a minute per IP; over it HTTP 429
  `{"status":"err","error":"ip_rate_limited"}` with `retry-after: 1`
  (spec, docs). Weights per the spec: ping, time, registered, competitions 1;
  exchange, assets, instruments, tickers, statistics, bbo, index, fees,
  limit-tiers 2; klines, mark-history, portfolio, leaderboard 5; trades, funding,
  fills, position-fills, exchange-stats 10; book 2 / 5 / 10 / 20 at depth 10 /
  100 / 500 / 1000. `/v1/info/markets` weighs 2 (changelog 2026-11-05; the
  route is not in the spec). Cached reads cost 1 (fills, position-fills,
  mark-history 2 s; leaderboard 5 s; exchange-stats 5 min). Unpublished:
  `/v1/info/pnl`, `/v2/info/pnl`, `/v1/info/equity` (a fit of the 2026-11-06
  429s puts pnl at ~13-15; report Q2).
- **It is a token bucket with a burst, not a 60-second sum.** 2026-11-06
  22:52:40Z, after 132 s idle, fills reads for distinct addresses at 2 a second:
  52 answered, the 53rd (26.0 s in) got the 429; with the published weight 10
  that fits a bucket of ~90-100 tokens refilling ~16.5 a second (~1,000 a
  minute). A first, accidental 429 at 22:21:38Z came after 16 requests in 5.4 s
  (~145 tokens) while the 60-second sum was only 165. After a 120 s pause the first
  read answered 200. Steady load 22:40:30–22:50:29Z, 50 accounts once a minute,
  one read every 1.2 s (500 tokens a minute): 500 of 500 answered 200, latency
  median 306 ms.
- Replies carry no rate-limit header. The 429 reply carries `retry-after: 1`;
  the repeat of the same fills read inside ~2 s is byte-identical (cached, shared
  across pods); the portfolio is never cached.
- **WebSocket:** 50 connections per IP, 100 subscriptions per connection, 1,000
  inbound messages a minute per IP (docs 2026-11-06).

### Leaderboard — `GET /v1/info/leaderboard`

- Params: `window` day | week | month | all (default day); `sort_by` pnl |
  notional | account_value | roi (default pnl); `limit` 1–100 (default 25; 0 and
  101 → 400 "limit must be between 1 and 100"); `offset` ≥ 0; `address`.
  **`offset + limit` must not exceed 1000** (else 400 "offset + limit must not
  exceed 1000"): offset 900 limit 100 answers ranks 901–1000; offset 1000
  answers 400. Always sorted best first, so only the top 1,000 per
  window and sort can be listed. 2026-11-06 22:20Z.
- **The `address` row gives any account's rank beyond 1,000:** ranks 34,812 and
  34,915 of 34,940 were returned; the row also carries `instruments_traded` and
  `top_instrument_ids` (three most traded by volume). An address with no activity
  → 200, zeros, no `rank`. Lower- and mixed-case addresses both work; `account`
  is returned checksum-cased. A malformed address → 400 "invalid address".
- Row types: rank, instruments_traded numbers; account, pnl, notional,
  account_value, roi strings (decimals up to ~28 digits); `top_instrument_ids`
  array. Page: window, sort_by, timestamp (ms), total, entries.
- **`pnl`** = realized PnL − fees + funding, unrealized excluded; it equals the
  sum of `/v1/info/pnl` buckets over the window exactly (checked to 4 decimals
  on four accounts, 2026-11-06 23:0xZ). **Windows are UTC calendar:** day from
  00:00Z, week from Monday 00:00Z, month from the 1st, `all` from launch
  (verified by those sums; the day board reset at 2026-11-07 00:00Z: total
  6,739 at 23:58:59Z → 6,191 at 00:01:01Z, top pnl $198,077 → $108).
- `roi` = pnl / max(100, starting equity + peak net deposits), a decimal
  fraction; the ROI sort has no minimum equity: emptied accounts (account_value
  ~1e-7) and $100-class accounts top it (2026-11-06).
- **Freshness:** each (window, sort) is a snapshot with its own `timestamp`;
  at read time day, week and month were 0–60 s old (median 29–36 s), `all`
  6–281 s (median 143 s). Several pods serve different snapshots: `timestamp`
  can go back between reads (−67 s seen), and the address row can flap between
  values 6–59 s old. 169 reads 22:21Z–00:07Z, 2026-11-06/07.

### Fills — `GET /v1/info/fills?address=`

- Keyless; **only for registered accounts**: an unregistered address → 400
  `{"status":"err","error":"account not found"}` (same for portfolio,
  position-fills, pnl); `GET /v1/info/registered?address=` → `{"registered":bool}`.
  Address is case-insensitive (identical reply). Missing/invalid address → 400.
- Params: `start_timestamp`, `end_timestamp` (**start inclusive, end exclusive**),
  `instrument_id`, `cursor`, `sort` desc (default) | asc. 100 rows a page
  (a `limit` param is ignored). Default window: 30 days before the request.
  `start_timestamp` far in the past clamps to the account's first fill (the
  all-time #1's first fill is 2026-06-22T16:30:38Z).
- **`instrument_id` + a long window → HTTP 413 `{"status":"err","error":"payload_too_large"}`**
  (reproduced with start=0).
- Paging: reply `{data, more, cursor}`; the cursor is base64 JSON
  `{"ts":<ns>,"id":<trade_id>}`; walking 5 newest-first pages (500 rows) gave 0
  duplicates and the same rows as an oldest-first re-read; the legacy cursor (a
  trade id) works unfiltered and gives the identical page.
- Row fields as received: trade_id, order_id (JSON integers, up to 16 digits),
  instrument_id, timestamp (integers; ms); side `long` | `short`; price,
  quantity, fee, builder_fee, total_fee, previous_size, previous_entry_price,
  pnl (strings, pnl up to 28 digits); fee_asset `pUSD`; taker, liquidation, adl,
  settlement (booleans); hash (always `"0x"` in 4,063 fills). `builder` and
  `liquidation_details` are optional; neither appeared in 4,063 fills.
- **Meaning (measured, 2026-11-06):** `pnl` is the GROSS realized PnL of the
  fill, `(price − previous_entry_price) × quantity × direction` on a reduce
  (checked on 31 reduces, error ≤ 1e-6), 0 on opens and adds; fees are separate
  (`total_fee = fee + builder_fee`; a negative `fee` is a maker rebate — 838 of
  4,063). **`previous_size` (signed) and `previous_entry_price` are the state
  BEFORE THE WHOLE ORDER EVENT:** all fills of one order in one matching event
  share them; the size after the event is `previous_size + Σ signed quantity` of
  those fills (grouping key: same `order_id` and same `previous_size`).
  `taker` true = the aggressing side; liquidation fills seen were taker reduces.
  Within one millisecond the order of rows is by random id, not by execution.
- **A fill's `trade_id` is the tape's trade id:** 38 of 38 fills (maker and
  taker, several accounts) found on `/v1/info/trades` with the same trade_id,
  timestamp, price and quantity; the tape `side` is the TAKER's side (a maker
  fill shows the opposite side). Both accounts of a trade share the trade_id.
- **IDs are random 53-bit integers**, not time-ordered, not growing: 4,063
  trade_ids and order_ids spread evenly over 0…2^53−1 (max 99.98% of
  9,007,199,254,740,991; none above), correlation with time −0.02. All fit a
  JavaScript number (spec `x-js-safe-integer`); they collide only at scale
  (collision odds: report Q6; corrected 2026-11-07).
- **Lag:** a fill first showed on the fills read a median 3.96 s after its
  `timestamp` with a 5 s poll per account (p90 6.1 s, max 8.6 s; 92 fills, 3
  accounts, 22:29–22:39Z); minus half the poll interval the API's own lag is about
  1–1.5 s, one fill took more than 3.1 s. Server clock − ours +24 ms (median of
  10 `/v1/info/time` reads).

### Position-fills — `GET /v1/info/position-fills?address=&instrument_id=`

- `instrument_id` required (400 "missing field `instrument_id`"); fills of the
  current open cycle (starts when the position opens from flat or flips), 100 a
  page, `cursor`, `sort`; an instrument not held → 200 `{"data":[],"more":false}`.
  Cursor = base64 JSON `{ts, id, seq, end, aid, iid}` (engine sequence numbers).
  Cycles of 119 fills were seen (page 2 with the fresh cursor: 19 rows).
  **A cursor read after the position changed → HTTP 400
  `{"status":"err","error":"cursor no longer matches the current position"}`**
  (met twice, 2026-11-06 23:12Z and 23:15Z, after a new fill on that
  instrument; whether the cycle itself changed was not checked; the page read
  straight after page 1 answered 200).

### Portfolio, equity and PnL history

- **`GET /v1/info/portfolio?address=`**: `positions[]` {instrument_id, symbol,
  size (signed string), entry_price, unrealized_pnl, return_on_equity}, `equity`
  (string), `coverage`, `timestamp` (ms). **No leverage, margin mode or
  liquidation price** (leverage is returned to the owner only). Live, never
  cached: `timestamp` is the server's request time. A position change showed in
  the portfolio in the same 5 s tick as the fill or one tick earlier (12
  fill-bearing ticks), never later.
- **`GET /v1/info/pnl?address=&interval=&start_timestamp=`** (v1, public, not in
  the spec): `[[bucket_start_ms, "realized net PnL in the bucket"]]` with
  fees and funding included, epoch-aligned, omitted when nothing realized;
  intervals 1h 4h 1d 1w; 1,000 points max (`more`). **`GET /v1/info/equity`**
  (same, public): `[[sample_ms, "equity"]]`, the last sample of each bucket.
- **`GET /v2/info/pnl?address=&interval=&start_timestamp=`**: `interval` 1s 1m
  5m 15m 30m 1h 4h 6h 12h 1d 1w (`1w` is accepted; the lab's 400 was most
  likely the missing `start_timestamp`, which answers 400); `start_timestamp` required; reply `[[ts_ms, "CUMULATIVE
  total PnL"]]` = equity (unrealized included) − net capital. **It answers only
  for accounts whose capital history is known: 9 of 50 leaderboard accounts
  (all started on or after 2026-10-20); the rest answer `{"data":[],"more":false}`.**
  Equity minus this series gives the net capital: one account showed 100 →
  10,100 (+10,000 deposit, 2026-11-03 ~11:00Z) → 1,749.10 (−8,350.90 withdrawal,
  2026-11-04 ~15:00Z) — deposits and withdrawals are visible to the hour.

### Market data

- **Tape `GET /v1/info/trades?instrument_id=`**: no account field; rows
  {trade_id, instrument_id, side (taker's), price, quantity, settlement,
  timestamp, hash}; 100 a page, `start_timestamp`, `end_timestamp`, `sort`,
  `cursor` (base64 `{ts,id}`; a bad cursor → 400 "invalid cursor"); history from
  the first trade (BTC: 2026-05-29T10:36:01Z); a 100-trade page spans 50–140
  minutes on major instruments now.
- **Klines `/v1/info/klines`**: `interval` 1s 1m 5m 15m 30m 1h 4h 6h 12h 1d 1w;
  rows `[open_time_ms, open, high, low, close, volume, trades]` (prices as
  strings); only populated candles; 1,000 a page with `more`; history from the
  first trade at every interval, 1s included. **Mark history
  `/v1/info/mark-history`**: `[bucket_ms, last_mark]`, from 2026-05-28T01:26Z,
  1,000 a page; at `interval=1s` R8's period is covered with short holes:
  10,918 windows of 1,000 s (2026-09-26 → 11-07, 80 instruments) held 67
  missing seconds-runs in 42 windows, 927 s in all, the longest 73 s
  (2026-10-20 15:12:21Z on several instruments; R8-PRETEST's capture, checked
  by R8-REVIEW 2026-11-09) — a reader takes the last mark at or before the
  instant and sets a staleness limit (R8: 300 s). **Funding `/v1/info/funding`**: `{funding_rate, timestamp}`, one
  per hour for every instrument, at most 100 a page, returned NEWEST FIRST.
  Without `start_timestamp` the reply held 24 rows (the last 24 hours; 22:55Z
  on 2026-11-06 and, in the supervisor's read, ~00:10Z on 2026-11-07; the spec
  does not state the default). With `start_timestamp=0` the newest 100 rows came
  back with `more` true and no cursor; paging back with `end_timestamp` was not
  tested. Positive rate = longs pay shorts (docs).
- **Now-only reads:** `/v1/info/bbo`, `/book` (depth 10 | 100 | 500 | 1000; 50 → 400),
  `/tickers`, `/statistics`, `/index`, `/fees`, `/instruments`, `/exchange`:
  server-cached 1–2 s (`cache-control: public, max-age=1..2`); a past instant
  cannot be asked. Served through CloudFront: on 2026-11-09 420 of 1,366 reads
  were cache hits (bbo and book `age` ≤ 1 s), and `/instruments` once came with
  `age: 393` — a reply can be minutes old (R3-WEEKDAY, 14:10:59Z).
- **Thin names' books can be stale or holey** (2026-11-09, R3-WEEKDAY):
  NCLD-USD's book stood 540 bps wide from 14:30Z to ~14:40Z; two of 22 PRL-USD
  book sides had a hole 1,454–2,491 bps beyond the half-spread for $1,000.
  SKHYNIX and SAMSUNG marks sat ~70–100 bps under their books while Korea was
  closed.
- **Market sessions** (docs `perps/learn-about-trading/market-sessions`, read
  2026-11-09 14:20Z): five states — Regular, Overnight, Weekend, Disrupted,
  Halted; "each market has its own schedule", with no hours or time zone given.
- **Instruments:** 90 enabled (41 crypto, 38 equity, 6 index, 4 commodity, 1
  pre_ipo); max leverage 3–50 by instrument; `funding_interval` "1h" everywhere;
  `price_decimals`/`quantity_decimals` give tick and lot; no session field.
- **Fees** (`/v1/info/fees`): the $0 tier pays taker 0.04%, maker 0.0125% of
  notional, the top tier ($1B/30 days) taker 0.02% and maker −0.005%.
- **Exchange stats** `/v1/info/exchange-stats`: window ≤ 31 days (32 → 400).

### Competitions, registered, builder

- `/v1/info/competitions` (list), `/competition?competition_id=`,
  `/competition/leaderboard`, `/competition/account?competition_id=&address=`
  (weight 1; any address; `qualified`, `row_state` live | disqualified …,
  volume, boosted_volume, pnl split, `locked_positions`): one live competition
  (2026-11-02 14:30Z to 2026-11-16 14:30Z, 77 ranked). `/v1/info/builder?address=`
  is about builder accounts; no fill carried a builder fee (4,063 fills).

### WebSocket (public channels, 22:30–22:40Z)

- Subscribe `{"id":1,"req":"sub","chs":["trades::6","bbo::6"]}` → `{"id":1,"data":[{"status":"ok"},…]}`;
  frames `{ch, ts, ets, sq, data}` (`ts` server send time, `ets` newest reflected
  event, `sq` one growing sequence number per connection, not per channel);
  trades `data` is an ARRAY of {tid, iid, side, p, qty, settlement, ts, hash};
  bbo {iid, bp, bq, ap, aq}; tickers {iid, idx, mark, last, mid, oi, fr, nxf}
  pushed 10 a second. **No account field.** First frame ~250 ms after connect;
  a trade frame arrived a median 108 ms after the trade's `ts`. Ping
  `{"id":n,"req":"post","op":{"type":"ping"}}` → pong; the docs say 60 s idle
  closes the connection, but an idle connection (no subscribe, no message)
  stayed open 68 s and two 120–150 s connections ran without a drop. One
  connect took 61.8 s to open (others ~1.0 s).
- **A connection can go silent with no close and no error** (2026-11-09,
  R3-WEEKDAY): after 44 minutes of ~920 frames a second (`tickers::all` + two
  `book::<iid>`), the last frame came at 15:13:59Z and nothing followed for
  7 m 56 s while HTTP kept answering; a new connection worked. Detect "no frame
  for 15 s" and reconnect.
- Every fills-channel, orders, balances and backstop channel is private
  (authentication needed) and was not touched.
