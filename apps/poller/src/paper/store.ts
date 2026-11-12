/**
 * The experiment's files under PAPER_ROOT (its folder on F:, tools\poller.env;
 * the plan's section 2, "What the experiment writes"). Every file is written
 * whole to a temporary name and renamed, so a crash leaves the old one or the
 * new one, never half; each is Zod-parsed when it is read back. The raw
 * replies (`raw\`, the collector's Recorder) are the record: append-only,
 * never rewritten. Rewritten here: `state.json`, each account's stored rows,
 * the page. Written once: a market-day. Appended: the day's log and manifest.
 */
import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { z } from "zod";
import { utcDate } from "../schedule.js";
import { FillRow } from "./routes.js";

export type StoredRow = z.infer<typeof FillRow>;

const ms = z.number().int();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const address = z.string().regex(/^0x[0-9a-f]{40}$/);

/** The end of time for a standing hole (the largest instant a Date holds). */
export const FOREVER = 8_640_000_000_000_000;

/**
 * A window of an account that was not read (the plan's R3 and its review's
 * F2, F3): after a page cap or the safety cap, from the last fill read to the
 * read's end; an account-day holding a rejected row; an account the API does
 * not know, from its read-through instant on.
 */
export const Hole = z.object({
  from: ms,
  to: ms,
  cause: z.enum([
    "page cap",
    "safety cap",
    "rejected rows",
    "account not found",
  ]),
  /** The UTC date of the read, whose raw replies a re-parse opens (F3). */
  readOn: date,
  rows: z.number().int().optional(),
});
export type Hole = z.infer<typeof Hole>;

/** `P`: every fill before it is read or inside a hole; `from`: the instant the account's reads start at. */
export const AccountState = z.object({
  P: ms,
  from: ms,
  holes: z.array(Hole),
});
export type AccountState = z.infer<typeof AccountState>;

export const State = z.object({
  version: z.literal(1),
  accounts: z.record(address, AccountState),
});
export type State = z.infer<typeof State>;

const sha256 = (bytes: Buffer | string): string =>
  createHash("sha256").update(bytes).digest("hex");

/** Written whole to `<file>.tmp`, then renamed over the file. */
export function writeAtomic(file: string, bytes: Buffer | string): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(`${file}.tmp`, bytes);
  renameSync(`${file}.tmp`, file);
}

export class PaperStore {
  /** The files written in this run, with their hashes: the day's manifest. */
  private readonly written: string[] = [];

  constructor(readonly root: string) {}

  private note(file: string, bytes: Buffer | string): void {
    const rel = path.relative(this.root, file).split(path.sep).join("/");
    this.written.push(`${sha256(bytes)} *${rel}`);
  }

  private write(file: string, bytes: Buffer | string): void {
    writeAtomic(file, bytes);
    this.note(file, bytes);
  }

  readState(): State {
    const file = path.join(this.root, "state.json");
    if (!existsSync(file)) return { version: 1, accounts: {} };
    return State.parse(JSON.parse(readFileSync(file, "utf8")));
  }

  saveState(state: State): void {
    this.write(
      path.join(this.root, "state.json"),
      `${JSON.stringify(state)}\n`,
    );
  }

  private rowsFile(addr: string): string {
    return path.join(this.root, "fills", `${addr}.json.gz`);
  }

  /** An account's stored rows, oldest first (none when it has no file). */
  readRows(addr: string): StoredRow[] {
    const file = this.rowsFile(addr);
    if (!existsSync(file)) return [];
    const doc = z
      .object({ addr: address, rows: z.array(FillRow) })
      .parse(JSON.parse(gunzipSync(readFileSync(file)).toString("utf8")));
    if (doc.addr !== addr) throw new Error(`${file} holds ${doc.addr}`);
    return doc.rows;
  }

  /**
   * Adds rows to an account's store: deduplicated by (trade_id,
   * instrument_id, timestamp), the stored row first, oldest first (stable).
   * Returns how many were new.
   */
  addRows(addr: string, rows: readonly StoredRow[]): number {
    if (rows.length === 0) return 0;
    const all = this.readRows(addr);
    const keys = new Set(all.map(rowKey));
    let added = 0;
    for (const row of rows) {
      const k = rowKey(row);
      if (keys.has(k)) continue;
      keys.add(k);
      all.push(row);
      added += 1;
    }
    if (added === 0) return 0;
    all.sort((a, b) => a.timestamp - b.timestamp);
    this.write(
      this.rowsFile(addr),
      gzipSync(JSON.stringify({ addr, rows: all })),
    );
    return added;
  }

  marketDayFile(iid: number, day: number): string {
    return path.join(
      this.root,
      "panel",
      String(iid),
      `${utcDate(day)}.json.gz`,
    );
  }

  /** The UTC days (00:00Z) of a market whose file exists. */
  marketDays(iid: number): Set<number> {
    const dir = path.join(this.root, "panel", String(iid));
    if (!existsSync(dir)) return new Set();
    return new Set(
      readdirSync(dir)
        .map((n) => /^(\d{4}-\d{2}-\d{2})\.json\.gz$/.exec(n)?.[1])
        .filter((d): d is string => d !== undefined)
        .map((d) => Date.parse(`${d}T00:00:00Z`)),
    );
  }

  saveMarketDay(day: MarketDay): void {
    const file = this.marketDayFile(day.iid, day.day);
    if (existsSync(file))
      throw new Error(`${file} exists: a day is written once`);
    this.write(file, gzipSync(JSON.stringify(day)));
  }

  readMarketDay(iid: number, day: number): MarketDay {
    const file = this.marketDayFile(iid, day);
    const parsed = MarketDay.parse(
      JSON.parse(gunzipSync(readFileSync(file)).toString("utf8")),
    );
    if (parsed.iid !== iid || parsed.day !== day) {
      throw new Error(`${file} holds market ${parsed.iid}, day ${parsed.day}`);
    }
    return parsed;
  }

  /** One line of the run's log, `log\<run date>.jsonl` (append-only). */
  logLine(runDate: string, record: Record<string, unknown>): void {
    const file = path.join(this.root, "log", `${runDate}.jsonl`);
    mkdirSync(path.dirname(file), { recursive: true });
    appendFileSync(file, `${JSON.stringify(record)}\n`);
  }

  /** Appends this run's written files to `manifest\<run date>.sha256`, and forgets them. */
  flushManifest(runDate: string): void {
    if (this.written.length === 0) return;
    const file = path.join(this.root, "manifest", `${runDate}.sha256`);
    mkdirSync(path.dirname(file), { recursive: true });
    appendFileSync(file, `${this.written.join("\n")}\n`);
    this.written.length = 0;
  }
}

export const rowKey = (r: StoredRow): string =>
  `${r.trade_id}|${r.instrument_id}|${r.timestamp}`;

/**
 * One market's UTC day in the kit's panel format (RESEARCH-KIT §1): 1,440
 * minute marks (null where none), the populated minutes' klines, and the
 * funding settlements filed by nominal hour with their stamps.
 */
export const MarketDay = z.object({
  iid: z.number().int(),
  day: ms,
  marks: z.array(z.number().nullable()).length(1_440),
  klines: z.object({
    minute: z.array(z.number().int()),
    trades: z.array(z.number().int()),
    volume: z.array(z.number()),
  }),
  funding: z.array(z.tuple([ms, z.number(), ms])),
});
export type MarketDay = z.infer<typeof MarketDay>;
