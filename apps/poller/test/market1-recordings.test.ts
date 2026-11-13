import {
  appendFileSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { brotliCompressSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bookSource, gapAt, gapsOf, hourGap } from "../src/market1/book.js";
import { SealedError } from "../src/market1/gate.js";
import {
  booksAt,
  checkDay,
  dayAlarm,
  dayGaps,
  legFinal,
  recordingDays,
  splitLine,
  type DayCheck,
  type Days,
} from "../src/market1/recordings.js";
import { CUT } from "../src/paper/instants.js";
import { HOUR_MS } from "../src/schedule.js";
import { at, record, writeDay, type Item } from "./market1-world.js";

const OPEN = { open: true };
const CLOSED = { open: false } as const;
const D1 = "2026-11-20";
const D2 = "2026-11-21";
const D4 = "2026-11-23";
const t = (day: string, hms: string) => at(`${day}T${hms}Z`);

/** Market 8's levels change each minute; market 10's never do. */
const levels8 = (ts: number): { bids: string[][]; asks: string[][] } => {
  const p = 99 + (Math.floor(ts / 60_000) % 7) / 10;
  return {
    bids: [[String(p), "5"]],
    asks: [[String(p + 1), "5"]],
  };
};
const LEVELS10 = { bids: [["49", "5"]], asks: [["51", "5"]] };

const quiet: [number | null, number, number][] = [
  [10, t(D1, "14:09:45"), t(D1, "14:20:00")],
  [null, t(D1, "15:30:01"), t(D1, "15:31:00")],
  [null, t(D1, "16:00:00"), t(D1, "16:05:00")],
  [null, t(D1, "17:00:00"), t(D1, "17:10:00")],
  // Frames resume after the 20:00:05 roll, so the held frame goes to hour 20 and hour 19 has no file.
  [null, t(D1, "19:00:00"), t(D1, "20:00:30")],
  [null, t(D1, "22:40:00"), t(D2, "00:10:00")],
  [10, t(D2, "05:00:00"), t(D2, "07:00:00")],
  [8, t(D2, "10:00:00"), t(D2, "10:30:00")],
  [10, t(D2, "23:59:31"), t("2026-11-22", "00:03:00")],
];
const isQuiet = (iid: number, ts: number) =>
  quiet.some(([q, a, b]) => (q === null || q === iid) && ts >= a && ts < b);

function world(): Item[] {
  const items: Item[] = [];
  for (let ts = t(D1, "12:00:00"); ts < t(D4, "02:00:00"); ts += 30_000) {
    for (const iid of [8, 10]) {
      if (isQuiet(iid, ts)) continue;
      if (iid === 8 && ts === t(D2, "12:00:00")) continue;
      if (iid === 8 && ts === t(D2, "13:00:00")) {
        items.push({
          kind: "frame",
          iid,
          ts,
          recv: ts + 150,
          bids: [["101", "5"]],
          asks: [["100", "5"]],
        });
        continue;
      }
      items.push({
        kind: "frame",
        iid,
        ts,
        recv: ts + 150,
        ...(iid === 8 ? levels8(ts) : LEVELS10),
      });
    }
  }
  // A frame of the hour's last second received in the next hour.
  items.push({
    kind: "frame",
    iid: 8,
    ts: t(D2, "11:59:59.900"),
    recv: t(D2, "12:00:00.400"),
    bids: [["77", "5"]],
    asks: [["78", "5"]],
  });
  // Twenty frames whose price MARKET-1's schema refuses, on D4.
  for (let k = 0; k < 20; k++) {
    const ts = t(D4, "00:10:15") + k * 60_000;
    items.push({
      kind: "frame",
      iid: 8,
      ts,
      recv: ts + 150,
      bids: [["x", "1"]],
      asks: [["100", "1"]],
    });
  }
  const c = (
    wall: number,
    event: Extract<Item, { kind: "coverage" }>["event"],
  ) => items.push({ kind: "coverage", at: wall, event });
  c(t(D1, "12:00:00"), {
    event: "process_start",
    pid: 1,
    lastHeartbeatAt: null,
  });
  c(t(D1, "14:10:00"), {
    event: "market_stall",
    iid: 10,
    lastFrameAt: t(D1, "14:09:30.150"),
  });
  c(t(D1, "14:20:00.150"), { event: "market_resume", iid: 10, gapMs: 1 });
  c(t(D1, "15:30:15"), {
    event: "ws_close",
    conn: "book-1",
    code: 4000,
    reason: "no frame for 15 s",
    cause: "watchdog",
    lastFrameAt: t(D1, "15:30:00.150"),
  });
  c(t(D1, "15:31:00.150"), {
    event: "ws_resumed",
    conn: "book-1",
    cause: "watchdog",
    lastFrameAt: t(D1, "15:30:00.150"),
    firstFrameAt: t(D1, "15:31:00.150"),
    gapMs: 60_000,
  });
  c(t(D1, "16:00:00"), { event: "process_stop", pid: 1, reason: "deploy" });
  c(t(D1, "16:05:00"), {
    event: "process_start",
    pid: 2,
    lastHeartbeatAt: t(D1, "15:59:58"),
  });
  c(t(D1, "17:00:00"), {
    event: "disk",
    disk: "recordings",
    path: "F:\\",
    state: "stop",
    freeGiB: 9,
    stops: "book and trade lines",
  });
  c(t(D1, "17:10:00"), {
    event: "disk",
    disk: "recordings",
    path: "F:\\",
    state: "warn",
    freeGiB: 12,
    stops: "book and trade lines",
  });
  c(t(D1, "18:30:00"), {
    event: "cut_line_dropped",
    file: `F:\\recordings\\${D1}\\book-18.jsonl`,
    bytes: 12,
  });
  // A crash at 22:40 (no stop written), the start after midnight.
  c(t(D2, "00:10:00"), {
    event: "process_start",
    pid: 3,
    lastHeartbeatAt: t(D1, "22:40:00"),
  });
  c(t(D2, "10:00:00"), {
    event: "sub_refused",
    conn: "book-1",
    channel: "book::8",
    error: "refused",
  });
  c(t(D2, "10:30:00"), { event: "ws_open", conn: "book-1", channels: 2 });
  // A stall written after midnight, of a market quiet since 23:59:30.
  c(t("2026-11-22", "00:00:05"), {
    event: "market_stall",
    iid: 10,
    lastFrameAt: t(D2, "23:59:00.150"),
  });
  c(t("2026-11-22", "00:03:00.150"), {
    event: "market_resume",
    iid: 10,
    gapMs: 1,
  });
  return items;
}

let root: string;
let days: Days;
let checks: Map<string, DayCheck>;
const handWritten: string[] = [];

beforeAll(async () => {
  root = mkdtempSync(path.join(tmpdir(), "market1-recordings-"));
  await record(root, world(), t(D1, "12:00:00"), t("2026-11-24", "00:10:00"));
  // A book hour file changed after its manifest was written.
  appendFileSync(path.join(root, D1, "book-20.jsonl.br"), "x");
  days = recordingDays(OPEN, root, t("2026-11-25", "00:00:00"));
  checks = new Map();
  for (const d of [...days.closed].sort())
    checks.set(d, await checkDay(OPEN, root, d));
}, 120_000);
afterAll(() => {
  for (const d of [root, ...handWritten])
    rmSync(d, { recursive: true, force: true });
});

/** An empty folder for days written by hand, removed after the file's tests. */
function handRoot(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "market1-days-"));
  handWritten.push(dir);
  return dir;
}

