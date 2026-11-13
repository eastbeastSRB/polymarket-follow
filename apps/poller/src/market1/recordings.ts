/**
 * The collector's recordings as MARKET-1 reads them (rules.md M7; the formats:
 * architecture "The collector", `store/files.ts`, `ws/book-sampler.ts`,
 * `health/coverage.ts`): day folders, closed when they hold `manifest.json`;
 * each closed day checked once (every book hour file against its manifest,
 * every line through MARKET-1's own schema, the coverage events kept); and
 * the book lines at the instants the legs need, from the hours around them.
 * Every read is behind the sealed gate.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { Readable } from "node:stream";
import { createBrotliDecompress } from "node:zlib";
import { z } from "zod";
import { DAY_MS, HOUR_MS, utcDate, utcHour } from "../schedule.js";
import {
  hourGap,
  toBook,
  type Book,
  type CoverageEvent,
  type Gap,
} from "./book.js";
import { checkDatum, checkSealed, type Gate } from "./gate.js";

const DAY_DIR = /^\d{4}-\d{2}-\d{2}$/;

/** A decimal string, as the kit's `isNumStr`. */
const numText = z
  .string()
  .refine((s) => s.length > 0 && Number.isFinite(Number(s)), "not a number");
const BookLevel = z.tuple([numText, numText]).rest(z.unknown());

/** MARKET-1's own schema of a book frame (M7): the documented fields it reads. */
export const BookFrameText = z.object({
  ch: z.string().regex(/^book::\d+$/),
  ts: z.number().int(),
  data: z.object({ b: z.array(BookLevel), a: z.array(BookLevel) }),
});

const Manifest = z.object({
  date: z.string(),
  files: z.array(
    z.object({ name: z.string(), sha256: z.string(), lines: z.number().int() }),
  ),
});

const CoverageText = z.object({ event: z.string() }).catchall(z.unknown());

export type Days = { folders: Set<string>; closed: Set<string> };

/** The day folders, refused past the cut while the gate is closed. */
export function recordingDays(gate: Gate, root: string, end: number): Days {
  checkSealed(gate, end, "the collector's recordings");
  const folders = new Set<string>();
  const closed = new Set<string>();
  if (!existsSync(root)) return { folders, closed };
  for (const d of readdirSync(root, { withFileTypes: true })) {
    if (!d.isDirectory() || !DAY_DIR.test(d.name)) continue;
    checkDatum(gate, Date.parse(`${d.name}T00:00:00Z`), "a recording day");
    folders.add(d.name);
    if (existsSync(path.join(root, d.name, "manifest.json")))
      closed.add(d.name);
  }
  return { folders, closed };
}

/** A day without a closed folder while a later day's is closed (M7). */
export const missingDay = (days: Days, date: string): boolean =>
  !days.closed.has(date) && [...days.closed].some((d) => d > date);

/** A leg at x is priced once the UTC day after x's is closed or missing (M7, F3). */
export function legFinal(days: Days, x: number): boolean {
  const next = utcDate(x + DAY_MS);
  return days.closed.has(next) || missingDay(days, next);
}

/** A closed day's check, kept once in MARKET-1's record (`days\<date>.json`). */
export const DayCheckSchema = z.object({
  date: z.string(),
  hours: z.array(
    z.object({
      hour: z.string(),
      state: z.enum(["ok", "missing", "differs", "unreadable"]),
      lines: z.number().int(),
      failed: z.number().int(),
    }),
  ),
  coverage: z.enum(["ok", "missing", "differs"]),
  coverageFailed: z.number().int(),
  events: z.array(
    z.object({ at: z.number(), event: z.string() }).catchall(z.unknown()),
  ),
  lines: z.number().int(),
  failed: z.number().int(),
  /** More than 1% of the day's book lines, and at least 10, fail the schema (M7, F18). */
  alarm: z.boolean(),
});
export type DayCheck = z.infer<typeof DayCheckSchema>;

const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");

/** M7's day alarm (F18): more than 1% of the day's book lines, and at least 10, fail the schema. */
export const dayAlarm = (lines: number, failed: number): boolean =>
  failed >= 10 && failed > 0.01 * lines;

