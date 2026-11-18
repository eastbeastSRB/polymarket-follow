/**
 * The pass's writers (the polishing plan 4.1 and 4.4; decisions 2026-11-17,
 * the plan approved): each says which records it wants, from what the
 * scanner read of their text, and holds one input file's rows as columns for
 * the part file. `taker` keeps the 40 coins' taker records (the tape of the
 * 38 and the minute bars of all 40); `liq` keeps every coin's records with a
 * `liquidation` object, both legs. PAPER-H's every-trader `fills` will be one
 * more writer here.
 */
import { z } from "zod";
import type { Coins } from "../waveh/coins.js";
import { numText, type Fill } from "../waveh/fills.js";

/** BTC and ETH: minute bars, no tape. */
const LARGE_COINS: readonly string[] = ["BTC", "ETH"];

/** The 38 small coins (WAVE-H's H3) and BTC and ETH. */
export const fortyOf = (coins: Coins): ReadonlySet<string> =>
  new Set([...coins.list.map((c) => c.name), ...LARGE_COINS]);

/** A record a writer takes: its account (lower-case), its fill as WAVE-H's schema reads it, the fill as parsed, its block number (none in `node_fills`). */
export type Kept = {
  user: string;
  fill: Fill;
  raw: unknown;
  block: number | null;
};

/** Names numbered in the order of first use (an input file's addresses, liq's coins). */
export class Names {
  readonly list: string[] = [];
  private readonly ids = new Map<string, number>();

  id(name: string): number {
    let i = this.ids.get(name);
    if (i === undefined) {
      i = this.list.length;
      this.list.push(name);
      this.ids.set(name, i);
    }
    return i;
  }
}

export interface Writer {
  /** Whether a record is this writer's, from its coin, `crossed` (read for the 40 coins only) and whether it has a `liquidation` object. */
  wants(coin: string, crossed: boolean, liquidation: boolean): boolean;
  /** Takes the record; false when it cannot be stored (the scan counts it). */
  add(kept: Kept, users: Names): boolean;
}

/** A whole number written as digits, as a u64's low and high 32-bit halves; null above 2^64 − 1. */
export function u64Of(digits: string): readonly [number, number] | null {
  if (digits.length <= 15) {
    const n = Number(digits);
    return [n % 2 ** 32, Math.floor(n / 2 ** 32)];
  }
  const b = BigInt(digits);
  if (b >= 2n ** 64n) return null;
  return [Number(b & 0xffffffffn), Number(b >> 32n)];
}

/** `flags` of a taker row: a backstop's record, a record with a `liquidation` object. */
export const BACKSTOP = 1;
export const LIQUIDATION = 2;

/** The UTC month of t, `YYYY-MM`, remembering the last month's bounds (a file's records are nearly in time order). */
function monthKeys() {
  let from = 0;
  let to = -1;
  let key = "";
  return (t: number): string => {
    if (t < from || t >= to) {
      const d = new Date(t);
      from = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
      to = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
      key = d.toISOString().slice(0, 7);
    }
    return key;
  };
}

export type TakerRows = {
  time: number[];
  px: number[];
  sz: number[];
  side: number[];
  flags: number[];
  user: number[];
  /** Each `tid` as its low and high halves, in turn. */
  tid: number[];
};

/** The 40 coins' taker records, by coin; and H14's base-tier check over the 38 coins' takers. */
export class TakerWriter implements Writer {
  readonly coins = new Map<string, TakerRows>();
  /** By UTC month, the highest fee ÷ notional of a 38-coin taker who paid in USDC with no builder fee (WAVE-H's pass). */
  readonly topTaker = new Map<string, number>();
  private readonly month = monthKeys();

  constructor(
    private readonly forty: ReadonlySet<string>,
    private readonly small: ReadonlySet<string>,
  ) {}

  wants(coin: string, crossed: boolean): boolean {
    return crossed && this.forty.has(coin);
  }