describe("the recordings as MARKET-1 reads them (M7), written by the collector's own Recorder and BookSampler", () => {
  it("lists the closed days; a leg waits for the day after its own (F3)", () => {
    expect([...days.folders].sort()).toEqual([D1, D2, "2026-11-22", D4]);
    expect([...days.closed].sort()).toEqual([D1, D2, "2026-11-22", D4]);
    expect(legFinal(days, t("2026-11-22", "12:00:00"))).toBe(true);
    expect(legFinal(days, t(D4, "01:00:00"))).toBe(false);
    // Before D2 closes, a leg of D1's last hours is pending.
    const early: Days = {
      folders: new Set([D1, D2]),
      closed: new Set([D1]),
    };
    expect(legFinal(early, t(D1, "22:50:00"))).toBe(false);
    // A day without a folder while a later day is closed is missing: final.
    const holed: Days = {
      folders: new Set([D1, "2026-11-22"]),
      closed: new Set([D1, "2026-11-22"]),
    };
    expect(legFinal(holed, t(D1, "22:50:00"))).toBe(true);
  });

  it("checks each closed day: hour files, lines through MARKET-1's schema, the alarm (F18), the coverage", () => {
    const d1 = checks.get(D1)!;
    const state = (c: DayCheck, h: string) =>
      c.hours.find((x) => x.hour === h)!.state;
    expect(state(d1, "11")).toBe("missing");
    expect(state(d1, "12")).toBe("ok");
    expect(state(d1, "19")).toBe("missing");
    expect(state(d1, "20")).toBe("differs");
    expect(state(d1, "23")).toBe("missing");
    expect(d1.failed).toBe(0);
    expect(d1.alarm).toBe(false);
    expect(d1.coverage).toBe("ok");
    expect(d1.events.map((e) => e.event)).toEqual([
      "process_start",
      "market_stall",
      "market_resume",
      "ws_close",
      "ws_resumed",
      "process_stop",
      "process_start",
      "disk",
      "disk",
      "cut_line_dropped",
    ]);
    // More than 1% and at least 10 lines: 9 of 100 is 9%, but under the floor.
    expect([
      dayAlarm(999, 10),
      dayAlarm(1_000, 10),
      dayAlarm(900, 9),
      dayAlarm(100, 9),
    ]).toEqual([true, false, false, false]);
    const d4 = checks.get(D4)!;
    expect(d4.failed).toBe(20);
    expect(d4.alarm).toBe(true);
    expect(d4.lines).toBeGreaterThan(20);
    expect(d4.lines).toBeLessThan(2000);
  });

  it("finds the book at each leg's instant, live or not, and every gap's cause", async () => {
    const events = [...checks.values()]
      .flatMap((c) => c.events)
      .sort((a, b) => a.at - b.at);
    const legs: [number, number, string][] = [
      [10, t(D1, "14:15:00"), "gap market stall"],
      [8, t(D1, "15:30:30"), "gap book connection closed"],
      [8, t(D1, "16:02:00"), "gap collector stopped"],
      [8, t(D1, "17:05:00"), "gap recordings disk full"],
      [8, t(D1, "18:20:00"), "gap book file cut_line_dropped"],
      [8, t(D1, "19:30:00"), "gap book hour file missing"],
      [8, t(D1, "20:30:00"), "gap book hour file differs"],
      [8, t(D1, "22:50:00"), "gap collector restarted"],
      [8, t(D2, "04:45:00"), `book ${levels8(t(D2, "04:45:00")).bids[0]![0]}`],
      [10, t(D2, "04:45:00"), "book 49"],
      // The 04:00 line is in the hour before 05:01:30's, 61.5 minutes old; at 06:30 none is in the hours read.
      [10, t(D2, "05:01:30"), "stale book"],
      [10, t(D2, "06:30:00"), "no book line"],
      [8, t(D2, "09:00:20"), `book ${levels8(t(D2, "09:00:00")).bids[0]![0]}`],
      [8, t(D2, "10:15:00"), "gap book channel refused"],
      [10, t(D2, "10:15:00"), "book 49"],
      [8, t(D2, "11:59:59.950"), "book 77"],
      [8, t(D2, "13:00:10"), "book not usable"],
      [10, t(D2, "23:59:55"), "gap market stall"],
      [8, t(D4, "01:30:00"), "gap the day's book lines fail the schema"],
    ];
    const { found, changed } = await booksAt(
      OPEN,
      root,
      days,
      checks,
      legs.map(([iid, x]) => ({ iid, x })),
    );
    expect(changed).toEqual([]);
    const gaps = [...gapsOf(events), ...dayGaps(days, [...checks.values()])];
    const got = legs.map(([iid, x]) => {
      const line = found.get(`${iid}|${x}`) ?? null;
      const s = bookSource(line?.book ?? null, gapAt(gaps, iid, x), x);
      return s.source === "book"
        ? `book ${s.book.bids[0]![0]}`
        : s.why === "gap"
          ? `gap ${s.gap}`
          : s.why;
    });
    expect(got).toEqual(legs.map((l) => l[2]));
    // The frame of 11:59:59.9 was filed in the next hour's file by its receive time.
    expect(found.get(`8|${t(D2, "11:59:59.950")}`)).toMatchObject({
      file: `${D2}/book-12.jsonl.br`,
      recv: t(D2, "12:00:00.400"),
    });
    // An unchanged book is written only at each hour's first sample.
    expect(found.get(`10|${t(D2, "04:45:00")}`)?.book.ts).toBe(
      t(D2, "04:00:00"),
    );
  });

  it("refuses the recordings past the cut with the gate closed", async () => {
    expect(() => recordingDays(CLOSED, root, CUT + 1)).toThrow(SealedError);
    expect(() => recordingDays(CLOSED, root, CUT)).toThrow(SealedError);
    await expect(checkDay(CLOSED, root, D1)).rejects.toThrow(SealedError);
    await expect(
      booksAt(CLOSED, root, days, checks, [{ iid: 8, x: t(D2, "04:45:00") }]),
    ).rejects.toThrow(SealedError);
  });

  it("reads a line's text written as a JSON string when it held a line break", () => {
    expect(splitLine('12\t{"a":1}')).toEqual({ recv: 12, text: '{"a":1}' });
    expect(splitLine('12\t"{\\"a\\":\\n1}"')).toEqual({
      recv: 12,
      text: '{"a":\n1}',
    });
    expect(splitLine("x\t{}")).toBeNull();
    expect(splitLine("{}")).toBeNull();
  });
});

