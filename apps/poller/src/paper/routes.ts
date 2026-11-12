/**
 * The experiment's four routes (the plan's section 6; external-apis: weights,
 * windows, paging) and their boundary checks (Iron Rule 3). Ids of fills are
 * kept as the digits the reply wrote them with, so ids above 2^53 − 1 survive
 * (FIND-REVIEW-6, F4: liquidation fills carry such ids). Objects are never
 * strict: an added field passes and is logged once a day.
 */
import { z } from "zod";
import type { ClientLimits, Reviver, RouteTable } from "../api/rest-client.js";

/** The experiment's share beside the collector's 50: 120 a minute, 15 in any 5 s (decisions 2026-11-12, Q10). */
export const PAPER_LIMITS: ClientLimits = {
  share: 120,
  burst: 15,
  userAgent: "data-reader/1.0",
};

const ms = z.number().int();
const safeInt = z.number().int().safe();
/** As the kit's `isNumStr`: a non-empty string that is a finite number. */
const numText = z
  .string()
  .refine((s) => s.length > 0 && Number.isFinite(Number(s)), "not a number");

/** The page; its rows are checked one by one (`FillRow`, in `readFills`), so one bad row drops itself, not the page. */
export const FillsPage = z.object({
  data: z.array(z.unknown()),
  more: z.boolean(),
  cursor: z.string().nullish(),
});

/** `[bucket_ms, last_mark]`, one a minute (external-apis, "Market data"). */
export const MarksPage = z.object({
  data: z.array(z.tuple([ms, numText]).rest(z.unknown())),
  more: z.boolean(),
});

/** `[open_ms, open, high, low, close, volume, trades]`, populated minutes only. */
export const KlinesPage = z.object({
  data: z.array(
    z
      .tuple([ms, numText, numText, numText, numText, numText, safeInt])
      .rest(z.unknown()),
  ),
  more: z.boolean(),
});

/** Settlements, newest first. */
export const FundingPage = z.object({
  data: z.array(z.object({ funding_rate: numText, timestamp: ms })),
  more: z.boolean(),
});

const ID_KEYS = new Set(["trade_id", "order_id"]);

/** A fill's ids as the reply's digits (Node 24's `context.source`), never through a float. */
export const keepIdDigits: Reviver = (key, value, context) =>
  ID_KEYS.has(key) &&
  typeof value === "number" &&
  typeof context?.source === "string"
    ? context.source
    : value;

export const PAPER_ROUTES = {
  fills: {
    path: "/v1/info/fills",
    weight: 10,
    schema: FillsPage,
    reviver: keepIdDigits,
  },
  "mark-history": {
    path: "/v1/info/mark-history",
    weight: 5,
    schema: MarksPage,
  },
  klines: { path: "/v1/info/klines", weight: 5, schema: KlinesPage },
  funding: { path: "/v1/info/funding", weight: 10, schema: FundingPage },
} as const satisfies RouteTable;

export type PaperRoutes = typeof PAPER_ROUTES;

/**
 * One fill row (the plan's R3): the kit's `validFill`, except that the two
 * ids are strings of digits.
 */
export const FillRow = z.object({
  trade_id: z.string().regex(/^\d+$/),
  order_id: z.string().regex(/^\d+$/),
  instrument_id: safeInt,
  timestamp: safeInt,
  side: z.enum(["long", "short"]),
  price: numText,
  quantity: numText,
  previous_size: numText,
  fee: numText,
  pnl: numText,
  total_fee: numText.optional(),
  taker: z.boolean(),
  liquidation: z.boolean(),
  adl: z.boolean().optional(),
  settlement: z.boolean().optional(),
});

/** A row that failed `FillRow`: its timestamp when it has a usable one. */
export type RejectedRow = { t: number | null };
