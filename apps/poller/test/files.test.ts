import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { pino } from "pino";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LineScan,
  Recorder,
  formatLine,
  isClosedHourFile,
  truncateCutLine,
} from "../src/store/files.js";
import { utcDate, utcHour } from "../src/schedule.js";

const at = (iso: string) => Date.parse(iso);
const log = pino({ level: "silent" });
let root: string;

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "poller-files-"));
});
afterEach(() => {
  vi.useRealTimers();
});

const read = (...parts: string[]) => readFileSync(path.join(root, ...parts));
const lines = (text: string) => text.split("\n").filter((l) => l !== "");

describe("formatLine", () => {
  it("writes the receive time, a tab and the text", () => {
    expect(formatLine(1_794_272_400_003, '{"ch":"book::1"}')).toBe(
      '1794272400003\t{"ch":"book::1"}\n',
    );
  });

  it("writes a text holding a line break as a JSON string, so it stays one line", () => {
    const line = formatLine(5, "<html>\r\n</html>");
    expect(line).toBe('5\t"<html>\\r\\n</html>"\n');
    expect(JSON.parse(line.slice(2))).toBe("<html>\r\n</html>");
  });
});

describe("LineScan", () => {
  it("counts lines and the smallest and largest time across chunk edges", () => {
    const bytes = Buffer.from(
      "1794272400500\ta\n1794272400900\tb\tc\n1794272400100\td\n",
    );
    for (let size = 1; size <= bytes.length; size += 1) {
      const scan = new LineScan();
      for (let i = 0; i < bytes.length; i += size) {
        scan.push(bytes.subarray(i, i + size));
      }
      expect(scan.result()).toEqual({
        lines: 3,
        first: 1_794_272_400_100,
        last: 1_794_272_400_900,
      });
    }
  });
});

describe("isClosedHourFile", () => {
  it("lets a scan compress only a plain hour file before the open hour with no stream on it", () => {
    const open = at("2026-11-10T14:00:00Z");
    expect(isClosedHourFile("book-13.jsonl", "2026-11-10", open, false)).toBe(
      true,
    );
    expect(isClosedHourFile("book-13.jsonl", "2026-11-10", open, true)).toBe(
      false,
    );
    expect(isClosedHourFile("book-14.jsonl", "2026-11-10", open, false)).toBe(
      false,
    );
    expect(isClosedHourFile("rest-23.jsonl", "2026-11-09", open, false)).toBe(
      true,
    );
    expect(
      isClosedHourFile("book-13.jsonl.br", "2026-11-10", open, false),
    ).toBe(false);
    expect(isClosedHourFile("coverage.jsonl", "2026-11-09", open, false)).toBe(
      false,
    );
  });
});

describe("truncateCutLine", () => {
  it("cuts back to the last line break and says how much it dropped", async () => {
    const file = path.join(root, "a.jsonl");
    writeFileSync(file, "1\tx\n2\ty\n3\tcu");
    expect(await truncateCutLine(file)).toBe(4);
    expect(readFileSync(file, "utf8")).toBe("1\tx\n2\ty\n");
    expect(await truncateCutLine(file)).toBe(0);
  });

  it("empties a file with no whole line, and ignores a missing one", async () => {
    const file = path.join(root, "b.jsonl");
    writeFileSync(file, "12345");
    expect(await truncateCutLine(file)).toBe(5);
    expect(readFileSync(file, "utf8")).toBe("");
    expect(await truncateCutLine(path.join(root, "none.jsonl"))).toBe(0);
  });
});

