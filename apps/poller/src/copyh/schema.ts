/**
 * The boundary of COPY-H's fills (copyh/rules.md C3; Iron Rule 3; the
 * supervisor's rulings 1 and 5 on COPYH-STORE's plan, 2026-11-25). A record
 * is a `user` and its fill object, from a line of either archive format.
 * - **`closedPnl`, `fee` and `builderFee` are never parsed:** on the fast
 *   path each `"<key>":<value>` pair is cut from the record's bytes before
 *   `JSON.parse` (`cutText`); a record whose text does not settle that goes
 *   to the slow path, whose reviver drops the three at any depth before any
 *   object holds them (`parseSlow`). Every unescaped `"<key>":` in valid
 *   JSON is a key (a quote inside a string is escaped), so the cut finds
 *   each; any trace of a name left after it sends the record to the slow
 *   path.
 * - `oid` and `tid` are kept as their digits, at most 2^64 − 1: a number
 *   below 2^53 by its value, a longer one by `JSON.parse`'s `context.source`.
 * - Zod checks the rest (`RecordSchema`): `user` 0x and 40 hex digits,
 *   lower-cased when read; `coin` and `dir` non-empty text; `px` decimal
 *   text above 0; `sz` unsigned decimal text of at most EXACT_DIGITS
 *   significant digits (`exactInDouble`), so that a double gives the
 *   decimal value back exactly (the chain rule's exactness; D5);
 *   `startPosition` signed decimal text read as its double, whose shortest
 *   text must have at most EXACT_DIGITS (`exactAsDouble`: the archive writes
 *   some with 16-18 digits, a residue under a lot past the coin's decimals,
 *   whose double is the lot value's; the burn-in, decisions 2026-11-26);
 *   `side` "A" or "B"; `time` a safe integer; `crossed` a
 *   boolean; `liquidation` optional, its `liquidatedUser` (if any) an
 *   address.
 */
import { z } from "zod";
import { EXACT_DIGITS } from "./design.js";

const CUT = ["closedPnl", "fee", "builderFee"];
const KEYS = CUT.map((k) => Buffer.from(`"${k}":`, "latin1"));
const NAMES = CUT.map((k) => `"${k}"`);
const QUOTE = 0x22;
const BACKSLASH = 0x5c;
const COMMA = 0x2c;
const OPEN = 0x7b;
const CLOSE = 0x7d;
const isNumberByte = (c: number) =>
  (c >= 0x30 && c <= 0x39) ||
  c === 0x2d ||
  c === 0x2b ||
  c === 0x2e ||
  c === 0x65 ||
  c === 0x45;

/** The end (exclusive) of the string or number value at v, or -1 when it is neither. */
function valueEnd(b: Buffer, v: number, e: number): number {
  if (b[v] === QUOTE) {
    for (let q = v + 1; q < e; q++) {
      if (b[q] === BACKSLASH) q++;
      else if (b[q] === QUOTE) return q + 1;
    }
    return -1;
  }
  let q = v;
  while (q < e && isNumberByte(b[q]!)) q++;
  return q === v ? -1 : q;
}

/**
 * The record's text [s, e) with every `"closedPnl":…`, `"fee":…` and
 * `"builderFee":…` pair cut out with one comma beside it: the comma before
 * it when a kept pair stands before it in its object, else the comma after
 * it (a run of cut pairs at an object's start); null when its text does not
 * settle that (a value that is not a plain string or number, a key not
 * preceded by `,` or `{` or not followed by `,` or `}`, an escaped quote
 * before a key, or a name left after the cut). Each key is searched in the
 * record's own bytes only: an unbounded search runs on past a record that
 * lacks the key (most lack `builderFee`), quadratic in a block line's
 * records.
 */
export function cutText(b: Buffer, s: number, e: number): string | null {
  const upToEnd = b.subarray(0, e);
  /** Each pair found: its key's first byte and its value's end. */
  const pairs: [number, number][] = [];
  for (const key of KEYS)
    for (let k = upToEnd.indexOf(key, s); k !== -1;) {
      let slashes = 0;
      for (let j = k - 1; j >= s && b[j] === BACKSLASH; j--) slashes++;
      if (slashes % 2 === 1) return null;
      const q = valueEnd(b, k + key.length, e);
      if (q < 0 || (b[q] !== COMMA && b[q] !== CLOSE)) return null;
      if (b[k - 1] !== COMMA && b[k - 1] !== OPEN) return null;
      pairs.push([k, q]);
      k = upToEnd.indexOf(key, q);
    }
  pairs.sort((x, y) => x[0] - y[0]);
  let text = "";
  let at = s;
  /** Whether the pair before is cut and starts its object's run of cut pairs. */
  let leadingEnd = -1;
  for (const [k, q] of pairs) {
    const leading = b[k - 1] === OPEN || leadingEnd === k - 1;
    const [from, to] = leading ? [k, b[q] === COMMA ? q + 1 : q] : [k - 1, q];
    if (from < at) return null;
    text += b.toString("utf8", at, from);
    at = to;
    leadingEnd = leading ? q : -1;
  }
  text += b.toString("utf8", at, e);
  return NAMES.some((n) => text.includes(n)) ? null : text;
}