describe("days written by hand (M7)", () => {
  const END = t("2026-12-01", "00:00:00");

  it("finds a book line whose text has JSON whitespace around the colon, as the server may send it", async () => {
    const dir = handRoot();
    const x = t(D1, "10:30:00");
    const spaced = `{"ch" : "book::8", "ts" : ${x - 5_000}, "data" : {"b" : [["99", "5"]], "a" : [["101", "5"]]}}`;
    writeDay(dir, D1, { "10": [`${x - 4_900}\t${spaced}`] });
    writeDay(dir, D2, {});
    const closed = recordingDays(OPEN, dir, END);
    const check = await checkDay(OPEN, dir, D1);
    expect(check.hours.find((h) => h.hour === "10")).toEqual({
      hour: "10",
      state: "ok",
      lines: 1,
      failed: 0,
    });
    const { found, changed } = await booksAt(
      OPEN,
      dir,
      closed,
      new Map([[D1, check]]),
      [{ iid: 8, x }],
    );
    expect(changed).toEqual([]);
    expect(found.get(`8|${x}`)).toEqual({
      book: { ts: x - 5_000, bids: [[99, 5]], asks: [[101, 5]] },
      recv: x - 4_900,
      file: `${D1}/book-10.jsonl.br`,
      text: spaced,
    });
  });

  const frame8 = (ts: number, bid: string) =>
    JSON.stringify({
      ch: "book::8",
      ts,
      data: { b: [[bid, "5"]], a: [["101", "5"]] },
    });
  const wholeDay = (date: string, cause: string) =>
    Array.from({ length: 24 }, (_, h) =>
      hourGap(t(date, "00:00:00") + h * HOUR_MS, cause),
    );
  const checkAll = async (dir: string, dates: readonly string[]) => {
    const out = new Map<string, DayCheck>();
    for (const d of dates) out.set(d, await checkDay(OPEN, dir, d));
    return out;
  };

  it("makes a whole day a gap when its coverage differs from its manifest, is missing or unlisted, or holds a line that does not parse", async () => {
    const dir = handRoot();
    const dates = [D1, D2, "2026-11-22", D4, "2026-11-24"];
    const pause = (d: string) =>
      `${t(d, "02:35:00")}\t{"event":"rest_pause","state":"start"}`;
    for (const d of dates)
      writeDay(dir, d, {}, d === D2 ? ["not a line", pause(d)] : [pause(d)]);
    appendFileSync(path.join(dir, D1, "coverage.jsonl"), "x\n");
    rmSync(path.join(dir, "2026-11-22", "coverage.jsonl"));
    const manifest = path.join(dir, D4, "manifest.json");
    const listed = JSON.parse(readFileSync(manifest, "utf8")) as {
      files: { name: string }[];
    };
    listed.files = listed.files.filter((f) => f.name !== "coverage.jsonl");
    writeFileSync(manifest, JSON.stringify(listed));
    const checks = await checkAll(dir, dates);
    expect(
      dates.map((d) => {
        const c = checks.get(d)!;
        return [c.coverage, c.coverageFailed, c.events];
      }),
    ).toEqual([
      ["differs", 0, []],
      [
        "ok",
        1,
        [{ at: t(D2, "02:35:00"), event: "rest_pause", state: "start" }],
      ],
      ["missing", 0, []],
      ["missing", 0, []],
      [
        "ok",
        0,
        [
          {
            at: t("2026-11-24", "02:35:00"),
            event: "rest_pause",
            state: "start",
          },
        ],
      ],
    ]);
    const unread = "the day's coverage cannot be read";
    expect(
      dayGaps(recordingDays(OPEN, dir, END), [...checks.values()]),
    ).toEqual([
      ...wholeDay(D1, unread),
      ...wholeDay(D2, unread),
      ...wholeDay("2026-11-22", unread),
      ...wholeDay(D4, unread),
      // A readable coverage leaves the hours without a book file.
      ...wholeDay("2026-11-24", "book hour file missing"),
    ]);
  });

  it("calls a book hour file that matches its manifest but cannot be decompressed unreadable: its hour is a gap", async () => {
    const dir = handRoot();
    const line = `${t(D1, "10:00:01")}\t${frame8(t(D1, "10:00:00.900"), "99")}`;
    const whole = brotliCompressSync(`${line}\n`.repeat(2_000));
    writeDay(dir, D1, {
      "10": [line],
      "11": whole.subarray(0, whole.length >> 1),
    });
    const check = await checkDay(OPEN, dir, D1);
    expect(check.hours.find((h) => h.hour === "10")).toEqual({
      hour: "10",
      state: "ok",
      lines: 1,
      failed: 0,
    });
    expect(check.hours.find((h) => h.hour === "11")!.state).toBe("unreadable");
    expect(dayGaps(recordingDays(OPEN, dir, END), [check])).toContainEqual(
      hourGap(t(D1, "11:00:00"), "book hour file unreadable"),
    );
  });

  it("never reads a book hour file that changed after its day was checked: its hour is a gap", async () => {
    const dir = handRoot();
    const x = t(D1, "10:30:00");
    writeDay(dir, D1, { "10": [`${x - 4_900}\t${frame8(x - 5_000, "99")}`] });
    writeDay(dir, D2, {});
    const checks = await checkAll(dir, [D1, D2]);
    appendFileSync(path.join(dir, D1, "book-10.jsonl.br"), "x");
    const { found, changed } = await booksAt(
      OPEN,
      dir,
      recordingDays(OPEN, dir, END),
      checks,
      [{ iid: 8, x }],
    );
    expect(found.size).toBe(0);
    expect(changed).toEqual([
      hourGap(t(D1, "10:00:00"), "book hour file changed since its check"),
    ]);
  });

  it("makes a day without a closed folder between two closed days a gap of its 24 hours", () => {
    const dir = handRoot();
    writeDay(dir, D1, {});
    writeDay(dir, "2026-11-22", {});
    expect(dayGaps(recordingDays(OPEN, dir, END), [])).toEqual(
      wholeDay(D2, "missing day"),
    );
  });

  it("takes, of a market's lines in the hours read, the one with the latest ts, whichever file holds it", async () => {
    const dir = handRoot();
    const x = t(D1, "11:00:10");
    // Hour 10's file holds the newer frame; hour 11's, by its receive time, an older one.
    writeDay(dir, D1, {
      "10": [
        `${t(D1, "10:59:59.600")}\t${frame8(t(D1, "10:59:59.500"), "77")}`,
      ],
      "11": [
        `${t(D1, "11:00:00.300")}\t${frame8(t(D1, "10:59:58.000"), "55")}`,
      ],
    });
    writeDay(dir, D2, {});
    const { found } = await booksAt(
      OPEN,
      dir,
      recordingDays(OPEN, dir, END),
      await checkAll(dir, [D1, D2]),
      [{ iid: 8, x }],
    );
    expect(found.get(`8|${x}`)).toMatchObject({
      book: { ts: t(D1, "10:59:59.500"), bids: [[77, 5]], asks: [[101, 5]] },
      file: `${D1}/book-10.jsonl.br`,
    });
  });
});
