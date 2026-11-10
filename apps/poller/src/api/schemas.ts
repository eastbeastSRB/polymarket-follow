/**
 * Zod schemas for every reply and frame the poller uses (Iron Rule 3). Objects
 * are never strict: an added field passes, is kept in the raw text and is
 * logged once a day (code-rules). Fields are as the specs of 2026-11-10 give
 * them (perps-openapi.json SHA-256 55b198ce…, asyncapi-perps.json 685bae5e…);
 * money and sizes stay decimal strings.
 */
import { z } from "zod";

const id = z.number().int().safe();
const ms = z.number().int();

export const TickersReply = z.array(
  z.object({
    instrument_id: id,
    symbol: z.string(),
    index_price: z.string(),
    mark_price: z.string(),
    last_price: z.string(),
    mid_price: z.string(),
    open_interest: z.string(),
    funding_rate: z.string(),
    next_funding: ms,
    timestamp: ms,
    /** Live but not in the spec (the changelog of 2026-10-27). */
    long_count: z.number().int().optional(),
    short_count: z.number().int().optional(),
  }),
);

export const ExchangeReply = z.object({
  name: z.string(),
  version: z.string(),
  chain_id: z.number().int(),
  contract: z.string(),
  cancel_only: z.boolean(),
  engine_version: z.string(),
});

/**
 * Only what drives the subscriptions is required, so a change in a field the
 * poller does not use cannot stop the recording; the raw text keeps the rest.
 * The spec's other fields are named only so that the unknown-keys log reports
 * new ones.
 */
export const InstrumentsReply = z.array(
  z.object({
    instrument_id: id,
    symbol: z.string(),
    close_only: z.boolean().optional(),
    /** Present once the market is settled: delisted for good, never subscribed. */
    settlement: z
      .object({
        sequence: z.unknown().optional(),
        timestamp: z.unknown().optional(),
        price: z.unknown().optional(),
        insurance_debit: z.unknown().optional(),
      })
      .nullish(),
    instrument_type: z.unknown().optional(),
    category: z.unknown().optional(),
    isolated_only: z.unknown().optional(),
    display_symbol: z.unknown().optional(),
    base_asset: z.unknown().optional(),
    quote_asset: z.unknown().optional(),
    funding_interval: z.unknown().optional(),
    quantity_decimals: z.unknown().optional(),
    price_decimals: z.unknown().optional(),
    price_bounds: z.unknown().optional(),
    liquidation_fee: z.unknown().optional(),
    max_order_count: z.unknown().optional(),
    min_notional: z.unknown().optional(),
    max_market_notional: z.unknown().optional(),
    max_limit_notional: z.unknown().optional(),
    max_leverage: z.unknown().optional(),
    risk_tiers: z.unknown().optional(),
    ui_live_time: z.unknown().optional(),
    /** Live but not in the spec (2026-11-10 15:16Z, COLLECTOR-BUILD). */
    fee_override: z.unknown().optional(),
    funding_multiplier: z.unknown().optional(),
    logo: z.unknown().optional(),
  }),
);

/** One `timestamp` for the whole reply: the snapshot's (COLLECTOR-PLAN §8). */
export const BboReply = z.array(
  z.object({
    instrument_id: id,
    bid_price: z.string(),
    bid_quantity: z.string(),
    ask_price: z.string(),
    ask_quantity: z.string(),
    timestamp: ms,
  }),
);

/**
 * The WebSocket (asyncapi-perps.json). The books are the recording, so a book
 * frame needs only what the sampler and the price audit read: its channel,
 * its server time and two lists of levels, each level at least a price and a
 * size. Every other field is named so the unknown-keys log sees new ones.
 */
const level = z.array(z.string()).min(2);

export const BookFrame = z.object({
  ch: z.string().regex(/^book::\d+$/),
  ts: ms,
  ets: ms.optional(),
  sq: z.number().int().optional(),
  data: z.object({ b: z.array(level), a: z.array(level) }),
});

export const TradesFrame = z.object({
  ch: z.string().regex(/^trades::\d+$/),
  ts: ms,
  ets: ms.optional(),
  sq: z.number().int().optional(),
  data: z.array(
    z.object({
      tid: id,
      iid: id,
      side: z.unknown().optional(),
      p: z.unknown().optional(),
      qty: z.unknown().optional(),
      ts: z.unknown().optional(),
      hash: z.unknown().optional(),
      settlement: z.unknown().optional(),
      liquidation_details: z.unknown().optional(),
    }),
  ),
});

/** The reply to a `sub` or `unsub`: one status per channel, in the request's order. */
export const SubReply = z.object({
  id: z.number().int(),
  data: z.array(
    z.object({
      status: z.string(),
      error: z.string().optional(),
      arts: z.unknown().optional(),
      ts: z.unknown().optional(),
      ref: z.unknown().optional(),
    }),
  ),
});

export const PongReply = z.object({
  id: z.number().int().optional(),
  data: z.object({ status: z.literal("ok"), ts: ms, sq: z.number().int() }),
});

/** A request the server refused, `message_rate_limited` among them. */
export const ErrorReply = z.object({
  id: z.number().int().optional(),
  data: z.object({ status: z.literal("err"), error: z.string() }),
});

/** Key paths in `value` that `schema` does not name; arrays are written `[]`. */
export function unknownKeyPaths(
  schema: z.ZodType,
  value: unknown,
  at = "$",
): string[] {
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return value == null
      ? []
      : unknownKeyPaths(schema.unwrap() as z.ZodType, value, at);
  }
  if (schema instanceof z.ZodArray) {
    if (!Array.isArray(value)) return [];
    const paths = new Set<string>();
    for (const item of value as unknown[]) {
      for (const p of unknownKeyPaths(
        schema.element as z.ZodType,
        item,
        `${at}[]`,
      )) {
        paths.add(p);
      }
    }
    return [...paths];
  }
  if (schema instanceof z.ZodObject) {
    if (typeof value !== "object" || value === null) return [];
    const shape = schema.shape as Record<string, z.ZodType>;
    const paths: string[] = [];
    for (const [key, child] of Object.entries(value)) {
      const known = shape[key];
      if (known) paths.push(...unknownKeyPaths(known, child, `${at}.${key}`));
      else paths.push(`${at}.${key}`);
    }
    return paths;
  }
  return [];
}