describe("Recorder", () => {
  it("compresses the hour after it ends, checks it, deletes the plain file, and sends a late line to the open hour", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(at("2026-11-10T13:59:50Z"));
    const recorder = new Recorder(root, log);
    await recorder.start();
    recorder.write("book", at("2026-11-10T13:59:50.100Z"), '{"n":1}');
    recorder.write("book", at("2026-11-10T13:59:51.100Z"), '{"n":2}');
    recorder.write(
      "rest",
      at("2026-11-10T13:59:52Z"),
      '{"path":"/v1/info/tickers"}\t[]',
    );
    await vi.advanceTimersByTimeAsync(12_000);
    recorder.write("book", at("2026-11-10T14:00:01Z"), '{"n":3}');
    await vi.advanceTimersByTimeAsync(5_000);
    recorder.write("book", at("2026-11-10T13:59:59.900Z"), '{"n":"late"}');
    await recorder.close();

    const day = "2026-11-10";
    expect(existsSync(path.join(root, day, "book-13.jsonl"))).toBe(false);
    expect(
      lines(brotliDecompressSync(read(day, "book-13.jsonl.br")).toString()),
    ).toEqual([
      `${at("2026-11-10T13:59:50.100Z")}\t{"n":1}`,
      `${at("2026-11-10T13:59:51.100Z")}\t{"n":2}`,
    ]);
    expect(existsSync(path.join(root, day, "rest-13.jsonl.br"))).toBe(true);
    expect(lines(read(day, "book-14.jsonl").toString())).toEqual([
      `${at("2026-11-10T14:00:01Z")}\t{"n":3}`,
      `${at("2026-11-10T13:59:59.900Z")}\t{"n":"late"}`,
    ]);
    expect(recorder.counts).toMatchObject({
      lines: { book: 4, rest: 1, trades: 0, rejected: 0 },
      late: 1,
      dropped: 0,
      compressed: 2,
    });
    expect(
      readdirSync(path.join(root, day)).some((n) => n.endsWith(".tmp")),
    ).toBe(false);
  });

  it("writes a closed day's manifest: each file's size, hash, lines, first and last time", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(at("2026-11-10T23:59:58Z"));
    const recorder = new Recorder(root, log);
    await recorder.start();
    recorder.write("book", at("2026-11-10T23:59:58.100Z"), '{"n":1}');
    recorder.write("book", at("2026-11-10T23:59:58.900Z"), '{"n":2}');
    recorder.write("trades", at("2026-11-10T23:59:58.500Z"), '{"t":1}');
    recorder.coverage({ event: "rest_pause", state: "end" });
    await vi.advanceTimersByTimeAsync(10_000);
    await recorder.close();

    const day = "2026-11-10";
    const manifest = JSON.parse(read(day, "manifest.json").toString()) as {
      date: string;
      files: {
        name: string;
        bytes: number;
        sha256: string;
        lines: number;
        first: number;
        last: number;
      }[];
    };
    expect(manifest.date).toBe(day);
    expect(manifest.files.map((f) => f.name)).toEqual([
      "book-23.jsonl.br",
      "coverage.jsonl",
      "trades-23.jsonl.br",
    ]);
    const book = manifest.files[0]!;
    expect(book).toMatchObject({
      lines: 2,
      first: at("2026-11-10T23:59:58.100Z"),
      last: at("2026-11-10T23:59:58.900Z"),
      bytes: read(day, "book-23.jsonl.br").length,
      sha256: createHash("sha256")
        .update(read(day, "book-23.jsonl.br"))
        .digest("hex"),
    });
    expect(manifest.files[1]).toMatchObject({
      lines: 1,
      first: at("2026-11-10T23:59:58Z"),
    });
    expect(existsSync(path.join(root, "2026-11-11", "manifest.json"))).toBe(
      false,
    );
  });

  it("leaves a file whose stream is open or closing to the roll, even when the day turns during the start-up scan", async () => {
    // A large hour, written just before the day turns, with the start-up scan still queued.
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(at("2026-11-10T23:59:58Z"));
    const recorder = new Recorder(root, log);
    await recorder.start();
    const body = `{"pad":"${"x".repeat(180)}"}`;
    const count = 100_000;
    for (let i = 0; i < count; i += 1) {
      recorder.write("book", at("2026-11-10T23:59:58.100Z"), body);
    }
    recorder.write("trades", at("2026-11-10T23:59:58.500Z"), '{"t":1}');
    await vi.advanceTimersByTimeAsync(10_000);
    await recorder.close();

    const day = "2026-11-10";
    const manifest = JSON.parse(read(day, "manifest.json").toString()) as {
      files: { name: string; lines: number }[];
    };
    expect(manifest.files.map((f) => [f.name, f.lines])).toEqual([
      ["book-23.jsonl.br", count],
      ["trades-23.jsonl.br", 1],
    ]);
  }, 60_000);

  it("at start, drops a cut last line, compresses an earlier run's closed hours, deletes a half-written .br and builds the missing manifest", async () => {
    const day = path.join(root, "2026-11-09");
    mkdirSync(day, { recursive: true });
    writeFileSync(path.join(day, "rest-09.jsonl"), "1\ta\n2\tb\n3\tcut");
    writeFileSync(path.join(day, "book-09.jsonl.br.tmp"), "half");
    const today = path.join(root, "2026-11-10");
    mkdirSync(today, { recursive: true });
    writeFileSync(path.join(today, "trades-12.jsonl"), "4\tc\n5\tcu");

    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(at("2026-11-10T12:30:00Z"));
    const recorder = new Recorder(root, log);
    await recorder.start();
    recorder.write("trades", 6, "d");
    await recorder.close();

    expect(readdirSync(day).sort()).toEqual([
      "manifest.json",
      "rest-09.jsonl.br",
    ]);
    expect(
      lines(
        brotliDecompressSync(read("2026-11-09", "rest-09.jsonl.br")).toString(),
      ),
    ).toEqual(["1\ta", "2\tb"]);
    expect(read("2026-11-10", "trades-12.jsonl").toString()).toBe(
      "4\tc\n6\td\n",
    );
    const coverage = lines(read("2026-11-10", "coverage.jsonl").toString()).map(
      (l) =>
        JSON.parse(l.slice(l.indexOf("\t") + 1)) as {
          event: string;
          bytes: number;
        },
    );
    // The open hour's file is repaired before the start returns; the closed hour's after.
    expect(coverage).toEqual([
      expect.objectContaining({ event: "cut_line_dropped", bytes: 4 }),
      expect.objectContaining({ event: "cut_line_dropped", bytes: 5 }),
    ]);
  });
});