/** A recording line: the receive time, a tab, the text (a JSON string when the text held a line break). */
export function splitLine(line: string): { recv: number; text: string } | null {
  const tab = line.indexOf("\t");
  if (tab <= 0) return null;
  const recv = Number(line.slice(0, tab));
  let text = line.slice(tab + 1);
  if (text.startsWith('"')) {
    try {
      text = JSON.parse(text) as string;
    } catch {
      return null;
    }
  }
  return Number.isInteger(recv) ? { recv, text } : null;
}

/** A book line's frame through MARKET-1's schema, or null when it fails. */
export function parseBookText(
  text: string,
): z.infer<typeof BookFrameText> | null {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }
  const r = BookFrameText.safeParse(json);
  return r.success ? r.data : null;
}

async function* brotliLines(bytes: Buffer): AsyncGenerator<string> {
  const lines = createInterface({
    input: Readable.from([bytes]).pipe(createBrotliDecompress()),
    crlfDelay: Infinity,
  });
  for await (const line of lines) if (line !== "") yield line;
}

const pad2 = (h: number) => String(h).padStart(2, "0");

/** Checks one closed day (M7, F18): its book hour files, its lines and its coverage. */
export async function checkDay(
  gate: Gate,
  root: string,
  date: string,
): Promise<DayCheck> {
  const dayStart = Date.parse(`${date}T00:00:00Z`);
  checkSealed(gate, dayStart + DAY_MS, "a recording day");
  checkDatum(gate, dayStart, "a recording day");
  const dir = path.join(root, date);
  const manifest = Manifest.parse(
    JSON.parse(readFileSync(path.join(dir, "manifest.json"), "utf8")),
  );
  const listed = new Map(manifest.files.map((f) => [f.name, f]));
  const hours: DayCheck["hours"] = [];
  for (let h = 0; h < 24; h++) {
    const name = `book-${pad2(h)}.jsonl.br`;
    const entry = listed.get(name);
    const file = path.join(dir, name);
    if (entry === undefined || !existsSync(file)) {
      hours.push({ hour: pad2(h), state: "missing", lines: 0, failed: 0 });
      continue;
    }
    const bytes = readFileSync(file);
    if (sha256(bytes) !== entry.sha256) {
      hours.push({ hour: pad2(h), state: "differs", lines: 0, failed: 0 });
      continue;
    }
    let lines = 0;
    let failed = 0;
    try {
      for await (const line of brotliLines(bytes)) {
        lines += 1;
        const split = splitLine(line);
        if (split === null || parseBookText(split.text) === null) failed += 1;
      }
      hours.push({ hour: pad2(h), state: "ok", lines, failed });
    } catch {
      hours.push({ hour: pad2(h), state: "unreadable", lines, failed });
    }
  }
  const cov = listed.get("coverage.jsonl");
  const covFile = path.join(dir, "coverage.jsonl");
  let coverage: DayCheck["coverage"] = "ok";
  let coverageFailed = 0;
  const events: CoverageEvent[] = [];
  if (cov === undefined || !existsSync(covFile)) coverage = "missing";
  else {
    const bytes = readFileSync(covFile);
    if (sha256(bytes) !== cov.sha256) coverage = "differs";
    else {
      for (const line of bytes.toString("utf8").split("\n")) {
        if (line === "") continue;
        const split = splitLine(line);
        let parsed: ReturnType<typeof CoverageText.safeParse> | null = null;
        if (split !== null) {
          try {
            parsed = CoverageText.safeParse(JSON.parse(split.text));
          } catch {
            parsed = null;
          }
        }
        if (split === null || parsed === null || !parsed.success) {
          coverageFailed += 1;
          continue;
        }
        events.push({ ...parsed.data, at: split.recv });
      }
    }
  }
  const lines = hours.reduce((s, h) => s + h.lines, 0);
  const failed = hours.reduce((s, h) => s + h.failed, 0);
  return {
    date,
    hours,
    coverage,
    coverageFailed,
    events,
    lines,
    failed,
    alarm: dayAlarm(lines, failed),
  };
}

/**
 * The gaps the days' checks and the folders give (M7): a book hour missing,
 * differing or unreadable; a day with the alarm, without a usable coverage,
 * or missing. The coverage events' own gaps come from `gapsOf`.
 */
