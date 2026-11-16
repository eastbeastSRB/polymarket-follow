/**
 * Hyperliquid's fill records (rules.md H2) and WAVE-H's counted fill (H4).
 * A line of either archive format gives its records; each is parsed by
 * WAVE-H's own schema, a failure dropped and counted by the caller. A counted
 * fill is the liquidated account's own reducing fill in a small coin, a
 * taker's or a backstop's, in MARKET-1's `Liq` shape with the coin's asset id
 * as its market, so MARKET-1's order and wave code read it unchanged.
 */
import { z } from "zod";
import type { Liq } from "../market1/fills.js";
import type { Coins } from "./coins.js";

export type Format = "node_fills" | "node_fills_by_block";

/** A `tid` of 16 digits or more may pass 2^53 − 1: such a line keeps every `tid` as its text. */
const LONG_TID = /"tid":\s*\d{16}/;
const keepTid = (
  key: string,
  value: unknown,
  context?: { source?: string },
): unknown =>
  key === "tid" &&
  typeof value === "number" &&
  typeof context?.source === "string"
    ? context.source
    : value;

export function parseLine(text: string): unknown {
  return LONG_TID.test(text) ? JSON.parse(text, keepTid) : JSON.parse(text);
}

/** As the kit's `isNumStr`: a non-empty string that is a finite number. */
export const numText = z
  .string()
  .refine((s) => s.length > 0 && Number.isFinite(Number(s)), "not a number");

const FillSchema = z.object({
  coin: z.string(),
  px: numText,
  sz: numText,
  side: z.enum(["A", "B"]),
  time: z.number().int().safe(),
  startPosition: numText,
  crossed: z.boolean(),
  fee: numText,
  tid: z
    .union([z.number().int().nonnegative().safe(), z.string().regex(/^\d+$/)])
    .transform(String),
  liquidation: z
    .object({
      liquidatedUser: z.string().optional(),
      markPx: numText,
      method: z.string(),
    })
    .optional(),
  builderFee: numText.optional(),
  feeToken: z.string().optional(),
});
const RecordSchema = z.tuple([
  z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  FillSchema,
]);
const BlockSchema = z.object({
  block_number: z.number().int().safe(),
  events: z.array(z.unknown()),
});

export type Fill = z.infer<typeof FillSchema>;
/** A record: `user` lower-case, its fill with `tid` as digits. */
export type Rec = { user: string; fill: Fill };

/** A parsed line's raw records and, by block, its block number; null when the line is not its format's. */
export function rawRecords(
  format: Format,
  line: unknown,
): { records: unknown[]; block: number | null } | null {
  if (format === "node_fills") return { records: [line], block: null };
  const b = BlockSchema.safeParse(line);
  return b.success
    ? { records: b.data.events, block: b.data.block_number }
    : null;
}

export function parseRecord(raw: unknown): Rec | null {
  const r = RecordSchema.safeParse(raw);
  if (!r.success) return null;
  const [user, fill] = r.data;
  return { user: user.toLowerCase(), fill };
}

/** How a record of a liquidation stands to H4 (null: no `liquidation` object). */
type LegKind =
  | "counted"
  | "counterparty"
  | "no liquidatedUser"
  | "not reducing"
  | "neither crossed nor backstop";

/** H4's tests, in any coin: the own leg, reducing ("B" +1, "A" −1, `startPosition` of the other sign), a taker's or a backstop's. */
export function legKind({ user, fill }: Rec): LegKind | null {
  const liq = fill.liquidation;
  if (liq === undefined) return null;
  if (liq.liquidatedUser === undefined) return "no liquidatedUser";
  if (liq.liquidatedUser.toLowerCase() !== user) return "counterparty";
  const side = fill.side === "B" ? 1 : -1;
  const start = Number(fill.startPosition);
  if (Math.sign(start) !== -side) return "not reducing";
  if (!fill.crossed && liq.method !== "backstop")
    return "neither crossed nor backstop";
  return "counted";
}

/** A counted fill: its side the forced side (+1 a forced buy, −1 a forced sell), `iid` the coin's asset id. */
export type Counted = Liq & { method: string };

export function countedOf(rec: Rec, coins: Coins): Counted | null {
  const coin = coins.byName.get(rec.fill.coin);
  if (coin === undefined || legKind(rec) !== "counted") return null;
  return {
    t: rec.fill.time,
    iid: coin.assetId,
    addr: rec.user,
    side: rec.fill.side === "B" ? 1 : -1,
    tid: rec.fill.tid,
    method: rec.fill.liquidation!.method,
  };
}