describe("a Recorder without its folder (the recordings' disk missing)", () => {
  it("starts all the same, and drops and counts every line", async () => {
    // A folder cannot be made under a file: as a missing disk, every mkdir fails.
    const blocker = path.join(root, "disk");
    writeFileSync(blocker, "");
    const recorder = new Recorder(path.join(blocker, "recordings"), log);
    await recorder.start();
    const now = Date.now();
    recorder.write("book", now, '{"n":1}');
    recorder.write("rest", now, '{"n":2}');
    recorder.write("rest", now, '{"n":3}');
    recorder.coverage({ event: "rest_pause", state: "start" });
    await recorder.close();
    expect(recorder.counts.dropped).toBe(3);
    expect(recorder.counts.lines).toEqual({
      book: 0,
      trades: 0,
      rest: 0,
      rejected: 0,
    });
  });
});

describe("a pause of the stream files (the disk check)", () => {
  it("drops and counts book and trade lines while paused, keeps the replies, and stores again after", async () => {
    const recorder = new Recorder(root, log);
    await recorder.start();
    const now = Date.now();
    recorder.pauseStreams(true);
    recorder.write("book", now, '{"n":1}');
    recorder.write("trades", now, '{"n":2}');
    recorder.write("rest", now, '{"n":3}');
    recorder.pauseStreams(false);
    recorder.write("book", now, '{"n":4}');
    await recorder.close();
    expect(recorder.counts.notStored).toBe(2);
    expect(recorder.counts.lines).toEqual({
      book: 1,
      trades: 0,
      rest: 1,
      rejected: 0,
    });
    const [day, hour] = [utcDate(now), utcHour(now)];
    expect(lines(read(day, `book-${hour}.jsonl`).toString())).toEqual([
      `${now}\t{"n":4}`,
    ]);
    expect(existsSync(path.join(root, day, `trades-${hour}.jsonl`))).toBe(
      false,
    );
    expect(lines(read(day, `rest-${hour}.jsonl`).toString())).toEqual([
      `${now}\t{"n":3}`,
    ]);
  });
});
