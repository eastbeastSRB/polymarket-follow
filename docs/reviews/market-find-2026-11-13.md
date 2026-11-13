# MARKET-FIND — the small-coin lead made exact, and a search for two more market patterns

MARKET-FIND (Fable 5.2, max), 2026-11-13 01:47Z – 02:45Z (UTC; every stamp
from `date -u`), for polymarket-follow's supervisor: the investigation that
decisions 2026-11-13 ("the market lead") asked for before MARKET-1 is planned.
Part A makes STRATEGY-REVIEW's small-coin lead exact; part B searches, with a
fixed cap on tries, for at most two more market patterns. Evidence: the
supervisor folder `workers/MARKET-FIND/` (`progress.md`; `explore/`, every
script with its saved output). **A review decides nothing.** It recommends
rules for a test, never trades.

**The blind store held.** Nothing stamped at or after 2026-11-07T00:00:00Z was
read; every script throws on a seed fill, a tape row or a panel end at or
after the cut (none met). Never opened: the recordings, the collector's
database, the run folder. Of `F:\polymarket-follow\paper\` only `seed\` was
read (I listed that folder's first names once, and the file names of
`panel-precut\`). In `F:\polymarket-follow-research\` I read the kit's panel
and R8's captured tape, printed one row of the kit's labels file to see its
fields (not used), listed names in KIT, R8-PRETEST, R2-STYLE and FIND-SLOTS,
and opened nothing of R2-STYLE, R3-PAPER, R3-WEEKDAY, R8's `probe`, any
`holdout` or any FIND folder. From the repository: the kit's
`population.json` (which pool accounts are on the notional board),
`price-table.json` (R8's cost table: measured on two mornings after the cut,
a published table of costs with no outcome in it, the one the frozen
experiment uses) and `rules.md` (R2, R3, R3a). No call to Polymarket's API.
Web: two searches, generic words. No agent started; polymarket-lab not
touched; nothing in the repository changed but this file. No run needed a
FIND-SLOTS slot (each took under ten seconds and far under 1 GB).

**Explorations on the old weeks, each written in `progress.md` before it ran,
all labelled exploring:** six scripts of shapes, counts and the period's
description (S0–S5, no outcome); seventeen for part A (A1–A14 with A9b, A9c
and A12c); eleven tries for part B (B1–B11 of the twelve allowed). Section 7
lists them with every print that was not in the plan written first.

## For the owner, in one page

*Words.* A **bp** is 0.01%. **Small coins** are every crypto market but BTC
and ETH (38 here, SOL among them). A **liquidation** is the exchange closing
a trader's position by force; a **forced sell** closes a long. The **tracked
accounts** are the 1,602 accounts whose trades the experiment reads. "**Came
back**" is the result of the position against the forced side, on the mark
price, before costs unless "net" is said; **net** is after a taker's round
trip (about 13 bps at $1,000) and funding. "± x" is one standard error,
counting days and markets, not events. **Exploring** means measured on weeks
already studied: it describes, it never decides.

**1. What the lead looks like now: it is one thing, a wave.**
- **A wave** = at least two different tracked accounts liquidated the same way
  in small coins within an hour. A liquidation that comes in a wave was
  followed by the coin's price coming back **+310 ± 68 bps over the next 24
  hours** (153 cases on 47 of the 68 days), **net +297**. A liquidation with
  no second account: **+22 ± 35 — nothing.** One account wiped out in several
  coins at once is not a wave either (+4 ± 105).
- **Where it lives.** After forced sells (+274 ± 84) and forced buys (+413 ±
  98); in September, when every small coin rose (+255 ± 85), and in October,
  when nearly all fell (+321 ± 77); in 9 of 10 weeks, 28 of 30 coins, 37 of
  47 days; in thin and busy coins alike; with either half of the tracked
  accounts alone (+299 ± 147, +379 ± 96). The size of the liquidation does
  not matter (a median of $477, half the usual minute's trading): it marks
  the moment, it does not make the move. About three quarters of the move
  back is the whole small-coin market's; at the same moments ETH came back
  +111 ± 49 and BTC +62 ± 37. BTC's and ETH's own liquidations, stocks,
  indices, commodities: nothing.
- **How fast: slow.** −6 after 5 minutes, +10 after 15, +43 ± 12 after an
  hour, +90 ± 43 after four, +310 after a day, +381 ± 118 after two (the
  second day adds little and nearly doubles the error). So lateness costs
  little: entered 15 minutes late +326, an hour late +293 ± 73, three hours
  late +310 ± 83, six hours late +203 ± 87.
- **How big after costs.** The round trip is 13 bps and a day's funding about
  nothing, so net +297 ± 68; with each side costing 25 bps more than the cost
  table says, still about +247. 71% of single positions ended above zero; the
  worst lost 11%, the worst twentieth averaged −7%; the worst day (2026-09-09)
  lost 1,875 bps over five positions; 19 were open at once. $1,000 is small
  against the book the cost table measured; $10,000 is more than a tenth of
  the next ten minutes' trading nine times in ten, and no book was recorded
  before 2026-11-10, so what larger sizes face is unknown.
- **How visible live: only in the liquidated accounts' own trades.** The
  public tape marks one rare kind of liquidation only (19 of 119,899 captured
  trades); the other side of a liquidation trade carries no mark (0 of 634).
  The tracked accounts make 5.7% of trades and 12.8% of taker volume in small
  coins, so we see perhaps a twentieth to an eighth of all liquidations. But
  because the move is slow, a tool that reads the tracked accounts every hour
  or two would be in time.
- **JUMP is the wave seen through prices, and TAPE points the same way.** A
  very large 15-minute jump during a wave: +324 ± 74; without one: −3 ± 29
  (1,569 jumps). Public trades that go against the last hour's move were
  followed by +87 ± 35 their way; those that go with it by −17 ± 33: the
  tape's lead, too, is a move back.
- **A large market move alone is not enough.** When the small coins as a
  group had moved 4% or more in four hours, they came back +247 ± 69 over the
  next day if a wave was on, and +37 ± 74 — nothing — if not. The wave tells
  what the price alone does not.

**2. Part B: none survived.** Eleven tries of the twelve allowed, each
written down first, with one pass bar set before any ran. None passed.
Nearest: yesterday's losers against yesterday's winners among small coins
(+35 ± 14 bps a position a day, 9 of 10 weeks — 2.6 errors against a bar of
3; a pattern published for crypto), and the basket of coins after a wave (the
same lead again). Funding extremes, very large trades, BTC leading, new 7-day
lows and highs, the tracked accounts' positions, stock opening gaps, hours
and weekends: nothing.

**3. The MARKET-1 lines I recommend** (exact in section 3)
- **WAVE — the one line that decides.** When a tracked account is liquidated
  in a small coin and at least two tracked accounts have been liquidated that
  way within the hour: the other side, $1,000, at the recorded book 2 minutes
  later, held 24 hours. At most one entry an hour a coin.
- **Beside it, deciding nothing:** every liquidation (and those outside a
  wave); the wave entered 1 and 3 hours late (what a slow tool would get);
  JUMP and TAPE, each split by "in a wave or not" and "against the hour's
  move or with it"; the daily losers-against-winners portfolio; BTC and ETH
  at the wave's moments.
- **Why one line:** the three agreed lines turned out to be one family —
  prices moving back — and its sharp form is the wave. A jump without a wave
  and a liquidation alone showed nothing; the tape's lead is about a round
  trip's worth after costs and was measured on busy hours only. Giving them
  a vote would spend the error budget on noise.

**4. What the test could see, and when** — if waves come as often as before
(2.25 entries a day, on two days of three). The smallest true net result it
would confirm four times in five: **2026-12-19: about 300 bps; 2027-02-06:
about 195; 2027-05-08: about 135** (about 330, 215 and 150 with the wider
error the random-day check gives). The exploring size is +297: December
confirms it only if it holds in full; May would confirm a little under half
of it. If the move has gone, the line says so by February or May.

**5. What could still fool us**
1. **One autumn:** 68 days, 47 wave days, perhaps twenty separate waves.
2. **The wave was found on these same weeks** (after "a liquidation alone
   shows nothing" was seen). Its neighbours agree — 30 to 240 minutes, two or
   three accounts: +253 to +477 — so I trust the shape more than the size;
   expect the true size to be smaller.
3. **The errors are too narrow.** Moving the same entries to random days gives
   a spread of 75, not 68 (1 random draw of 5,000 reached the real figure).
4. **The mark is not the book.** A small check on real trades (19 cases)
   found no sign that the mark flatters the entry; MARKET-1's recorded book
   settles it.
5. **The tracked accounts were chosen at the cut.** Those chosen by volume
   alone show the move too (+128 ± 37 over all their liquidations); in
   MARKET-1 the list is fixed beforehand.
6. **The losing tail.** The position loses most when a fall or a squeeze goes
   on (2026-09-09, 09-25, 09-28).
7. **Fewer eyes, fewer waves.** If tracked accounts stop trading, fewer waves
   are seen; the experiment's reader, with its page cap, would have seen 138
   of the 153 entries.

---

## 1. Part A — the small-coin lead, made exact

Everything here is exploring. Period: 2026-08-31 to the cut (68 days). Markets:
the kit's panel without the pre-IPO market, R8's five and the retired one
(84); small coins are the 38 crypto markets but BTC and ETH. The price at an
instant is the last mark of the minute that holds it (the kit's reading).
"Fade" is the position against the forced side; moves are gross bps on the
mark unless "net". **The matched baseline** is the mean move of every minute
of the period in the same coin and 4-hour UTC block — the exact mean of
"random minutes in the same coin and hour band". Errors: clustered by UTC day
and by market together (two-way) unless said; "by week" is beside them.
STRATEGY-REVIEW's prints were reproduced to the digit before anything new was
measured (X5 +147.6 ± 36.4 on 431; X4's J > 5 70.9 ± 23.6; X9's tape +35.7 ±
9.0), and the liquidation figures and the recommended line's figure were each
computed a second time by scripts that share no code with the first (A9c,
A12c: the same figures).

### 1.1 The event (brief A.1)

**What counts as one event.** A liquidation fill here is a seed fill flagged
`liquidation`, taker, reducing the account's position. Counted six ways, from
the launch week (A1):

| Unit | Small coins | BTC, ETH | Stocks | Indices | Commodities |
|---|---|---|---|---|---|
| fills | 727 | 1,222 | 618 | 130 | 352 |
| order events (account, order id, previous size) | 461 | 574 | 447 | 100 | 193 |
| account-market-minutes | 449 | 520 | 427 | 98 | 187 |
| market-minutes (X5's unit) | 434 | 419 | 399 | 92 | 176 |
| episodes, gaps up to 5 minutes | 411 | 321 | 377 | 85 | 160 |
| **episodes, gaps up to 60 minutes** | **386** | 225 | 319 | 72 | 133 |
| episodes, gaps up to 24 hours | 265 | 37 | 209 | 34 | 62 |
| accounts liquidated | 153 | 168 | 116 | 42 | 77 |

In small coins a liquidation is nearly always one account's one order: of
the 386 60-minute episodes 231 are a single fill, 342 a single account, 11
hold three or more accounts; the median episode lasts under a minute (the
longest 66 minutes). **The unit I use: the 60-minute episode** — the first
liquidation fill in a market with none there in the 60 minutes before. Every
unit gives the same picture at 24 h (market-minutes +144.5 ± 32.3 raw; minus
the baseline, 5-minute episodes +145.5 ± 35.2 and the first episode in 24
hours +135.4 ± 56.1).

**Its size.** Small: an episode's notional has a median of $477 (a quarter
below $59, a quarter above $1,524, a tenth above $7,480, the largest
$299,233). Against the market: the first minute's forced notional is a median
0.49 times the mean traded notional per minute of the seven days before (0.89
times the median traded minute) and a median 30% of its own minute's volume.
The coin's usual minute then trades about $767, and only 27% of its minutes
have a trade at all. **Size does not matter for what follows** (thirds by notional:
+193.8 ± 69.1, +81.9 ± 55.4, +142.9 ± 43.5; by notional over the usual
minute: +206.1, +117.7, +94.0; A3): the liquidation marks the moment, it does
not make the move.

**Its direction.** 235 episodes are forced sells (a long liquidated), 151
forced buys.

**Which accounts, and what share of all liquidations.** 153 tracked accounts
were liquidated in small coins; the ten busiest take part in 155 of the 386
episodes, 80 accounts in one episode only; 22 accounts were liquidated in
both halves of the period. Nine of the 153 have a truncated seed (74
episodes). **How much of the market the tracked accounts are:** 5.7% of all
small-coin trades and 12.8% of their notional as takers (134,143 of 2,372,070
trades; $240.0M of $1,875.1M; the 120 truncated seeds make this a floor).
Their liquidation fills are 0.65% of their own taker notional. The share of
*liquidations* cannot be measured; if liquidations are spread like taking, we
see between a twentieth and an eighth of them, by count probably nearer the
low end (small accounts on no board are liquidated too). A wave seen in two
tracked accounts therefore stands for many more accounts.

**Can a live tool see it in time?** Only by reading the liquidated account's
own fills.
- **The public tape marks only backstop liquidations.** 19 of 119,899 captured
  tape trades carry `liquidation_details` = {mark, method: "backstop"} — all
  ETH, 2026-10-07 02:01–10:07Z, forced sells 161–550 bps through the row's
  own mark. Of the seed's liquidation fills, 307 are on the captured tape and
  305 of them carry no mark of any kind (S2, S4).
- **The other side of the trade is not flagged.** 634 liquidation trades have
  their maker counterparty in the seed; none of those maker fills is flagged.
  The 14 flagged maker fills are liquidated accounts' own orders (S3, S4).
  So reading the market makers reveals nothing either.
- **The delay a real follower would have** is the tool's reading interval
  plus the API's 1–1.5 s (external-apis). Reading all 1,602 accounts once an
  hour costs about 270 tokens a minute at the published weight of 10 a fills
  read [arithmetic]; and 1.2 shows that an hour or three of delay costs
  nothing measurable.

### 1.2 The profile (brief A.2)

All 386 episodes, and the wave entries of 1.3 (A2, A12):

| Held | All: raw | minus the matched baseline | minus the other small coins | Wave entries (153): raw | of which the coin's own part |
|---|---|---|---|---|---|
| 5 min | +1.3 ± 4.7 | +1.5 ± 4.7 | −0.4 ± 3.0 | −6.0 ± 11.2 | −5.6 ± 5.3 |
| 15 min | +12.6 ± 5.4 | +13.0 ± 5.3 | +4.1 ± 4.0 | +10.4 ± 14.6 | +2.9 ± 7.6 |
| 1 h | +23.4 ± 8.4 | +25.0 ± 8.5 | +5.3 ± 6.1 | +42.6 ± 12.2 | +7.3 ± 5.1 |
| 4 h | +32.5 ± 20.8 | +35.7 ± 20.7 | +5.9 ± 8.2 | +90.3 ± 43.0 | +24.5 ± 12.3 |
| 24 h | **+131.9 ± 35.1** | +139.7 ± 36.9 | +29.5 ± 26.9 | **+309.7 ± 67.7** | +74.9 ± 48.7 |
| 48 h | +205.4 ± 68.0 | +223.3 ± 70.7 | +61.6 ± 41.1 | +381.4 ± 117.7 | +104.9 ± 73.7 |

(Entry 2 minutes after the event. "Minus the other small coins" takes off the
mean move of the other 37 coins over the same instants; "the coin's own part"
is the same for the wave entries.)

- **The coin's own drift is small** (the baseline of the fade side is −7.7
  bps at 24 h), so the matched baseline changes little.
- **Most of the move is the market's.** The other coins, signed the same way,
  moved +102.5 ± 29.8 at 24 h; the liquidated coin adds +29.5 ± 26.9.
- **Entries later** (each held 24 h from the entry): all episodes 15 minutes
  after +133.7 ± 42.6, an hour +123.0 ± 38.8, 3 hours +141.1 ± 51.2, 6 hours
  +107.8 ± 53.8, 12 hours +99.2 ± 54.3, a day +70.2 ± 44.6. Wave entries: 15
  minutes +326.1 ± 78.2, an hour +292.9 ± 72.7, 3 hours +309.6 ± 83.1, 6
  hours +202.7 ± 87.0. From an entry an hour late the first hours show
  nothing (1 h −15.6 ± 12.6 on all episodes): the early part is over within
  the hour, the rest comes over a day.
- **What a liquidation follows:** the price had moved the forced way by +226
  bps in the hour before (94% of episodes), +349 in four hours, +524 in the
  day; before a wave episode (counted by coins, A9b) +252, +392 and +616. The
  move back after a wave is a little under half of the day's move before it.
- **Against a like move without a liquidation** (the path control: minutes of
  the same coin, no tracked liquidation within an hour, whose 62-minute move
  matches in sign and size): the controls came back +34.4 ± 16.2 at 24 h, the
  events +133.0; **the event minus its controls +98.6 ± 41.2** (1 h +11.0 ±
  7.8; 4 h +18.1 ± 22.9; 48 h +151.0 ± 66.7).
- **One regression over every coin and quarter-hour** (226,506 rows, errors by
  day; A6). LIQ alone: +132.6 ± 38.2. With the price path beside it: +88.2 ±
  43.3. The path's own terms: the coin's move over the day before is followed
  by 0.075 ± 0.021 of itself coming back (t 3.6); the basket's own earlier
  moves predict nothing (0.004 ± 0.115, 0.027 ± 0.109). Against the basket
  (the coin's move minus the basket's): LIQ +3.3 ± 24.5. **So a liquidation
  adds nothing to how the liquidated coin does against the other coins; what
  it marks is the market's move back.**

### 1.3 What the liquidation marks: a wave

The lead does not live in every liquidation. Counted at the event's own
instant, so a rule can use it (A7, A11, A12; the first three rows are minus
the matched baseline, the rest raw — the two differ by a few bps):

| In the 60 minutes up to the event (this fill included) | Episodes | 24 h |
|---|---|---|
| liquidations the same way in this coin only | 219 | +38.4 ± 39.7 |
| … in 2 small coins | 74 | +167.4 ± 55.1 |
| … in 3 or more | 90 | +363.2 ± 79.3 |
| **one account, in several coins** | 35 | **+3.6 ± 104.5** |
| one account in all | 254 | +22.0 ± 34.9 |
| two accounts | 53 | +224.7 ± 63.2 |
| three or more accounts | 76 | +434.5 ± 97.1 |
| **two or more accounts** | **129** | **+348.3 ± 79.0** |

- **A wave is several accounts, not several coins:** one account liquidated
  across coins (cross margin) showed nothing, though 35 cases cannot rule a
  move out.
- **The unit a tool can state (U2 in the scripts): a wave entry** = a
  liquidation fill in a small coin at whose instant at least two different
  tracked accounts have been liquidated that way in small coins within 60
  minutes, when that coin has had no entry in the 60 minutes before. It adds
  to the 129 episodes the 24 cases where the wave formed after the coin's own
  episode had begun: **153 entries on 47 days, +309.7 ± 67.7 (t 4.6; by week
  ± 46.7), net +297.1 ± 67.8.** The episodes left outside a wave (257): +22.0
  ± 34.9, net +9.7 ± 35.0.
- **Not a knife edge.** Windows of 30, 60, 120 and 240 minutes with two or
  more accounts: +367.8, +348.3, +287.9, +252.9; with three or more: +476.5,
  +434.5, +429.7, +341.6; one account: +35.7, +22.0, +12.6, −3.1.
- **Each half of the tracked accounts alone** (by the address's last hex
  digit) shows it: +298.6 ± 146.7 (34 episodes) and +378.7 ± 96.3 (67).
- **The same entries moved to random days** (every day's entries together,
  same coins, clock times and sides; 5,000 times): mean −0.1, spread 74.7 —
  wider than the clustered error of 67.7; **1 of 5,000 reached the real
  +309.7.** A bootstrap of the 47 days gives +187 to +418 (95%). For all 386
  episodes: 11 of 5,000 reached +131.9 (spread 46.8 against 35.1).
- **The basket instead of the coin** (A6, B4, A13): every small coin alike,
  against the forced side, at the first wave entry in six hours (57): +103.8
  ± 37.3; when liquidations the same way had reached three coins (22 waves on
  20 days): +252.7 ± 66.0. The liquidated coins carry more than the others,
  so the coin itself is the better position.
- **A wave is more than the market's own large move** (A14: every
  quarter-hour of the period; the basket against its own last 4 hours over
  the next 24 h, errors by day). All quarter-hours +5.5 ± 16.4: the market
  does not come back in general. In a wave state (242 quarter-hours on 45
  days) +168.5 ± 46.1; outside one −0.9 ± 16.4. By the size of the 4-hour
  move, without a wave and with one: under 100 bps −2.9 ± 12.0 and +134.8 ±
  56.0 (30); 100–200 bps −11.1 ± 27.1 and +47.9 ± 79.0 (56); 200–400 bps
  +25.7 ± 38.4 (726) and +201.2 ± 79.9 (98); **400 bps and more +36.6 ± 74.2
  (143 on 20 days) and +247.2 ± 69.1 (58 on 12 days).** By the accounts
  liquidated that way within the hour: none −2.4 ± 16.4, one +13.3 ± 32.3,
  two +68.4 ± 44.6 (148), three or more +326.1 ± 62.9 (94 on 23 days). So no
  rule on the price alone that I tried stands in for the liquidations: not
  the coin's jump (1.6), not the basket's jump (B11), not a new low or high
  (B6), not the market's four-hour move.
- **Why it might be real.** A wave means many leveraged accounts on one side
  were closed at once; when the forced orders are done, nobody is left to
  push. The move back is in the coins' prices everywhere (the mark follows
  outside prices), not a quirk of this exchange's book. I found no public
  study that measures it in small coins (two searches, summaries only).

### 1.4 Where it lives (brief A.3)

All 386 episodes are 24 h minus the matched baseline (A3); wave entries are
24 h raw (A12); the finer splits of the wave were run on the count by coins
(164 episodes, A9c; errors by day only) and are marked †.

| Split | All episodes | Wave |
|---|---|---|
| all | +139.7 ± 36.9 | +309.7 ± 67.7 |
| forced sells / forced buys | +123.6 ± 49.6 / +165.2 ± 69.8 | +274.2 ± 84.1 / +413.4 ± 98.0 |
| first half / second half (split 2026-10-04) | +106.6 ± 44.7 / +171.9 ± 56.1 | +251.0 ± 83.1 / +344.5 ± 85.2 |
| September (every small coin rose; mean +43.7%) | +105.9 ± 45.1 | +255.0 ± 84.6 (56) |
| October (35 of 38 fell; mean −19.7%) | +162.0 ± 52.4 | +320.7 ± 77.0 (70) |
| November to the cut (mean −5.7%) | +197.8 ± 170.4 | +394.6 ± 253.0 (27) |
| weeks above zero | 8 of 10 (09-07 −38.3, 09-28 −5.3) | 9 of 10 (09-07 −43.0) |
| without 2026-11-04 and 11-05 | +123.4 ± 36.6 | +282.2 ± 63.5 |
| without the two days that add most (11-04, 09-23) | +113.0 ± 35.7 | +251.9 ± 63.7 |
| each market left out | +129.7 to +158.0 | +293.5 to +342.8 |
| each week / each day left out | +120.7 to +157.0 / +121.5 to +151.9 | each day +269.9 to +332.3 |
| days / coins above zero | 42 of 66 / 28 of 36 | 37 of 47 / 28 of 30 |
| least / middle / most traded third of coins | +139.0 ± 88.3 / +172.1 ± 61.0 / +127.4 ± 40.4 | † +360.1 ± 99.0 / +285.8 ± 69.8 / +239.3 ± 73.1 |
| listed before 08-31 (22) / on 09-10 (16) | +119.8 ± 37.8 / +233.4 ± 69.2 | † +239.7 ± 63.8 / +383.3 ± 105.3 |
| weekdays / weekends | +146.6 ± 45.9 / +105.6 ± 30.8 | † +276.7 ± 59.9 / +254.9 ± 111.3 (15) |
| the basket fell over the 7 days before: sells / buys | +173.6 ± 83.7 / +158.8 ± 100.0 | † +346.0 ± 83.2 / +339.6 ± 169.3 |
| the basket rose: sells / buys | +52.4 ± 66.8 / +173.8 ± 111.3 | † +110.1 ± 127.2 / +242.7 ± 172.0 |
| the hour before, smallest / middle / largest third of the move the forced way | +27.0 ± 37.5 / +151.9 ± 63.7 / +240.9 ± 67.6 | — |
| the basket's 24 h before: went the forced way / the other way | +195.0 ± 50.4 (298) / −54.5 ± 45.0 (85) | — |

- **Time of day** (six cells; not for a rule): all episodes 00–04 UTC +144.6
  ± 81.7, 04–08 +81.9 ± 120.1, 08–12 −162.4 ± 88.8, 12–16 +190.4 ± 63.3,
  16–20 +334.8 ± 40.6, 20–24 +91.9 ± 86.5; the wave † +375.7, too few, +34.4
  ± 152.5 (12), +296.2, +470.1, +138.0. The European morning is the one weak
  block in both.
- **The period is not one falling stretch.** September rose (all 22 small
  coins then listed; BTC +7.7%, ETH +11.3%), October fell (BTC −7.2%, ETH
  −16.0%). R8's six weeks, on which STRATEGY-REVIEW's tape prints rest, are
  the falling part; the liquidation lead holds in both parts and on both
  sides.
- **Selection** (A7): episodes of accounts on the all-time notional board
  (chosen by volume; 330 of 383): +128.3 ± 36.8 (halves +91.2 ± 47.4 and
  +165.4 ± 59.2); of accounts from the other boards (chosen by profit over
  windows ending at the cut; 53): +210.6 ± 107.2.
- **The other kinds of market** (A7, A10), 24 h minus baseline: BTC and ETH
  +5.3 ± 24.4 (222 episodes; with two or more crypto markets liquidated the
  same way +0.3 ± 18.7); stocks +29.7 ± 46.5; indices −92.5 ± 77.4;
  commodities −32.6 ± 15.9 (the price went on, weakly). At the small-coin
  wave's entries: BTC +61.6 ± 37.4 (halves +5.6 and +94.8), ETH +111.3 ± 48.7
  (+66.6 and +137.9).

### 1.5 What a real order could capture (brief A.4)

No book exists before 2026-11-10; what exists says (A4, A9b, A12):

- **Costs at $1,000.** The kit's table (4 bps a leg plus half-spread and depth
  for $1,000: a median 2.6 bps in small coins) gives a round trip of 13.0 bps
  on these entries (p90 15.5). Funding over the 24 hours: −0.6 bps (received,
  on average). **Net at 24 h: all episodes +119.5 ± 35.3; wave entries +297.1
  ± 67.8.** Held 4 h the wave nets +77.8 ± 43.0; 48 h +368.1 ± 117.7.
- **How wrong the costs may be.** All episodes with each leg 10 / 25 / 50 bps
  worse than the table: +99.5 / +69.5 / +19.5. The wave counted by coins with
  each leg 25 bps worse +212.5 ± 59.1, 50 bps worse +162.5; with the entry at
  the worse of the marks 2 and 5 minutes after +233.5 ± 59.1 (all episodes
  +95.6 ± 34.6).
- **Is there trading to enter and leave in?** Thin. The entry's own minute had
  no trade in 131 of 386 cases; the ten minutes from the entry traded a
  median $10,328 (a quarter under $1,591; none in 23 cases); at the exit a
  day later a median $1,113 in ten minutes (none in 79 of 380). $1,000 is
  more than a tenth of the next ten minutes' volume in 192 entries and 308
  exits; **$10,000 in 355 of 386 entries and 376 of 380 exits.** Volume is
  not depth — the quotes stand whether or not anyone trades — but beyond
  $1,000 nothing was measured, and thin names' books have shown holes
  (external-apis, 2026-11-09). Larger sizes are a question for the recorded
  book.
- **Does the mark flatter the entry?** A small check on R8's captured tape (19
  episodes with trades in the ten minutes after; 509 trades): away from
  liquidations takers paid −0.9 ± 0.3 bps against the two minute marks around
  them (the mark is not the book's middle to within a few bps); the
  liquidation fills themselves paid +33.2 ± 13.5; takers entering the fade
  side in those ten minutes paid −12.5 ± 8.5 (better than the mark: the book
  is pushed further than the mark shows), from the second minute on +1.4 ±
  4.8; takers going with the forced side paid +21.2 ± 9.4. No sign that the
  mark flatters a fade entry; too few cases to say more.
- **The tail.** Wave entries, net: 71% above zero, median +248, the worst 5%
  average −699, the worst −1,102, sd 540; 10 losing days of 47; the worst
  days 2026-09-09 (−1,875 bps over five positions), 10-14 (−859, one), 09-16
  (−855, two); the largest fall from a peak 2,370 bps; 19 positions open at
  once. All episodes, net of 13.6: 23 losing days of 66; worst days 09-28
  (−3,025 over nine) and 09-25 (−2,887); largest fall 6,117; 32 open at once.

### 1.6 JUMP and TAPE (brief A.5)

**JUMP** (quarter-hours with J > 5; 2,039 windows on 68 days; A5, A8, A13):

| Held | Raw | minus the other small coins |
|---|---|---|
| 5 min / 15 min / 1 h | +3.6 ± 5.4 / +3.9 ± 7.3 / +5.0 ± 10.3 | +1.3 ± 1.9 / +2.2 ± 2.5 / +3.5 ± 3.9 |
| 4 h | +13.1 ± 12.7 | +12.2 ± 5.5 |
| 24 h | **+70.9 ± 23.5** (by week ± 29.5); net +58.3 ± 23.4 | +31.9 ± 10.4 |
| 48 h | +120.4 ± 39.5 | +41.1 ± 18.8 |

- **It is the wave seen through prices.** By the tracked accounts liquidated
  the jump's way in the 60 minutes up to the window's end: **none (1,221
  windows) −9.7 ± 35.0; one (348) +20.8 ± 52.3; two or more (458 windows on
  35 days) +324.0 ± 73.5.** Without a wave, in each half: +11.9 and −26.2.
- **"Five" is at the edge of nothing:** J from 5 to 6 +13.1 ± 32.3 (904), 6
  to 8 +71.2 ± 35.5, 8 to 12 +195.1 ± 60.7, above 12 +211.3 ± 64.1; and above
  8 without a wave +82.7 ± 51.0 (253), with one +341.1 ± 97.0 (194). 3 < J ≤
  5: −3.3 ± 12.3.
- **It is lopsided:** down-jumps (buying) +152.3 ± 53.2, up-jumps (selling)
  +2.4 ± 62.1; in September +176.2 and −65.6, in October +185.0 and +4.7, in
  November −37.0 and +352.5. The liquidation line is not lopsided (1.4).
- **Its own small part:** against the other coins a jumped coin came back
  +31.9 ± 10.4 at 24 h (halves +25.5 ± 16.0 and +39.5 ± 9.3) — the same
  daily losers-against-winners move part B's first try measures.
- Overlap: 165 of the 2,039 windows have a tracked liquidation in that market
  around them; 129 of the 386 episodes have a J > 5 window; liquidations with
  J ≤ 3 around them still came back +81.7 ± 42.7. Day by day the two lines'
  results correlate 0.26.

**TAPE** (R8's captured small-coin trades: 30,188 in 36 markets on 41 days —
only hours in which one of R8's followed traders entered; A5):

- In the taker's direction: 1 h +9.3 ± 3.6, 4 h +18.7 ± 5.1, **24 h +35.7 ±
  9.5**, 48 h +17.4 ± 10.0. Minus the matched baseline +35.6 ± 9.0 (not the
  coins' drift); minus the other small coins +27.3 ± 11.0.
- Each market-day alike: +13.7 ± 4.1 (with 20 or more captured trades +16.8 ±
  3.6; with fewer +0.1 ± 12.5). Within an hour of a tracked liquidation +25.8
  ± 15.8; the rest +36.7 ± 10.3.
- **Trades with the last hour's move −17.3 ± 32.5; trades against it +86.5 ±
  34.6.** The tape's lead sits in the takers who trade against the move — a
  move back again, though not shown to be the wave (the split by tracked
  liquidations above says nothing either way). Very large orders carry
  nothing (part B's third try).
- Net of a 13 bps round trip the whole line is about +23, on a sample of busy
  hours.

## 2. Part B — eleven tries, none survived

The list of ten was written at 01:56Z before any outcome was computed; the
eleventh (B11) was written at 02:02Z after A2 showed the move is the
market's; the twelfth stayed unused. **The pass bar, set with the list:** on
its primary cell a try must be (1) at least 3 errors from zero (two-way; for a
basket or portfolio series the day error) and at least 2.5 by week; (2) of
the same sign in both halves and in at least 60% of the weeks; (3) still 2
errors from zero without the two days that add most and with each market
left out; (4) larger than a round trip (13.6 bps) by at least one error.
Small coins, 24 h, entry 2 minutes after, minus the matched baseline unless
said (B-set1, B-set2). The last column names the conditions a try fails;
where the first fails by far, the third was not computed.

| # | Try and its primary cell | Result | Fails |
|---|---|---|---|
| B1 XREV | each UTC midnight, small coins ranked by the last 24 h; (losers − winners) / 2 over the next 24 h | **+35.0 ± 13.7** a position a day (t 2.6 by day, 2.7 by week; halves +46.0 and +24.1; 9 of 10 weeks; without two days +25.5 ± 12.3; each coin left out t 2.1–2.8; 43 of 66 days above zero) | 1 |
| B2 FUND | a settled funding rate beyond the market's last 168 hours, faded, with the funding received | +86.4 ± 47.1 (by week t 2.4; halves +160.1 and +37.8; without two days +55.8 ± 43.9; funding itself +4.6) | 1, 3 |
| B3 BIGTRADE | the top 1% of a market's captured taker orders ($11k–$261k), the taker's side | −6.7 ± 22.3 (194 orders) | 1, 4 |
| B4 CASCADE | quarter-hours with 3+ small coins forced one way; the basket of the coins not liquidated, faded | +267.7 ± 98.6 (17 waves on 15 days; t 2.7; halves −88.5 (5) and +416.2 (12); without two days +156.8 ± 78.3; 14 of 17 above zero) | 1, 2 |
| B5 BTCLEAD | after a BTC quarter-hour with J > 3, the small-coin basket in BTC's direction, 1 h | −0.6 ± 6.2 (319 windows) | 1, 4 |
| B6 BREAK | a new 7-day low or high, faded | +41.8 ± 48.8 (525; halves −65.4 and +130.7) | 1, 2, 4 |
| B7 POS | each midnight, coins by the share of tracked holders who are long; (most long − least long) / 2 | +5.3 ± 14.6 (62 days; halves +21.0 and −8.4) | 1, 2, 4 |
| B8 USOPEN | stock perps, an opening gap of 100 bps or more, faded to the close | −39.0 ± 29.3 (1,007 on 48 days: gaps went on, within chance) | 1, 4 |
| B9 HOURS | the small-coin basket by 4-hour block; the largest of six | t 1.50 (04–08 UTC +23.1 ± 15.3); 2.64 needed | its own bar |
| B10 WEEKEND | the move from Friday 21:00Z to Sunday 21:00Z, faded for a day | +124.9 ± 78.7 (9 weekends, 6 above zero) | 1 |
| B11 MKTJUMP | the small-coin basket's own quarter-hour jump (J > 5), faded | +100.3 ± 53.3 (33; halves +199.1 and +7.3; without two days +55.0 ± 47.9) | 1, 3 |

Beside the primary cells, as listed before the runs:
- **B1:** formed and held over 6 hours −1.6 ± 3.4; formed over 72 hours +32.6
  ± 14.7. Formed at 06, 12 and 18 UTC instead of midnight (A8, a check of the
  clock): +41.7 ± 14.7, +36.5 ± 14.1, +33.1 ± 12.4. Net of the table's costs
  +21.9 ± 13.7. A day's result has an sd of 110 bps. A daily reversal across
  coins is a published pattern (Zaremba and others 2021; search summary
  only). It is the market-neutral part of the move back (1.2's regression:
  0.075 ± 0.021), it correlates 0.16 with the liquidation line day by day,
  and it is too small for MARKET-1 to confirm by May (section 4).
- **B4 and B11 are the wave again.** The basket jumps with a liquidation wave
  within the hour (10): +336.9 ± 106.2; without one (23): −2.6 ± 81.2. B4's
  five September waves lost on the coins not liquidated (−88.5) while the
  basket of every coin at a wave gained in September too (+109.5 over seven
  waves, A7): the liquidated coins carry the move.
- **B7:** STRATEGY-REVIEW's X6 print (shorts mark the coins that fell) does
  not hold as a daily rule (72 h +15.8 ± 22.0).
- **B3:** the other 99% of orders +62.8 ± 18.6 (the tape line itself); B6 at
  1 h +21.4 ± 11.0; B10's cross-section (weekend losers − winners over
  Monday) +74.6 ± 28.5 on 9 weekends; B11 at 48 h +224.2 ± 75.1.

**Families not explorable on the old weeks (listed, not tried):** the
competition's boosted markets (it starts 2026-11-02T14:30Z, 4.4 days before
the cut, and which markets are boosted is not in my data); a newly listed
market's first weeks as a line (two listing dates; the coin's age is a split
in 1.4); **every book pattern, for later:** the weekend gap of stock perps
against a pinned mark, the spread after a liquidation, book imbalance, a
maker's fills, how a large trade's impact fades at the book.

**Part B's output: none survived.** No candidate line is put forward. XREV is
the nearest miss; I recommend it be printed beside MARKET-1's line, deciding
nothing (section 3).

## 3. The recommended rules, exact (brief A.6)

**W. WAVE — the one line that decides.**
1. **Accounts:** the experiment's pool (rules.md R2: 1,602), their fills as
   the experiment reads them (R3, R3a).
2. **A liquidation fill:** `liquidation` true, `taker` true, and reducing —
   `previous_size` non-zero and opposite in sign to the fill's side. Its side
   is the forced side.
3. **Small coins:** the crypto perps but BTC-USD and ETH-USD, less the markets
   the experiment's cells leave out (38 on the old weeks; a coin counted from
   its listing).
4. **The wave state** at an instant t, for a side: at least two different
   pool accounts have a liquidation fill of that side in small coins in
   [t − 60 min, t].
5. **An entry:** a liquidation fill in a small coin at whose instant the wave
   state holds for its side, when that market has had no entry in the 60
   minutes before.
6. **The position:** against the forced side, $1,000, opened 2 minutes after
   the fill's instant at the recorded book as a taker, held 24 hours, closed
   at the recorded book as a taker; base-tier fees; funding as settled. No
   stop; positions may overlap, in one market too.
7. **The statistic:** the mean net result per position in bps, errors
   clustered by UTC day and by market; beside it the same entries moved to
   random days.
8. **The deciding cell:** all entries in small coins; the whole 5% over the
   three looks.
9. **Printed beside it, no verdict:** every 60-minute episode, and those
   outside a wave; the entries opened 1 h and 3 h late; the count by coins
   and by three accounts; forced sells and buys; BTC, ETH and the basket of
   every small coin at the entries; the basket after its own 4-hour move of
   400 bps or more, with a wave and without (old weeks +247.2 ± 69.1 and
   +36.6 ± 74.2); the large markets' own liquidations; from the first day the
   worst day, the largest fall from a peak and the most positions open at
   once.

Old weeks, exploring: 153 entries on 47 days; +309.7 ± 67.7, net +297.1 ±
67.8; under the reader's cap of 1,000 fills an account-week 138 entries,
+283.8 ± 70.0 (A13).

**J. JUMP — beside, no verdict.** As agreed (a quarter-hour move above 5
times the market's usual, `rules.md` R13's J; the other side 2 minutes after
the window, 24 h, at the recorded book), with two cells named now: windows in
a wave state for the jump's side at the window's end (old weeks +324.0 ± 73.5,
458), and the others (−3.0 ± 29.2, 1,569). If the second is nothing again,
an alert needs the liquidation, not the jump.

**T. TAPE — beside, no verdict.** As STRATEGY-REVIEW proposed (a fixed sample
of public taker trades by a rule on the trade id; the trade's direction 80 s
later; 24 h), with two cells named now: trades against the move of the 60
minutes before them (old weeks, R8's hours only: +86.5 ± 34.6) and with it
(−17.3 ± 32.5); and each market-day counted once.

**X. XREV — beside, no verdict.** Each UTC midnight, small coins with a price
24 hours before, ranked by their move over those 24 hours; $1,000 bought in
each coin of the lowest third and sold in each of the highest, at the
recorded book at 00:02, closed at 00:02 the next day (old weeks +35.0 ± 13.7
a position, net +21.9).

**Which lines to keep, and why.** One deciding line. JUMP without a wave
(−3.0 ± 29.2) and a liquidation outside one (+22.0 ± 34.9) showed nothing;
TAPE's lead sits in trades against the move, nets about +23 and was measured
on busy hours only. The three are one family — prices moving back — and its
sharp form is the wave. A second deciding line would cost the wave about 7%
of what it can see (section 4) and could at best confirm the same thing
through more noise.

## 4. What the test could see (brief A.6)

Arithmetic, a guide only: the old weeks' net errors scaled by the square root
of the days (recordings from 2026-11-10T20:59:54Z; positions closed by each
look: 37, 86 and 177 days), the same rate of events, a budget of 5% split
evenly over the deciding lines and three looks, 80% power, normal
approximations.

| Line | Old weeks, net | 2026-12-19 | 2027-02-06 | 2027-05-08 |
|---|---|---|---|---|
| **WAVE, deciding alone** | +297.1 ± 67.8 | 297 | 195 | 136 |
| … with the random-day spread (74.7) | | 327 | 215 | 150 |
| … if a second line also decided | | 319 | 210 | 146 |
| every liquidation (were it the deciding cell) | +119.5 ± 35.3 | 155 | 102 | 71 |
| JUMP (beside; as if deciding alone) | +58.3 ± 23.4 | 103 | 67 | 47 |
| XREV (beside) | +21.9 ± 13.7 | 59 | 39 | 27 |
| TAPE (beside; R8's sample size) | about +23 ± 9.5 | 32 | 21 | 15 |

Entries expected at the old rate: 83 on about 26 days, 194 on 59, 398 on 122.
Read: the wave at its exploring size would probably be confirmed at the first
look; at two thirds of it in February; at a little under half of it in May.
"Every liquidation" could not be confirmed in December even at its full
exploring size and needs most of it in February. XREV at its exploring size
cannot be confirmed by May. A calmer market means fewer waves and wider
errors than this table.

## 5. What could still fool us

1. **One period.** 68 days, 47 days with a wave entry, about twenty separate
   waves (22 by A6's count), one busy autumn with a rise and a fall.
2. **The cell was chosen here.** STRATEGY-REVIEW found the liquidation print
   among hundreds of cells; I found the wave inside it by splitting (coins,
   then accounts). The neighbours, both halves, both sides, both halves of
   the pool and the random-day check all agree, which is why the shape seems
   sturdier than the size. The true size is probably smaller than +310.
3. **The errors understate.** Day clusters treat neighbouring days as
   separate; 24-hour windows overlap and coins move together. The random-day
   spread is 1.1 times the clustered error for the wave and 1.3 times for all
   episodes.
4. **The mark is not a price in a thin book,** least of all at the exit, a
   random minute a day later with a median $1,113 traded in ten minutes.
5. **The pool was read at the cut,** so who is in it was decided with the
   measured weeks in view; the volume-chosen accounts carry the print (1.4),
   and MARKET-1's list is fixed beforehand.
6. **What we see depends on how many accounts we read.** Half the pool sees
   about half as many waves (34 and 67 episodes against 129) with the same
   result; a pool that thins out sees fewer.
7. **The losing tail** (1.5): a fade is hurt most when the wave goes on.
8. **The mark's short profile is not tradable knowledge:** the first 15
   minutes' +10 to +26 lies inside the mark's own lag.

## 6. Questions for the owner, each with a recommendation

1. **One deciding line (WAVE) in place of three?** *Recommendation: yes.* A
   jump showed nothing outside a wave and the tape's lead is thin after
   costs. Against: the wave was found on the
   weeks it is measured on. "Every liquidation", the lead as first found, is
   the less chosen cell: if the wave shape was chance it is the sharper test
   (71 bps against 136 by May, section 4); if the shape is real it is the
   blunter one (a third of its episodes carry the move, so it would need a
   wave move of about 210 bps against 136 [arithmetic: 71 ÷ 0.34]).
2. **The wave counted by accounts (two or more), not by coins?**
   *Recommendation: yes;* one account closed out across coins showed nothing.
3. **Held one day, not two?** *Recommendation: one day;* the second adds +71
   to the net and nearly doubles the error.
4. **JUMP, TAPE and XREV printed beside, with the cells named in section 3?**
   *Recommendation: yes;* they cost nothing and each answers a question v1
   needs (does an alert need the liquidation or only the jump?).
5. **Would you ever act on small coins — and where?** The wave's move back is
   in the coins' prices on every exchange; at the wave's moments ETH came
   back +111 ± 49 and BTC +62 ± 37 (exploring, about two errors and under
   two). *Recommendation: answer before MARKET-1 is planned;* it decides
   whether BTC and ETH at the wave's entries are a cell worth more than a
   print. No advice follows from it.

## 7. The explorations, counted

All on data before the cut, all exploring, each written in `progress.md`
before it ran. Scripts and outputs: `workers/MARKET-FIND/explore/`.

| # | What (written first) | Printed outside the written plan |
|---|---|---|
| S0–S5 | shapes of the panel, seed and tape; the tape's marks; the two legs of a liquidation trade; the flags' dates; each coin's move by month | — (no outcome) |
| A1 | the event: six units, size, direction, accounts, the pool's share | counts only |
| A2 | the profile at six holds and three entries; three controls; the move before | 5-minute episodes; "first in 24 h"; one position a market within 24 h |
| A3 | where all episodes live | the by-week table; one fill against several; $10,000 and more; the basket's 24 h before; single positions' spread and worst days |
| A4 | volume, the tape's prices, funding, net | the stress lines (each leg x bps worse; the worse of two marks) |
| A5 | JUMP and TAPE profiles, overlaps | JUMP's halves, months, sides, weeks, left-outs; tape halves; market-days with 20 trades |
| A6 | the regression; the basket position | a fit of the path alone |
| A7 | selection; the count known at the event; later entries; other kinds; correlations; the position log | — |
| A8 | JUMP's parts; the "two or more coins" cell; XREV's net and clock time | — |
| A9, A9b, A9c | the coin-count wave: neighbours, entries, holds, log, half pools, random days; its profile; a second script and where it lives | episodes by week and month |
| A10 | the reader's cap (counts); BTC and ETH at waves | — |
| A11 | accounts behind a wave | — |
| A12, A12c | the account-count wave (U1, U2) with every check; U2 again by a second script | — |
| A13 | JUMP by the wave state; BTC, ETH, basket at entries; U2 under the cap | — |
| A14 | the market's own 4-hour move with and without a wave | — |
| B1–B11 | part B's tries (section 2) | B1: months, weeks, the two legs, the daily series' autocorrelation; B2: price and funding apart, highs and lows apart; B3: BTC and ETH; B4: raw, sells and buys apart, the list of waves; B5: 24 h; B6: halves, raw; B8: gaps of 300 bps; B10: each weekend; B11: sides, every window, the overlap with waves |

Hundreds of cells were printed. A few beyond three errors are expected by
chance; the wave's are beyond four with errors that understate by a tenth to
a third.

## 8. Slips, facts for the other docs, and evidence

**Slips, all of them.** Two shell commands failed to parse and wrote nothing
(the plan's first append at 01:56Z; A9c's log entry at 02:25Z); both went
through the Write tool, and the plan stood in `progress.md` before the first
outcome script (A2, 02:01Z). My first wave was counted by coins and three
explorations (A9, A9b, A9c) were spent on it before A11 showed that accounts
are the unit; both counts are reported, the rule uses accounts, and the
finer splits marked † in 1.4 are on the coin count. The second script first
checked the coin count only; A12c, written while proofreading, checks the
recommended line (153 entries on 47 days, +309.7). A6's plan said "two
fits"; four were printed. Prints outside the written plans are in section
7's last column. I listed the first names in `F:\polymarket-follow\paper\`
and the file names of `panel-precut\` (nothing opened but `seed\`).

**Facts the supervisor may want in external-apis** (from stored captures:
R8's tape read 2026-11-09, the seed; counted 2026-11-13):
- A tape row can carry `liquidation_details: {mark, method}`; the only method
  seen is "backstop" (19 rows, ETH, 2026-10-07). An ordinary liquidation's
  tape row carries no mark (305 of 307 checked).
- The `liquidation` flag sits on the liquidated account's own fills only,
  whether they took or made: 0 of 634 maker counterparties in the seed are
  flagged; the 14 flagged maker fills are liquidated accounts' own orders.
  The docs' "flagged on both legs" does not describe the counterparty.
- 114 flagged fills carry a one-digit order id (0 in the backstop trades
  checked).

**Corrections to STRATEGY-REVIEW's reading** (its figures stand): "one
falling stretch" holds for R8's six weeks, not for the 68 days (1.4); "the
public tape carries no flag" holds for ordinary liquidations, not for
backstop ones; JUMP is not a separate effect, and TAPE's lead sits in trades
against the hour's move (1.6); X6's positions print does not hold as a daily
rule (B7).

**Not read:** FIND-1 to FIND-7, FIND-6-EXITS and APPROACH-REVIEW's folders on
F: (APPROACH-REVIEW's C3 from its report); R8's `klines`, `mark1s`, `fills`;
the kit's code beyond `costs.mjs`.

**Inputs (read only, all before the cut):** `KIT\panel\` (91 files; every one
used ends at the cut); `F:\polymarket-follow\paper\seed\` (1,602 files; no row
at or after the cut); `R8-PRETEST\capture\tape\` (80 files, 4,168 pages,
119,899 distinct trades, the newest 2026-11-06T22:34:56Z); the repository's
`apps/poller/research/kit/data/population.json` and `price-table.json`.

**Web (2026-11-13 02:23Z; generic queries, no project or owner detail; search
summaries only, no paper read):** no study of a move back after liquidations
in small coins was found (a 2026 arXiv paper on seven Binance BTC cascades,
https://arxiv.org/pdf/2608.03616, is about warning signs). A daily
cross-sectional reversal in cryptocurrencies is published: Zaremba and
others, "Up or down? Short-term reversal, momentum, and liquidity effects in
cryptocurrency markets", International Review of Financial Analysis 2021; a
CERGE-EI working paper (https://www.cerge-ei.cz/pdf/wp/Wp730.pdf) uses it as
the pay for providing liquidity. Nothing in this report rests on them.

**Saved outputs** (`workers/MARKET-FIND/explore/`; SHA-256, first and last
eight digits): `a1-events.out.txt` 2febaab4…dc22ed60; `a2-profile.out.txt`
4eeb1495…2e1451bf; `a3-where.out.txt` d8568f72…97588a9f;
`a4-capture.out.txt` 6b0d9f40…bd9612b9; `a5-jump-tape.out.txt`
442f33be…8db085bb; `a6-path.out.txt` e39bef15…f1461de1; `a7-checks.out.txt`
d94f02d7…6784dc02; `a8-cells.out.txt` 4fc1e59e…2b48aa97; `a9-wave.out.txt`
abaf0646…86bd4146; `a9b-wave-profile.out.txt` 7d14ca50…3d21da0b;
`a9c-wave-check.out.txt` e8f317d5…44801c14; `a10-reach.out.txt`
e2eae688…3d266d6a; `a11-accounts.out.txt` 409a9e21…ad25f62a;
`a12-wave-accounts.out.txt` 8e764bde…10f1540c; `a12c-wave-check.out.txt`
fec9c51f…206c9853; `a13-beside.out.txt` 05802368…ac097b84;
`a14-basket-path.out.txt` e6af49f3…12f05b70; `b-set1.out.txt`
64841898…f458687b; `b-set2.out.txt` 19990c7d…3d1d7ba7; `s0-shape.out.txt`
43e9a0ab…20f0efb9; `s1-shape.out.txt`
6b843e7e…19df88c3; `s2-tapeliq.out.txt` 46ae6359…29bd8201;
`s3-legs.out.txt` 44cb714f…3b27222e; `s4-flags.out.txt` c1f2436d…ae694299;
`s5-period.out.txt` 3908c4d8…e1dc8f22. The scripts beside them: `lib.mjs`
2460fb91…37f5065e (the shared reader: markets, the price at an instant, the
baseline, the clustered errors, the events), `a12-wave-accounts.mjs`
1fa3b7ce…f685ef87 (the recommended line's figures), `a9c-wave-check.mjs`
06f66ed7…2861065a and `a12c-wave-check.mjs` a97ad6a0…c91816c5 (the second
scripts), and one `.mjs` for every output above.
