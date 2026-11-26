/**
 * Chain heads (copyh/rules.md C3, the mapping's one change; the review's L3;
 * the supervisor's rulings 3 and 5 on COPYH-STORE's differences,
 * 2026-11-25). Hyperliquid's `startPosition` is per fill, Polymarket's
 * `previous_size` per order event. One matching event's fills — one
 * account's, of one `oid`, coin and `time` — are split into chains: taken
 * in the order of `startPosition` along the order's side (ascending for a
 * buy, descending for a sell; the archive's order on ties), a fill b follows
 * a fill a that no fill follows yet when a's `startPosition` plus its signed
 * size (+`sz` for "B", −`sz` for "A") equals b's `startPosition` exactly;
 * when two could precede b, the one earlier in the archive does; otherwise b
 * heads a new chain. Every fill takes its chain head's `startPosition`.
 * Exact: each value is the decimal its double's shortest text gives back,
 * which has at most 15 significant digits (schema.ts, checked at parse: a
 * `startPosition` by its double's shortest text, `exactAsDouble`; a `sz` by
 * its own, `exactInDouble`), compared as scaled integers.
 */

/** A fill of a matching event, as the store keeps it. */
export type ChainFill = {
  readonly startPosition: number;
  readonly sz: number;
  /** +1 for "B", −1 for "A". */
  readonly side: number;
};

/** A double's shortest decimal text as an integer and a power of ten: x = m · 10^exp. */
function decimalOf(x: number): { m: bigint; exp: number } {
  const [mant, power] = String(x).split("e") as [string, string | undefined];
  const neg = mant.startsWith("-");
  const body = neg ? mant.slice(1) : mant;
  const dot = body.indexOf(".");
  const digits = dot < 0 ? body : body.slice(0, dot) + body.slice(dot + 1);
  const m = BigInt(digits);
  return {
    m: neg ? -m : m,
    exp: Number(power ?? 0) - (dot < 0 ? 0 : body.length - dot - 1),
  };
}

/** Each fill's chain head's `startPosition`, in the fills' own order (the archive's). */
export const chainHeads = (fills: readonly ChainFill[]): number[] =>
  chainsOf(fills).head;

/** The number of chains one matching event's fills make (the integrity counts the events with more than one, D12). */
export const chainCount = (fills: readonly ChainFill[]): number =>
  chainsOf(fills).chains;

function chainsOf(fills: readonly ChainFill[]): {
  head: number[];
  chains: number;
} {
  if (fills.length === 1) return { head: [fills[0]!.startPosition], chains: 1 };
  const s = fills.map((f) => decimalOf(f.startPosition));
  const d = fills.map((f) => decimalOf(f.sz));
  const scale = Math.max(0, ...[...s, ...d].map((v) => -v.exp));
  const at = (v: { m: bigint; exp: number }) =>
    v.m * 10n ** BigInt(v.exp + scale);
  const start = s.map(at);
  const next = fills.map(
    (f, i) => start[i]! + (f.side > 0 ? at(d[i]!) : -at(d[i]!)),
  );
  const order = fills
    .map((_, i) => i)
    .sort((a, b) => {
      const x = start[a]! * BigInt(Math.sign(fills[a]!.side) || 1);
      const y = start[b]! * BigInt(Math.sign(fills[b]!.side) || 1);
      return x < y ? -1 : x > y ? 1 : a - b;
    });
  const head = new Array<number>(fills.length);
  /** Each open chain's last fill and its head's value. */
  const open: { last: number; head: number }[] = [];
  for (const b of order) {
    let best = -1;
    for (let c = 0; c < open.length; c++)
      if (
        next[open[c]!.last] === start[b] &&
        (best < 0 || open[c]!.last < open[best]!.last)
      )
        best = c;
    if (best < 0) {
      open.push({ last: b, head: fills[b]!.startPosition });
      head[b] = fills[b]!.startPosition;
    } else {
      open[best]!.last = b;
      head[b] = open[best]!.head;
    }
  }
  return { head, chains: open.length };
}