  add({ user, fill }: Kept, users: Names): boolean {
    const tid = u64Of(fill.tid);
    if (tid === null) return false;
    let rows = this.coins.get(fill.coin);
    if (rows === undefined) {
      rows = {
        time: [],
        px: [],
        sz: [],
        side: [],
        flags: [],
        user: [],
        tid: [],
      };
      this.coins.set(fill.coin, rows);
    }
    const px = Number(fill.px);
    const sz = Number(fill.sz);
    const liq = fill.liquidation;
    rows.time.push(fill.time);
    rows.px.push(px);
    rows.sz.push(sz);
    rows.side.push(fill.side === "B" ? 1 : -1);
    rows.flags.push(
      (liq?.method === "backstop" ? BACKSTOP : 0) |
        (liq !== undefined ? LIQUIDATION : 0),
    );
    rows.user.push(users.id(user));
    rows.tid.push(tid[0], tid[1]);
    if (
      this.small.has(fill.coin) &&
      fill.builderFee === undefined &&
      (fill.feeToken ?? "USDC") === "USDC"
    ) {
      const notional = px * sz;
      const rate = notional > 0 ? Number(fill.fee) / notional : 0;
      const m = this.month(fill.time);
      if (rate > (this.topTaker.get(m) ?? -Infinity))
        this.topTaker.set(m, rate);
    }
    return true;
  }
}

/** liq's keys beyond WAVE-H's schema (every fill carries them: external-apis, 2026-11-17). */
const LiqExtra = z.object({
  closedPnl: numText,
  oid: z
    .union([z.number().int().nonnegative().safe(), z.string().regex(/^\d+$/)])
    .transform(String),
  dir: z.string(),
});

const ADDRESS = /^0x[0-9a-f]{40}$/;
/** liq's `liqUser` when the object names no account. */
export const NONE = 0xffffffff;

type LiqRows = {
  time: number[];
  block: number[];
  coin: number[];
  user: number[];
  liqUser: number[];
  side: number[];
  crossed: number[];
  method: number[];
  dir: number[];
  px: number[];
  sz: number[];
  markPx: number[];
  startPosition: number[];
  fee: number[];
  closedPnl: number[];
  tid: number[];
  oid: number[];
};

/** Every coin's records with a `liquidation` object, both legs; names by the file's own dictionaries. */
export class LiqWriter implements Writer {
  readonly rows: LiqRows = {
    time: [],
    block: [],
    coin: [],
    user: [],
    liqUser: [],
    side: [],
    crossed: [],
    method: [],
    dir: [],
    px: [],
    sz: [],
    markPx: [],
    startPosition: [],
    fee: [],
    closedPnl: [],
    tid: [],
    oid: [],
  };
  readonly coins = new Names();
  readonly methods = new Names();
  readonly dirs = new Names();

  wants(_coin: string, _crossed: boolean, liquidation: boolean): boolean {
    return liquidation;
  }

  add({ user, fill, raw, block }: Kept, users: Names): boolean {
    const liq = fill.liquidation!;
    const extra = LiqExtra.safeParse(raw);
    if (!extra.success) return false;
    const tid = u64Of(fill.tid);
    const oid = u64Of(extra.data.oid);
    const named = liq.liquidatedUser?.toLowerCase();
    if (
      tid === null ||
      oid === null ||
      (named !== undefined && !ADDRESS.test(named))
    )
      return false;
    const r = this.rows;
    r.time.push(fill.time);
    r.block.push(block ?? NaN);
    r.coin.push(this.coins.id(fill.coin));
    r.user.push(users.id(user));
    r.liqUser.push(named === undefined ? NONE : users.id(named));
    r.side.push(fill.side === "B" ? 1 : -1);
    r.crossed.push(fill.crossed ? 1 : 0);
    r.method.push(this.methods.id(liq.method));
    r.dir.push(this.dirs.id(extra.data.dir));
    r.px.push(Number(fill.px));
    r.sz.push(Number(fill.sz));
    r.markPx.push(Number(liq.markPx));
    r.startPosition.push(Number(fill.startPosition));
    r.fee.push(Number(fill.fee));
    r.closedPnl.push(Number(extra.data.closedPnl));
    r.tid.push(tid[0], tid[1]);
    r.oid.push(oid[0], oid[1]);
    return true;
  }
}
