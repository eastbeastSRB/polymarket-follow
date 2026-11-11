/**
 * The recordings: `<root>/<UTC date>/<kind>-<HH>.jsonl`, one line per frame
 * or reply — our receive time, a tab, the text as received (COLLECTOR-PLAN
 * §1.2 and §1.6, "What later phases build on" 1). The open hour is plain
 * text; after it ends each file is Brotli-compressed, checked by decompressing
 * and comparing hashes, and only then is the plain file deleted. A closed day
 * gets `manifest.json`. Everything heavy runs as streams in Node's thread pool.
 */
import { createHash, type Hash } from "node:crypto";
import {
  appendFileSync,
  createReadStream,
  createWriteStream,
  mkdirSync,
  openSync,
  type WriteStream,
} from "node:fs";
import { open, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import zlib from "node:zlib";
import type { CoverageEvent } from "../health/coverage.js";
import type { Logger } from "../log.js";
import { HOUR_MS, hourStart, utcDate, utcHour } from "../schedule.js";

export type Kind = "book" | "trades" | "rest" | "rejected";
const KINDS: readonly Kind[] = ["book", "trades", "rest", "rejected"];

const HOUR_FILE = /^(book|trades|rest|rejected)-(\d\d)\.jsonl$/;
const DAY_DIR = /^\d{4}-\d{2}-\d{2}$/;
const COVERAGE_FILE = "coverage.jsonl";
const MANIFEST_FILE = "manifest.json";
/** Lines of the hour just ended may arrive this late (the book sampler holds one second). */
const ROLL_GRACE_MS = 5_000;
const BROTLI_QUALITY = 5;

/**
 * A plain hour file a scan may compress: its hour is before the open one and
 * no stream is open or still closing on it (one queued before a roll can
 * meet a file whose stream is still flushing).
 */
export function isClosedHourFile(
  name: string,
  day: string,
  openFromMs: number,
  busy: boolean,
): boolean {
  const hour = HOUR_FILE.exec(name)?.[2];
  return (
    hour !== undefined &&
    !busy &&
    Date.parse(`${day}T${hour}:00:00Z`) < openFromMs
  );
}

/** A text holding a line break is written as a JSON string, so a line is always one frame or reply. */
export function formatLine(recvMs: number, text: string): string {
  return `${recvMs}\t${/[\r\n]/.test(text) ? JSON.stringify(text) : text}\n`;
}

export type ManifestEntry = {
  name: string;
  bytes: number;
  sha256: string;
  lines: number;
  first: number | null;
  last: number | null;
};

type OpenFile = { hourMs: number; stream: WriteStream | null };

export class Recorder {
  readonly counts = {
    lines: { book: 0, trades: 0, rest: 0, rejected: 0 } satisfies Record<
      Kind,
      number
    >,
    late: 0,
    dropped: 0,
    compressed: 0,
    /** Stream lines not stored while the recordings' disk is low. */
    notStored: 0,
  };
  private streamsPaused = false;
  private readonly files = new Map<string, OpenFile>();
  /** Files whose stream is open or still closing: no scan compresses one. */
  private readonly busy = new Set<string>();
  private readonly entries = new Map<string, ManifestEntry[]>();
  private openFromMs = 0;
  private rollTimer: NodeJS.Timeout | undefined;
  private work: Promise<void> = Promise.resolve();

  constructor(
    private readonly root: string,
    private readonly log: Logger,
  ) {}

  /**
   * Repairs the open hour's files an earlier run left, then starts the hourly
   * roll; that run's closed hours are compressed in the background. Without
   * its folder (the recordings' disk missing) the start goes on: lines are
   * dropped and counted until the disk is back (COLLECTOR-PLAN §1.7).
   */
  async start(): Promise<void> {
    this.openFromMs = hourStart(Date.now());
    try {
      mkdirSync(this.root, { recursive: true });
      for (const kind of KINDS) {
        await this.dropCutLine(this.fileOf(kind, this.openFromMs));
      }
    } catch (err) {
      this.log.error({ err }, "recordings folder not ready; lines are dropped");
    }
    this.enqueue(() => this.finishClosedHours()).catch((err: unknown) =>
      this.log.error({ err }, "earlier hours not finished"),
    );
    this.scheduleRoll();
  }

  /** While the recordings' disk is low (health/disk.ts) book and trade lines are not stored; replies still are. */
  pauseStreams(paused: boolean): void {
    this.streamsPaused = paused;
  }

  write(kind: Kind, recvMs: number, text: string): void {
    if (this.streamsPaused && (kind === "book" || kind === "trades")) {
      this.counts.notStored += 1;
      return;
    }
    const ownHour = hourStart(recvMs);
    const hourMs = Math.max(ownHour, this.openFromMs);
    if (hourMs !== ownHour) this.counts.late += 1;
    const stream = this.streamFor(this.fileOf(kind, hourMs), hourMs);
    if (stream === null) {
      this.counts.dropped += 1;
      return;
    }
    stream.write(formatLine(recvMs, text));
    this.counts.lines[kind] += 1;
  }

  private fileOf(kind: Kind, hourMs: number): string {
    return path.join(
      this.root,
      utcDate(hourMs),
      `${kind}-${utcHour(hourMs)}.jsonl`,
    );
  }

  coverage(event: CoverageEvent): void {
    const now = Date.now();
    const dir = path.join(this.root, utcDate(now));
    try {
      mkdirSync(dir, { recursive: true });
      appendFileSync(
        path.join(dir, COVERAGE_FILE),
        formatLine(now, JSON.stringify(event)),
      );
    } catch (err) {
      this.log.error({ err, event }, "coverage line not written");
    }
  }

  /** Closes the open files (they stay plain; the next start compresses them) and waits for running work. */
  async close(): Promise<void> {
    clearTimeout(this.rollTimer);
    const streams = [...this.files.values()].flatMap((f) =>
      f.stream ? [f.stream] : [],
    );
    this.files.clear();
    await Promise.all(streams.map(endStream));
    await this.work;
  }

  private streamFor(file: string, hourMs: number): WriteStream | null {
    const known = this.files.get(file);
    if (known) return known.stream;
    const opened: OpenFile = { hourMs, stream: null };
    this.files.set(file, opened);
    try {
      mkdirSync(path.dirname(file), { recursive: true });
      // Created now, not when the stream gets round to it, so a scan never misses it.
      const stream = createWriteStream(file, { fd: openSync(file, "a") });
      this.busy.add(file);
      stream.on("close", () => this.busy.delete(file));
      stream.on("error", (err) => {
        opened.stream = null;
        this.log.error({ err, file }, "recording file failed");
        this.coverage({ event: "write_failed", file, reason: String(err) });
      });
      opened.stream = stream;
    } catch (err) {
      this.log.error({ err, file }, "recording file not opened");
      this.coverage({ event: "write_failed", file, reason: String(err) });
    }
    return opened.stream;
  }

  private scheduleRoll(): void {
    const at = this.openFromMs + HOUR_MS + ROLL_GRACE_MS;
    this.rollTimer = setTimeout(
      () => this.roll(),
      Math.max(0, at - Date.now()),
    );
  }

  private roll(): void {
    this.openFromMs = Math.max(
      this.openFromMs + HOUR_MS,
      hourStart(Date.now() - ROLL_GRACE_MS),
    );
    const closing: Promise<void>[] = [];
    for (const [file, f] of this.files) {
      if (f.hourMs >= this.openFromMs) continue;
      this.files.delete(file);
      if (f.stream) closing.push(endStream(f.stream));
    }
    const closed = Promise.all(closing);
    this.enqueue(async () => {
      await closed;
      await this.finishClosedHours();
    }).catch((err: unknown) => this.log.error({ err }, "hourly roll failed"));
    this.scheduleRoll();
  }

  private enqueue(job: () => Promise<void>): Promise<void> {
    const run = this.work.then(job);
    this.work = run.catch(() => undefined);
    return run;
  }

  /** Every plain hour file before the open hour: compressed and checked; then the closed days' manifests. */
  private async finishClosedHours(): Promise<void> {
    for (const day of await listDays(this.root)) {
      const dir = path.join(this.root, day);
      for (const name of await readdir(dir)) {
        const file = path.join(dir, name);
        if (name.endsWith(".br.tmp")) {
          await rm(file, { force: true });
          continue;
        }
        if (
          !isClosedHourFile(name, day, this.openFromMs, this.busy.has(file))
        ) {
          continue;
        }
        await this.dropCutLine(file);
        try {
          const entry = await compressHourFile(file);
          this.addEntry(day, entry);
          this.counts.compressed += 1;
          this.log.info(
            { file: entry.name, day, bytes: entry.bytes, lines: entry.lines },
            "hour file compressed and checked",
          );
        } catch (err) {
          this.log.warn(
            { err, file },
            "hour file left plain; retried next hour",
          );
          this.coverage({
            event: "compression_failed",
            file,
            reason: String(err),
          });
        }
      }
    }
    await this.writeDueManifests();
  }

  private addEntry(day: string, entry: ManifestEntry): void {
    const list = this.entries.get(day) ?? [];
    this.entries.set(day, [
      ...list.filter((e) => e.name !== entry.name),
      entry,
    ]);
  }

  /** A day before the open hour's day, with no plain hour file left and no manifest yet. */
  private async writeDueManifests(): Promise<void> {
    const openDay = utcDate(this.openFromMs);
    for (const day of await listDays(this.root)) {
      if (day >= openDay) continue;
      const dir = path.join(this.root, day);
      const names = await readdir(dir);
      if (names.includes(MANIFEST_FILE)) continue;
      if (names.some((n) => HOUR_FILE.test(n))) continue;
      const known = this.entries.get(day) ?? [];
      const files: ManifestEntry[] = [];
      for (const name of names.sort()) {
        const file = path.join(dir, name);
        if (name.endsWith(".jsonl.br")) {
          files.push(
            known.find((e) => e.name === name) ?? {
              name,
              ...pick(await brStats(file)),
            },
          );
        } else if (name === COVERAGE_FILE) {
          files.push({ name, ...(await plainStats(file)) });
        }
      }
      const manifest = { date: day, written: new Date().toISOString(), files };
      await writeFile(
        path.join(dir, `${MANIFEST_FILE}.tmp`),
        `${JSON.stringify(manifest, null, 2)}\n`,
      );
      await rename(
        path.join(dir, `${MANIFEST_FILE}.tmp`),
        path.join(dir, MANIFEST_FILE),
      );
      this.entries.delete(day);
      this.log.info({ day, files: files.length }, "day manifest written");
    }
  }

  /** A crash can cut the last line: it is dropped, and counted. */
  private async dropCutLine(file: string): Promise<void> {
    const bytes = await truncateCutLine(file);
    if (bytes === 0) return;
    this.log.warn({ file, bytes }, "cut last line dropped");
    this.coverage({ event: "cut_line_dropped", file, bytes });
  }
}

export async function listDays(root: string): Promise<string[]> {
  const names = await readdir(root, { withFileTypes: true });
  return names
    .filter((d) => d.isDirectory() && DAY_DIR.test(d.name))
    .map((d) => d.name)
    .sort();
}

/** The plain file compressed beside it and checked by a round trip before it is deleted. */
export async function compressHourFile(plain: string): Promise<ManifestEntry> {
  const target = `${plain}.br`;
  const tmp = `${target}.tmp`;
  const plainHash = createHash("sha256");
  const { size } = await stat(plain);
  await pipeline(
    createReadStream(plain),
    hashing(plainHash),
    zlib.createBrotliCompress({
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: size,
      },
    }),
    createWriteStream(tmp, { flush: true }),
  );
  const stats = await brStats(tmp);
  if (stats.plainSha256 !== plainHash.digest("hex")) {
    await rm(tmp, { force: true });
    throw new Error(
      "the compressed file does not decompress to the plain file",
    );
  }
  await rename(tmp, target);
  await rm(plain);
  return { name: path.basename(target), ...pick(stats) };
}