/** A `tid` or `oid` of 16 digits or more: the text then keeps every id as its digits (above 2^53 a number rounds). */
const LONG_ID = /"(?:tid|oid)":\s*\d{16}/;
const keepIds = (
  key: string,
  value: unknown,
  context?: { source?: string },
): unknown =>
  (key === "tid" || key === "oid") &&
  typeof value === "number" &&
  typeof context?.source === "string"
    ? context.source
    : value;
const DROPPED = new Set(CUT);
const dropAndKeepIds = (
  key: string,
  value: unknown,
  context?: { source?: string },
): unknown => (DROPPED.has(key) ? undefined : keepIds(key, value, context));

/** The fast path: a cut record's text, its ids kept as digits when one is long. */
export const parseFast = (text: string): unknown =>
  LONG_ID.test(text) ? JSON.parse(text, keepIds) : JSON.parse(text);

/** The slow path: any JSON text, `closedPnl`, `fee` and `builderFee` dropped at any depth by the reviver, the ids kept as digits. */
export const parseSlow = (text: string): unknown =>
  JSON.parse(text, dropAndKeepIds);

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const U64_MAX = "18446744073709551615";
/** Digits of an id: a number below 2^53 by its value, or its digits as text; at most 2^64 − 1. */
const Id = z
  .union([z.number().int().nonnegative().safe(), z.string().regex(/^\d+$/)])
  .transform(String)
  .refine(
    (d) =>
      d.length < U64_MAX.length ||
      (d.length === U64_MAX.length && d <= U64_MAX),
    "above 2^64 − 1",
  );
const UNSIGNED = /^\d+(\.\d+)?$/;
const SIGNED = /^-?\d+(\.\d+)?$/;

const FillSchema = z.object({
  coin: z.string().min(1),
  px: z
    .string()
    .regex(UNSIGNED)
    .refine((p) => Number(p) > 0, "not above 0"),
  sz: z.string().regex(UNSIGNED).refine(exactInDouble, "beyond 15 digits"),
  side: z.enum(["A", "B"]),
  time: z.number().int().safe(),
  startPosition: z
    .string()
    .regex(SIGNED)
    .refine(exactAsDouble, "its double beyond 15 digits"),
  crossed: z.boolean(),
  oid: Id,
  tid: Id,
  dir: z.string().min(1),
  liquidation: z
    .object({
      liquidatedUser: z.string().regex(ADDRESS).optional(),
      method: z.string(),
    })
    .optional(),
});
export const RecordSchema = z.tuple([z.string().regex(ADDRESS), FillSchema]);

export type Fill = z.infer<typeof FillSchema>;
/** A record: `user` lower-cased, its fill as the boundary reads it. */
export type Rec = { user: string; fill: Fill };

/** A parsed record through the boundary; null when it fails. */
export function recordOf(raw: unknown): Rec | null {
  const r = RecordSchema.safeParse(raw);
  if (!r.success) return null;
  const [user, fill] = r.data;
  return { user: user.toLowerCase(), fill };
}

/** Whether a decimal text has at most EXACT_DIGITS significant digits, so that its double gives the value back exactly. */
export function exactInDouble(text: string): boolean {
  const digits = text.replace(/^-/, "").replace(".", "");
  const first = digits.search(/[1-9]/);
  if (first < 0) return true;
  let last = digits.length - 1;
  while (digits[last] === "0") last--;
  return last - first + 1 <= EXACT_DIGITS;
}

/** Whether a decimal text's double has a shortest text of at most EXACT_DIGITS significant digits (the digits before an "e", which it has below 1e-6 and from 1e21): the double then gives that value back exactly. */
export function exactAsDouble(text: string): boolean {
  const n = Number(text);
  return Number.isFinite(n) && exactInDouble(String(n).split("e")[0]!);
}