export function dayGaps(days: Days, checks: readonly DayCheck[]): Gap[] {
  const gaps: Gap[] = [];
  const wholeDay = (date: string, cause: string) => {
    const start = Date.parse(`${date}T00:00:00Z`);
    for (let h = 0; h < 24; h++) gaps.push(hourGap(start + h * HOUR_MS, cause));
  };
  for (const c of checks) {
    if (c.alarm) wholeDay(c.date, "the day's book lines fail the schema");
    else if (c.coverage !== "ok" || c.coverageFailed > 0)
      wholeDay(c.date, "the day's coverage cannot be read");
    else
      for (const h of c.hours) {
        if (h.state !== "ok")
          gaps.push(
            hourGap(
              Date.parse(`${c.date}T${h.hour}:00:00Z`),
              `book hour file ${h.state}`,
            ),
          );
      }
  }
  const closed = [...days.closed].sort();
  const latest = closed.at(-1);
  if (latest !== undefined) {
    const first = closed[0]!;
    for (
      let d = Date.parse(`${first}T00:00:00Z`);
      utcDate(d) < latest;
      d += DAY_MS
    ) {
      if (missingDay(days, utcDate(d))) wholeDay(utcDate(d), "missing day");
    }
  }
  return gaps;
}

/** The book line of a market found for an instant: its frame's book and where it was read. */
export type FoundLine = {
  book: Book;
  recv: number;
  file: string;
  text: string;
};

/**
 * For each (market, x), the last book line of that market with ts ≤ x in
 * the closed days' hour files of x's hour, the hour before and the hour
 * after (M7). Files that differ from their manifest now are returned apart:
 * their hours are gaps.
 */
export async function booksAt(
  gate: Gate,
  root: string,
  days: Days,
  checks: ReadonlyMap<string, DayCheck>,
  needs: readonly { iid: number; x: number }[],
): Promise<{ found: Map<string, FoundLine>; changed: Gap[] }> {
  const byFile = new Map<string, { iid: number; x: number }[]>();
  for (const need of needs) {
    checkSealed(gate, need.x + 2 * HOUR_MS, "a book line");
    const hour = Math.floor(need.x / HOUR_MS) * HOUR_MS;
    for (const h of [hour - HOUR_MS, hour, hour + HOUR_MS]) {
      const date = utcDate(h);
      const check = checks.get(date);
      const state = check?.hours.find((e) => e.hour === utcHour(h))?.state;
      if (!days.closed.has(date) || state !== "ok") continue;
      const key = `${date}/book-${utcHour(h)}.jsonl.br`;
      const list = byFile.get(key) ?? [];
      list.push(need);
      byFile.set(key, list);
    }
  }
  const found = new Map<string, FoundLine>();
  const changed: Gap[] = [];
  for (const [key, list] of [...byFile].sort((a, b) =>
    a[0] < b[0] ? -1 : 1,
  )) {
    const [date, name] = key.split("/") as [string, string];
    checkDatum(gate, Date.parse(`${date}T00:00:00Z`), "a recording day");
    const bytes = readFileSync(path.join(root, date, name));
    const manifest = Manifest.parse(
      JSON.parse(readFileSync(path.join(root, date, "manifest.json"), "utf8")),
    );
    if (manifest.files.find((f) => f.name === name)?.sha256 !== sha256(bytes)) {
      changed.push(
        hourGap(
          Date.parse(`${date}T${name.slice(5, 7)}:00:00Z`),
          "book hour file changed since its check",
        ),
      );
      continue;
    }
    const markets = new Map<number, number[]>();
    for (const { iid, x } of list) {
      const xs = markets.get(iid) ?? [];
      xs.push(x);
      markets.set(iid, xs);
    }
    for await (const line of brotliLines(bytes)) {
      const split = splitLine(line);
      // The collector keeps the server's text as sent: JSON whitespace may sit around the colon.
      const m =
        split === null ? null : /"ch"\s*:\s*"book::(\d+)"/.exec(split.text);
      if (split === null || m === null) continue;
      const xs = markets.get(Number(m[1]));
      if (xs === undefined) continue;
      const iid = Number(m[1]);
      const frame = parseBookText(split.text);
      if (frame === null) continue;
      for (const x of xs) {
        if (frame.ts > x) continue;
        const k = `${iid}|${x}`;
        const best = found.get(k);
        if (best !== undefined && best.book.ts > frame.ts) continue;
        found.set(k, {
          book: toBook(frame.ts, frame.data.b, frame.data.a),
          recv: split.recv,
          file: key,
          text: split.text,
        });
      }
    }
  }
  return { found, changed };
}