type BrStats = Omit<ManifestEntry, "name"> & { plainSha256: string };

export async function brStats(file: string): Promise<BrStats> {
  const fileHash = createHash("sha256");
  const plainHash = createHash("sha256");
  const scan = new LineScan();
  let bytes = 0;
  await pipeline(
    createReadStream(file),
    new Transform({
      transform(chunk: Buffer, _encoding, done) {
        fileHash.update(chunk);
        bytes += chunk.length;
        done(null, chunk);
      },
    }),
    zlib.createBrotliDecompress(),
    async (source: AsyncIterable<Buffer>) => {
      for await (const chunk of source) {
        plainHash.update(chunk);
        scan.push(chunk);
      }
    },
  );
  return {
    bytes,
    sha256: fileHash.digest("hex"),
    plainSha256: plainHash.digest("hex"),
    ...scan.result(),
  };
}

async function plainStats(file: string): Promise<Omit<ManifestEntry, "name">> {
  const hash = createHash("sha256");
  const scan = new LineScan();
  let bytes = 0;
  for await (const chunk of createReadStream(file) as AsyncIterable<Buffer>) {
    hash.update(chunk);
    scan.push(chunk);
    bytes += chunk.length;
  }
  return { bytes, sha256: hash.digest("hex"), ...scan.result() };
}

