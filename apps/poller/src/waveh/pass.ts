/**
 * One pass over fill files (rules.md H1, H2, H4; R3's counts): each file
 * through the gate, its list's hash and its one frame, every record parsed by
 * WAVE-H's schema. It keeps the counted fills (each fill once, by account and
 * `tid`) and counts what the rehearsal and the look print before any price:
 * records and failures by UTC day, the 38 coins' liquidation legs by month,
 * kind and method, records stamped at or after the run's bound, the gaps in
 * `node_fills_by_block`'s block numbers by day, and the highest taker rate a
 * month (a `crossed` fill in the 38 coins without a builder fee, its fee in
 * USDC). A day with more than 1%, and at least 10, of its records failing
 * stops the run.
 */
import type { Gate } from "./gate.js";
import type { Coins } from "./coins.js";
import {
  countedOf,
  legKind,
  parseLine,
  parseRecord,
  rawRecords,
  type Counted,
  type Format,
  type Rec,
} from "./fills.js";
import { StoreError, linesOf, readLz4, type DataList } from "./store.js";

export type Pass = {
  counted: Counted[];
  /** By the file's UTC day: records read and records failing (a line that does not parse counts one). */
  days: Map<string, { records: number; failed: number }>;
  /** `<month>|<kind>|<method>` → liquidation legs of the 38 coins. */
  legs: Map<string, number>;
  /** Records stamped at or after the bound: not used. */
  late: number;
  /** `node_fills_by_block`: blocks missing between consecutive lines, by the file's day; lines not after the one before. */
  blocks: { missing: Map<string, number>; back: number; last: number | null };
  /** By month: the highest fee ÷ notional of a taker's fill in the 38 coins without a builder fee. */
  topTaker: Map<string, number>;
};

export const newPass = (): Pass => ({
  counted: [],
  days: new Map(),
  legs: new Map(),
  late: 0,
  blocks: { missing: new Map(), back: 0, last: null },
  topTaker: new Map(),
});

const add = (m: Map<string, number>, k: string, n = 1) =>
  m.set(k, (m.get(k) ?? 0) + n);
const monthOf = (t: number) => new Date(t).toISOString().slice(0, 7);
/** The failure share above which a day stops the run, and the least count (H2). */
export const FAIL_SHARE = 0.01;
export const FAIL_LEAST = 10;

/**
 * Reads one fill file into the pass; `seen` holds every liquidation leg and
 * counted fill already read (account and tid), so the hour both formats hold
 * counts once. `visit` sees each record kept (for the tape).
 */
export function passFile(
  pass: Pass,
  seen: Set<string>,
  gate: Gate,
  store: string,
  list: DataList,
  key: string,
  coins: Coins,
  until: number,
  visit?: (rec: Rec) => void,
): void {
  const format: Format = key.startsWith("node_fills_by_block/")
    ? "node_fills_by_block"
    : "node_fills";
  const day = `${key.split("/")[2]!.slice(0, 4)}-${key.split("/")[2]!.slice(4, 6)}-${key.split("/")[2]!.slice(6, 8)}`;
  const tally = pass.days.get(day) ?? { records: 0, failed: 0 };
  pass.days.set(day, tally);
  for (const line of linesOf(readLz4(gate, store, list, key))) {
    let raw: ReturnType<typeof rawRecords>;
    try {
      raw = rawRecords(format, parseLine(line));
    } catch {
      raw = null;
    }
    if (raw === null) {
      tally.failed += 1;
      continue;
    }
    if (raw.block !== null) {
      const last = pass.blocks.last;
      if (last !== null && raw.block <= last) pass.blocks.back += 1;
      else if (last !== null && raw.block > last + 1)
        add(pass.blocks.missing, day, raw.block - last - 1);
      pass.blocks.last = Math.max(last ?? raw.block, raw.block);
    }
    for (const r of raw.records) {
      const rec = parseRecord(r);
      if (rec === null) {
        tally.failed += 1;
        continue;
      }
      tally.records += 1;
      if (rec.fill.time >= until) {
        pass.late += 1;
        continue;
      }
      visit?.(rec);
      if (!coins.byName.has(rec.fill.coin)) continue;
      const month = monthOf(rec.fill.time);
      if (
        rec.fill.crossed &&
        rec.fill.builderFee === undefined &&
        (rec.fill.feeToken ?? "USDC") === "USDC"
      ) {
        const notional = Number(rec.fill.px) * Number(rec.fill.sz);
        const rate = notional > 0 ? Number(rec.fill.fee) / notional : 0;
        if (rate > (pass.topTaker.get(month) ?? -Infinity))
          pass.topTaker.set(month, rate);
      }
      const kind = legKind(rec);
      if (kind === null) continue;
      const k = `${rec.user}|${rec.fill.tid}`;
      if (seen.has(k)) continue;
      seen.add(k);
      add(pass.legs, `${month}|${kind}|${rec.fill.liquidation!.method}`);
      const c = countedOf(rec, coins);
      if (c !== null) pass.counted.push(c);
    }
  }
  const share = tally.failed / (tally.records + tally.failed);
  if (tally.failed >= FAIL_LEAST && share > FAIL_SHARE)
    throw new StoreError(
      `${day}: ${tally.failed} of ${tally.records + tally.failed} records fail WAVE-H's schema`,
    );
}
