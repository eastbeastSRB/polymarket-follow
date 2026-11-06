# External APIs — what we have VERIFIED

Each fact is dated and sourced: a live call, the provider's spec, or its
documentation. Read the section before calling an API; append what you learn;
never trust an undated claim about someone else's API. A fact that changes is
corrected in place with the new date, and its old form goes to decisions only
if a choice rested on it.

## Polymarket Perps — the public API (verified 2026-11-06)

**Sources:** the docs' API overview
(`docs.polymarket.com/api-reference/perps/overview`), the OpenAPI spec
(`docs.polymarket.com/api-spec/perps-openapi.json`, 383,007 bytes as
downloaded 2026-11-06), the WebSocket spec
(`docs.polymarket.com/asyncapi-perps.json`), the rate-limits page and the
changelog (`docs.polymarket.com/changelog/perps`); live calls 2026-11-06
13:59Z and 14:35Z. The probe, its outputs and the specs as downloaded are in
the supervisor folder's `verify/SEED-PERPS-1106/`.

- **Hosts:** HTTP `https://api.perpetuals.polymarket.com`; WebSocket
  `wss://ws.perpetuals.polymarket.com/v1/ws`. Market data and the per-account
  reads below are keyless; trading and account routes need authentication and
  are never called here (CLAUDE.md, Iron Rule 1).
- **`GET /v1/info/leaderboard`** (keyless): `window` day | week | month | all
  (calendar UTC boundaries; `all` since the exchange's launch), `sort_by` pnl
  | notional | account_value | roi (default pnl), `limit` 1–100 (500 answered
  400, "limit must be between 1 and 100"), `offset`, `address` (adds that
  account's own row). Live, all/pnl: 34,877 accounts ranked; offset 100 gave
  ranks 101–200 with no overlap; day 6,538, week 8,695, month 8,991 ranked. A
  row: rank, account, pnl, notional, account_value, roi. PnL is realized PnL
  minus fees plus funding; unrealized PnL is excluded (spec).
- **`GET /v1/info/portfolio?address=`** (keyless): equity and open positions —
  instrument_id, symbol, size (signed), entry_price, unrealized_pnl,
  return_on_equity. Live: the all-time #1 held 11 positions across crypto, US
  stocks, gold and silver.
- **`GET /v1/info/fills?address=`** (keyless): every fill of an account —
  trade_id, order_id, instrument_id, side (long | short), price, quantity,
  taker, fee, previous_size, previous_entry_price, pnl, liquidation, adl,
  settlement, timestamp (ms), hash. Newest first by default (`sort` asc |
  desc), 100 a page with `more` and `cursor`; the default window starts 30
  days before the request; with `instrument_id`, at most 250,000 rows are
  scanned (413 above). From `previous_size` and `side` a fill reads as an
  open, add, reduce, close or flip. Live: the all-time #1's newest 100 fills
  spanned 64.4 minutes — 48 adds and 52 reductions over 7 instruments, every
  one a taker fill.
- **`GET /v1/info/position-fills?address=&instrument_id=`** (keyless): the
  fills of the account's current open position cycle (a cycle starts when the
  position opens from flat or flips), at most 100 a request.
- **`GET /v2/info/pnl?address=&interval=`** is public per the changelog; a
  first call with `interval=1w` answered 400. Its parameters are not yet
  measured.
- **No account on the public stream:** the WebSocket `trades` channel carries
  tid, iid, side, p, qty, ts, hash, settlement; the `fills` channel is the
  account's own and needs authentication. Following another account is
  therefore by polling its fills.
- **Rate limits** (the docs' rate-limits page, read 2026-11-06): 1,000
  weighted tokens a minute per IP; lightweight reads weigh 1, broad
  unfiltered reads up to 20; over the budget, HTTP 429 or `ip_rate_limited`.
  WebSocket: 50 connections per IP, 100 subscriptions per connection, 1,000
  inbound messages a minute per IP. The live replies carried no rate-limit
  header. The real weight of each read we use is not yet measured.
- **Order placement is geo-restricted** (the docs' Geographic Restrictions
  page) — irrelevant here: this project never places orders.