function pick(stats: BrStats): Omit<ManifestEntry, "name"> {
  const { bytes, sha256, lines, first, last } = stats;
  return { bytes, sha256, lines, first, last };
}

function hashing(hash: Hash): Transform {
  return new Transform({
    transform(chunk: Buffer, _encoding, done) {
      hash.update(chunk);
      done(null, chunk);
    },
  });
}

function endStream(stream: WriteStream): Promise<void> {
  return new Promise((resolve) => {
    if (stream.closed || stream.destroyed) return resolve();
    stream.once("close", () => resolve());
    stream.end();
  });
}

/** Cuts a file back to its last line break; returns the bytes removed (0 when it ends with one or is missing). */
export async function truncateCutLine(file: string): Promise<number> {
  let handle;
  try {
    handle = await open(file, "r+");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return 0;
    throw err;
  }
  try {
    const { size } = await handle.stat();
    const buf = Buffer.alloc(64 * 1024);
    let pos = size;
    while (pos > 0) {
      const len = Math.min(buf.length, pos);
      pos -= len;
      await handle.read(buf, 0, len, pos);
      const at = buf.subarray(0, len).lastIndexOf(10);
      if (at === -1) continue;
      const keep = pos + at + 1;
      if (keep < size) await handle.truncate(keep);
      return size - keep;
    }
    if (size > 0) await handle.truncate(0);
    return size;
  } finally {
    await handle.close();
  }
}

/** Counts lines and the smallest and largest time field (the digits before the first tab). */
export class LineScan {
  private lines = 0;
  private first: number | null = null;
  private last: number | null = null;
  private inHead = true;
  private head = 0;
  private headDigits = 0;

  push(chunk: Buffer): void {
    let pos = 0;
    while (pos < chunk.length) {
      if (this.inHead) {
        while (pos < chunk.length) {
          const c = chunk[pos]!;
          if (c < 48 || c > 57) break;
          this.head = this.head * 10 + (c - 48);
          this.headDigits += 1;
          pos += 1;
        }
        if (pos === chunk.length) return;
        this.inHead = false;
        if (this.headDigits > 0) {
          this.first =
            this.first === null ? this.head : Math.min(this.first, this.head);
          this.last =
            this.last === null ? this.head : Math.max(this.last, this.head);
        }
      }
      const nl = chunk.indexOf(10, pos);
      if (nl === -1) return;
      this.lines += 1;
      pos = nl + 1;
      this.inHead = true;
      this.head = 0;
      this.headDigits = 0;
    }
  }

  result(): { lines: number; first: number | null; last: number | null } {
    return { lines: this.lines, first: this.first, last: this.last };
  }
}
