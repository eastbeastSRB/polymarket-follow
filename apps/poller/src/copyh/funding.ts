/**
 * The funding reader (copyh/rules.md C9, "Funding"; RM5): a window file of
 * COPY-H's funding store (`info/fundingHistory/<coin>/<window start ms>.json`,
 * one `fundingHistory` reply) through Zod — rows of `coin` text,
 * `fundingRate` and `premium` decimal text, `time` a safe integer — each row
 * of the file's own coin, and its **nominal hour its `time` rounded to the
 * nearest hour** (WAVE-H's H9: a row half an hour after one hour goes to the
 * next; rows come a few ms to about 15 minutes late, the 2025-07-19 10:00Z
 * and 2025-07-27 12:00Z settlements in every coin, the supervisor's check of
 * 2026-11-25). No coin's nominal hour may come twice, across its windows. A
 * file that fails is a stop (exit 5), never guessed. The freeze tool
 * (`tools/copyh-freeze.cjs --data`) runs this reader on every window before
 * it lists them, reading the rows' shape and times only, and no rate; a step
 * reads the rows through its seal (`checkInstant`).
 */
import { z } from "zod";
import { HOUR_MS } from "../schedule.js";
import { StoreError } from "./run.js";
import { checkInstant, type Seal } from "./seal.js";

const DECIMAL = /^-?\d+(\.\d+)?$/;
const Rows = z.array(
  z.object({
    coin: z.string().min(1),
    fundingRate: z.string().regex(DECIMAL),
    premium: z.string().regex(DECIMAL),
    time: z.number().int().safe(),
  }),
);
export type FundingRow = z.infer<typeof Rows>[number] & { hour: number };

/** A window file's key in the funding store. */
export const fundingKey = (coin: string, windowStart: number) =>
  `info/fundingHistory/${coin}/${windowStart}.json`;

/** A row's nominal hour: its time rounded to the nearest hour, half an hour up. */
export const nominalHour = (time: number) =>
  Math.round(time / HOUR_MS) * HOUR_MS;

/** One window file's rows, each with its nominal hour; why not, when it fails the reader. */
export function readWindow(bytes: Buffer, coin: string): FundingRow[] | string {
  let json: unknown;
  try {
    json = JSON.parse(bytes.toString("utf8"));
  } catch {
    return "not JSON";
  }
  const r = Rows.safeParse(json);
  if (!r.success) {
    const i = r.error.issues[0]!;
    return `not fundingHistory's shape: ${i.path.join(".")}: ${i.message}`;
  }
  const rows: FundingRow[] = [];
  for (const row of r.data) {
    if (row.coin !== coin) return `a row of another coin, ${row.coin}`;
    rows.push({ ...row, hour: nominalHour(row.time) });
  }
  return rows;
}

/** A coin's windows read together: no nominal hour twice across them; a window that fails stops. */
export function coinRows(
  coin: string,
  windows: readonly { key: string; bytes: Buffer }[],
): FundingRow[] {
  const all: FundingRow[] = [];
  const hours = new Set<number>();
  for (const w of windows) {
    const rows = readWindow(w.bytes, coin);
    if (typeof rows === "string") throw new StoreError(`${w.key}: ${rows}`);
    for (const row of rows) {
      if (hours.has(row.hour))
        throw new StoreError(
          `${w.key}: ${coin}'s hour ${new Date(row.hour).toISOString()} twice`,
        );
      hours.add(row.hour);
      all.push(row);
    }
  }
  return all;
}

/** A step's rows of a coin: every row through the seal (step 1 reads the hours before END_E only). */
export function sealedRows(
  coin: string,
  windows: readonly { key: string; bytes: Buffer }[],
  seal: Seal,
): FundingRow[] {
  const rows = coinRows(coin, windows);
  for (const row of rows) checkInstant(row.time, `${coin}'s funding row`, seal);
  return rows;
}
