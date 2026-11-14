/**
 * WAVE-H's download tool, tools/waveh-fetch.cjs (decisions 2026-11-14,
 * "WAVE-H's download spec"), with no network: a fake bucket and info API
 * answer through the injected fetch, and a fake clock moves time only when
 * the run waits on it. The collector's heartbeat is written from its own
 * schema (`Heartbeat`), so a change there fails here.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Heartbeat } from "../src/health/heartbeat.js";

type Part = { name: string; dir: string; months: string[]; hourly: boolean };
type Window = { start: number; end: number };
type Opts = {
  store: string;
  heartbeat: string;
  sizingOnly: boolean;
  plan: boolean;
  rate: number | null;
};
type Clock = {
  now: () => number;
  after: (ms: number, fn: () => void) => () => void;
};
type Disk = { bavail: number; bsize: number };
type Deps = {
  fetch: (url: string, init: RequestInit) => Promise<Response>;
  clock: Clock;
  statfs: (dir: string) => Disk;
  out: (text: string) => void;
};
type Tool = {
  BUCKET: string;
  COINS: string[];
  DATA_END: number;
  FIRST: number;
  FLOOR: number;
  INFO: string;
  PARTS: Part[];
  ROOT: string;
  SEAL: number;
  Bucket: new (
    rate: number,
    now: number,
  ) => {
    take: (n: number, now: number) => number;
    setRate: (rate: number) => void;
  };
  admitted: (part: Part, name: string, sizingOnly: boolean) => boolean;
  checkRequest: (
    url: string,
    method: string,
    body: string | undefined,
    sizingOnly: boolean,
  ) => void;
  fundingBody: (coin: string, w: Window) => string;
  fundingWindows: (sizingOnly: boolean) => Window[];
  judge: (beat: unknown) => { conditions: string[] } | null;
  parseArgs: (argv: string[]) => Opts;
  parseListing: (
    xml: string,
    prefix: string,
  ) => {
    entries: {
      key: string;
      size: number;
      etag: string;
      lastModified: string;
    }[];
    next: string | null;
    dropped: string[];
  };
  run: (opts: Opts, deps: Deps) => Promise<number>;
  windowEnd: (now: number) => number | null;
};

const tool = createRequire(import.meta.url)(
  "../../../tools/waveh-fetch.cjs",
) as Tool;
const [FILLS, BY_BLOCK, CTXS] = tool.PARTS as [Part, Part, Part];
const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const T0 = Date.parse("2026-11-15T12:00:00Z");
const LISTED_AT = "2026-11-03T15:11:48.000Z";
const iso = (ms: number) => new Date(ms).toISOString();
const md5 = (b: Buffer) => createHash("md5").update(b).digest("hex");
const sha256 = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const urlOf = (key: string) => `${tool.BUCKET}/${tool.ROOT}${key}`;
const storePath = (store: string, key: string) =>
  path.join(store, ...key.split("/"));
const fetchFile = (store: string, name: string) =>
  path.join(store, "fetch", name);

/** Bytes that differ with the seed. */
function bytes(n: number, seed: number): Buffer {
  const b = Buffer.alloc(n);
  for (let i = 0; i < n; i++) b[i] = (i * 31 + seed * 97 + (i >> 8)) & 255;
  return b;
}

/** Time that moves only when the run waits: the next timer runs whenever nothing else can. */
class FakeClock {
  t: number;
  private queue: { at: number; seq: number; fn: () => void }[] = [];
  private seq = 0;

  constructor(t: number) {
    this.t = t;
  }

  readonly now = (): number => this.t;

  readonly after = (ms: number, fn: () => void): (() => void) => {
    const entry = { at: this.t + Math.max(0, ms), seq: this.seq++, fn };
    this.queue.push(entry);
    return () => {
      this.queue = this.queue.filter((e) => e !== entry);
    };
  };

  sleepOrAbort(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      const cancel = this.after(ms, resolve);
      signal.addEventListener(
        "abort",
        () => {
          cancel();
          resolve();
        },
        { once: true },
      );
    });
  }

  /** Runs `p` to its end. */
  async drive<T>(p: Promise<T>): Promise<T> {
    let settled = false;
    void p.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    await this.loop(() => settled);
    return p;
  }

  /** Runs `p` until `stop` holds, then leaves it for good: what a kill does to a process. */
  async abandon(p: Promise<unknown>, stop: () => boolean): Promise<void> {
    void p.catch(() => {});
    await this.loop(stop);
  }

  /** Six hours of fake time at most: a run that never ends fails here, not by the test's own time limit. */
  private async loop(done: () => boolean): Promise<void> {
    const deadline = this.t + 6 * 60 * MINUTE;
    for (;;) {
      await new Promise<void>((r) => setImmediate(r));
      await new Promise<void>((r) => setImmediate(r));
      if (done()) return;
      if (this.t > deadline) throw new Error("the run did not end in 6 hours");
      this.queue.sort((a, b) => a.at - b.at || a.seq - b.seq);
      const next = this.queue.shift();
      if (next === undefined) throw new Error("the run waits on nothing");
      this.t = Math.max(this.t, next.at);
      next.fn();
    }
  }
}

type Health = {
  clockMs: number | null;
  book: number | "closed" | "never";
  audit: { rows: number; agree: number } | null;
  writes: boolean;
  garbage: boolean;
};
const HEALTHY: Health = {
  clockMs: 110,
  book: 100,
  audit: { rows: 90, agree: 90 },
  writes: true,
  garbage: false,
};

/** A heartbeat as the collector writes it (src/health/heartbeat.ts). */
function heartbeatOf(t: number, h: Health): Heartbeat {
  return Heartbeat.parse({
    time: t,
    iso: iso(t),
    pid: 4242,
    startedAt: t - 3_600_000,
    connections: {
      "book-1": {
        open: h.book !== "closed",
        lastFrameAt:
          h.book === "never"
            ? null
            : t - (typeof h.book === "number" ? h.book : 0),
      },
      "trades-1": { open: true, lastFrameAt: t - 40 },
    },
    jobs: { "price-audit": { lastRunAt: t - 300_000, lastOkAt: t - 300_000 } },
    tokensLastMinute: 12,
    rest: { calls: 100, timeouts: 0, network: 0 },
    streams: { bookFrames: 1_000, stalls: 0, stalledMarkets: 0 },
    files: {},
    db: {},
    audit:
      h.audit === null
        ? null
        : {
            ...h.audit,
            timingMiss: 0,
            otherMiss: h.audit.rows - h.audit.agree,
            noBook: 0,
          },
    memory: {
      rssMb: 100,
      heapUsedMb: 50,
      heapTotalMb: 60,
      externalMb: 5,
      arrayBuffersMb: 1,
    },
    clock:
      h.clockMs === null
        ? null
        : { minuteStart: t - MINUTE, minOffsetMs: h.clockMs },
    disk: { recordings: { path: "F:\\", freeGiB: 1_400, state: "ok" } },
  });
}

/** The collector's heartbeat, rewritten every 10 s as it does it: a temporary file renamed over it. */
class FakeCollector {
  health: Health = { ...HEALTHY };
  readonly file: string;
  private readonly clock: FakeClock;

  constructor(clock: FakeClock, file: string) {
    this.clock = clock;
    this.file = file;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.beat();
  }

  private readonly beat = (): void => {
    if (this.health.writes) {
      const t = this.clock.now();
      const text = this.health.garbage
        ? "{ not a heartbeat"
        : `${JSON.stringify(heartbeatOf(t, this.health), null, 2)}\n`;
      fs.writeFileSync(`${this.file}.tmp`, text);
      fs.renameSync(`${this.file}.tmp`, this.file);
      fs.utimesSync(this.file, t / SECOND, t / SECOND);
    }
    this.clock.after(10 * SECOND, this.beat);
  };
}

/** A ListObjectsV2 page shaped as the bucket's (as listed on 2026-11-14, WAVE-H-PLAN-REVIEW's list-1). */
function listingXml(
  prefix: string,
  entries: { key: string; size: number; etag: string }[],
  next: string | null = null,
): string {
  const contents = entries
    .map(
      (e) =>
        `<Contents><Key>${e.key}</Key><LastModified>${LISTED_AT}</LastModified><ETag>&quot;${e.etag}&quot;</ETag><ChecksumAlgorithm>SHA256</ChecksumAlgorithm><ChecksumType>FULL_OBJECT</ChecksumType><Size>${e.size}</Size><StorageClass>INTELLIGENT_TIERING</StorageClass></Contents>`,
    )
    .join("");
  const token =
    next === null
      ? ""
      : `<NextContinuationToken>${next}</NextContinuationToken>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Name>aws-public-blockchain</Name><Prefix>${prefix}</Prefix>${token}<KeyCount>${entries.length}</KeyCount><MaxKeys>1000</MaxKeys><IsTruncated>${next === null ? "false" : "true"}</IsTruncated>${contents}</ListBucketResult>`;
}

const listingUrlOf = (prefix: string, token: string | null = null) => {
  const q = new URLSearchParams({
    "list-type": "2",
    prefix: tool.ROOT + prefix,
    "max-keys": "1000",
  });
  if (token !== null) q.set("continuation-token", token);
  return `${tool.BUCKET}/?${q.toString()}`;
};

type Answer = {
  status?: number;
  body?: Buffer;
  etag?: string;
  contentType?: string;
  throws?: string;
  stallAfter?: number;
  stallMs?: number;
};
type Call = {
  at: number;
  method: string;
  url: string;
  body: string | undefined;
  userAgent: string | null;
  redirect: string | undefined;
};

/** The bucket and the info API: listings and objects from memory, `[]` for fundingHistory, scripted answers by attempt. */
class FakeServer {
  readonly objects = new Map<string, Buffer>();
  readonly etags = new Map<string, string>();
  readonly calls: Call[] = [];
  readonly delivered: { at: number; url: string; bytes: number }[] = [];
  pageSize = 1_000;
  open = 0;
  maxOpen = 0;
  private readonly answers = new Map<string, Answer[]>();
  private readonly attempts = new Map<string, number>();
  private readonly clock: FakeClock;

  constructor(clock: FakeClock) {
    this.clock = clock;
  }

  put(key: string, body: Buffer, etag = md5(body)): void {
    this.objects.set(tool.ROOT + key, body);
    this.etags.set(tool.ROOT + key, etag);
  }

  /** The answers to a URL's attempts (a POST's by its body), in order; past them, the usual one. */
  script(id: string, ...answers: Answer[]): void {
    this.answers.set(id, answers);
  }

  calledFor(id: string): Call[] {
    return this.calls.filter(
      (c) => (c.method === "POST" ? c.body : c.url) === id,
    );
  }

  readonly fetch = (url: string, init: RequestInit): Promise<Response> => {
    const method = init.method ?? "GET";
    const body = typeof init.body === "string" ? init.body : undefined;
    const signal = init.signal ?? new AbortController().signal;
    this.calls.push({
      at: this.clock.now(),
      method,
      url,
      body,
      userAgent: new Headers(init.headers).get("user-agent"),
      redirect: init.redirect,
    });
    const id = method === "POST" ? (body ?? "") : url;
    const n = (this.attempts.get(id) ?? 0) + 1;
    this.attempts.set(id, n);
    const answer = this.answers.get(id)?.[n - 1] ?? {};
    if (answer.throws !== undefined) {
      return Promise.reject(new TypeError(answer.throws));
    }
    return Promise.resolve(this.reply(url, method, answer, signal));
  };

  private reply(
    url: string,
    method: string,
    answer: Answer,
    signal: AbortSignal,
  ): Response {
    const status = answer.status ?? 200;
    if (status !== 200) {
      return new Response(null, {
        status,
        headers: status < 400 ? { location: "https://elsewhere.example/" } : {},
      });
    }
    if (method === "POST") {
      return this.respond(
        answer.body ?? Buffer.from("[]"),
        { "content-type": answer.contentType ?? "application/json" },
        url,
        answer,
        signal,
      );
    }
    const u = new URL(url);
    if (u.pathname === "/") {
      const prefix = u.searchParams.get("prefix") ?? "";
      const keys = [...this.objects.keys()]
        .filter((k) => k.startsWith(prefix))
        .sort();
      const from = Number(u.searchParams.get("continuation-token") ?? "0");
      const page = keys.slice(from, from + this.pageSize).map((key) => ({
        key,
        size: this.objects.get(key)?.length ?? 0,
        etag: this.etags.get(key) ?? "",
      }));
      const more = from + this.pageSize < keys.length;
      const xml = listingXml(
        prefix,
        page,
        more ? String(from + this.pageSize) : null,
      );
      return this.respond(
        answer.body ?? Buffer.from(xml),
        { "content-type": "application/xml" },
        url,
        answer,
        signal,
      );
    }
    const key = u.pathname.slice(1);
    const object = this.objects.get(key);
    if (object === undefined) return new Response(null, { status: 404 });
    return this.respond(
      answer.body ?? object,
      {
        etag: `"${answer.etag ?? this.etags.get(key) ?? ""}"`,
        "content-type": "application/octet-stream",
      },
      url,
      answer,
      signal,
    );
  }

  private respond(
    body: Buffer,
    headers: Record<string, string>,
    url: string,
    answer: Answer,
    signal: AbortSignal,
  ): Response {
    this.open += 1;
    this.maxOpen = Math.max(this.maxOpen, this.open);
    let closed = false;
    const end = () => {
      if (!closed) {
        closed = true;
        this.open -= 1;
      }
    };
    signal.addEventListener("abort", end, { once: true });
    let at = 0;
    let stalled = false;
    const stream = new ReadableStream<Uint8Array>(
      {
        pull: async (controller) => {
          if (
            answer.stallMs !== undefined &&
            !stalled &&
            at >= (answer.stallAfter ?? 0)
          ) {
            stalled = true;
            await this.clock.sleepOrAbort(answer.stallMs, signal);
          }
          if (signal.aborted) {
            end();
            controller.error(new Error("aborted"));
            return;
          }
          if (at >= body.length) {
            end();
            controller.close();
            return;
          }
          const piece = body.subarray(at, at + 64 * 1024);
          at += piece.length;
          this.delivered.push({
            at: this.clock.now(),
            url,
            bytes: piece.length,
          });
          controller.enqueue(piece);
        },
      },
      { highWaterMark: 0 },
    );
    return new Response(stream, { status: 200, headers });
  }
}

/** The first session's world: five sizing files, and three files outside its dates that it never asks for. */
const SIZING_KEYS = [
  "node_fills/hourly/20250607/0.lz4",
  "node_fills/hourly/20250607/1.lz4",
  "node_fills/hourly/20250607/2.lz4",
  "node_fills_by_block/hourly/20250728/5.lz4",
  "asset_ctxs/20250601.csv.lz4",
];
function sizingWorld(server: FakeServer): void {
  const sizes = [120_000, 120_000, 120_000, 80_000, 40_000];
  SIZING_KEYS.forEach((key, i) => server.put(key, bytes(sizes[i] ?? 0, i + 1)));
  server.put("node_fills_by_block/hourly/20250801/0.lz4", bytes(1_000, 6));
  server.put("asset_ctxs/20250801.csv.lz4", bytes(1_000, 7));
  server.put("asset_ctxs/20250524.csv.lz4", bytes(1_000, 8));
}
const FUNDING_READS = 4 * 38;

function setup(start = T0) {
  const root = fs.mkdtempSync(path.join(tmpdir(), "waveh-fetch-"));
  const store = path.join(root, "store");
  const clock = new FakeClock(start);
  const collector = new FakeCollector(
    clock,
    path.join(root, "var", "heartbeat.json"),
  );
  const server = new FakeServer(clock);
  const disk: Disk = { bavail: 2 ** 30, bsize: 4_096 };
  const out: string[] = [];
  const deps: Deps = {
    fetch: server.fetch,
    clock,
    statfs: () => disk,
    out: (text) => {
      out.push(text);
    },
  };
  const opts: Opts = {
    store,
    heartbeat: collector.file,
    sizingOnly: true,
    plan: false,
    rate: null,
  };
  const run = (more: Partial<Opts> = {}) =>
    clock.drive(tool.run({ ...opts, ...more }, deps));
  return { root, store, clock, collector, server, disk, out, deps, opts, run };
}

type LogLine = {
  at: string;
  event: string;
  why?: string;
  [field: string]: unknown;
};
function logOf(store: string): LogLine[] {
  const dir = path.join(store, "fetch", "log");
  return fs
    .readdirSync(dir)
    .sort()
    .flatMap((name) =>
      fs
        .readFileSync(path.join(dir, name), "utf8")
        .split("\n")
        .filter((line) => line !== "")
        .map((line) => JSON.parse(line) as LogLine),
    );
}
const eventsOf = (store: string, event: string) =>
  logOf(store).filter((l) => l.event === event);
/** Whether a log line came within the second after `t`: the tick that sees a stop runs every second. */
const within = (line: LogLine | undefined, t: number) =>
  line !== undefined &&
  Date.parse(line.at) >= t &&
  Date.parse(line.at) <= t + SECOND;

type ManifestLine = {
  key: string;
  bytes: number;
  etag: string | null;
  lastModified: string | null;
  md5: string;
  sha256: string;
  fetchedAt: string;
  request?: unknown;
};
function jsonLines<T>(file: string): T[] {
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => JSON.parse(line) as T);
}
const manifestOf = (store: string) =>
  jsonLines<ManifestLine>(path.join(store, "manifest.jsonl"));
const problemsOf = (store: string) =>
  jsonLines<{ key: string; problem: string; detail: string }>(
    fetchFile(store, "problems.jsonl"),
  );
function partsIn(store: string): string[] {
  return fs
    .readdirSync(store, { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith(".part"));
}
const fileKeysOf = (store: string) =>
  manifestOf(store)
    .map((l) => l.key)
    .filter((k) => !k.startsWith("info/"));

/** The largest number of bytes delivered in any span, beyond the rate's share of it. */
function overRate(
  delivered: { at: number; bytes: number }[],
  rate: number,
): number {
  let worst = -Infinity;
  for (let i = 0; i < delivered.length; i++) {
    let sum = 0;
    for (let k = i; k < delivered.length; k++) {
      const d = delivered[k];
      const first = delivered[i];
      if (d === undefined || first === undefined) continue;
      sum += d.bytes;
      worst = Math.max(worst, sum - (rate * (d.at - first.at)) / SECOND);
    }
  }
  return worst;
}

/** Records the calls of fs functions (with the fake time) before calling the real ones. */
function recordFs(
  target: object,
  names: string[],
  record: (name: string, args: unknown[]) => void,
): void {
  for (const name of names) {
    const real = (target as Record<string, (...args: unknown[]) => unknown>)[
      name
    ];
    if (real === undefined) throw new Error(`no ${name}`);
    vi.spyOn(target as Record<string, () => unknown>, name).mockImplementation(
      (...args: unknown[]) => {
        record(name, args);
        return real.apply(target, args);
      },
    );
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the guards", () => {
  it("admit only the plan's keys: from 2025-05-25, through DATA END's own hour for hourly files, before DATA END for daily ones, before 2025-08-01 in the first session", () => {
    expect(tool.FIRST).toBe(Date.parse("2025-05-25T00:00:00.000Z"));
    expect(tool.SEAL).toBe(Date.parse("2025-08-01T00:00:00.000Z"));
    expect(tool.DATA_END).toBe(Date.parse("2026-05-29T01:00:00.000Z"));
    expect(
      tool.PARTS.map((p) => [
        p.dir,
        p.hourly,
        p.months[0],
        p.months.at(-1),
        p.months.length,
      ]),
    ).toEqual([
      ["node_fills/hourly/", true, "202505", "202507", 3],
      ["node_fills_by_block/hourly/", true, "202507", "202605", 11],
      ["asset_ctxs/", false, "202505", "202605", 13],
    ]);
    const cases: [Part, string, boolean, boolean][] = [
      [FILLS, "20250524/23.lz4", false, false],
      [FILLS, "20250525/0.lz4", true, true],
      [FILLS, "20250727/8.lz4", true, true],
      [BY_BLOCK, "20250731/23.lz4", true, true],
      [BY_BLOCK, "20250801/0.lz4", true, false],
      [BY_BLOCK, "20260528/23.lz4", true, false],
      [BY_BLOCK, "20260529/0.lz4", true, false],
      [BY_BLOCK, "20260529/1.lz4", true, false],
      [BY_BLOCK, "20260529/2.lz4", false, false],
      [CTXS, "20250524.csv.lz4", false, false],
      [CTXS, "20250525.csv.lz4", true, true],
      [CTXS, "20250731.csv.lz4", true, true],
      [CTXS, "20250801.csv.lz4", true, false],
      [CTXS, "20260529.csv.lz4", true, false],
      [CTXS, "20260530.csv.lz4", false, false],
      [FILLS, "20250607/24.lz4", false, false],
      [FILLS, "20250607/07.lz4", false, false],
      [FILLS, "20250631/1.lz4", false, false],
      [FILLS, "20250607/1.lz4.part", false, false],
      [FILLS, "20250607.csv.lz4", false, false],
      [CTXS, "20250607/1.lz4", false, false],
    ];
    for (const [part, name, full, sizing] of cases) {
      expect([
        part.dir,
        name,
        tool.admitted(part, name, false),
        tool.admitted(part, name, true),
      ]).toEqual([part.dir, name, full, sizing]);
    }
  });

  it("refuse every request but the plan's: another host, /exchange, a GET of the API, a POST to the bucket, a month, key or window outside, a coin not among the 38", () => {
    const w = tool.fundingWindows(false);
    const [w0, , , w3, w4] = w as [Window, Window, Window, Window, Window];
    const check =
      (
        url: string,
        method: string,
        body: string | undefined,
        sizing: boolean,
      ) =>
      () =>
        tool.checkRequest(url, method, body, sizing);
    for (const [url, method, body, sizing] of [
      [urlOf("node_fills/hourly/20250607/0.lz4"), "GET", undefined, true],
      [
        urlOf("node_fills_by_block/hourly/20260529/1.lz4"),
        "GET",
        undefined,
        false,
      ],
      [listingUrlOf("node_fills/hourly/202506"), "GET", undefined, true],
      [listingUrlOf("asset_ctxs/202507", "3"), "GET", undefined, true],
      [
        listingUrlOf("node_fills_by_block/hourly/202605"),
        "GET",
        undefined,
        false,
      ],
      [tool.INFO, "POST", tool.fundingBody("SOL", w0), true],
      [tool.INFO, "POST", tool.fundingBody("MORPHO", w4), false],
    ] as const) {
      expect(check(url, method, body, sizing), url).not.toThrow();
    }
    const straddling = JSON.stringify({
      type: "fundingHistory",
      coin: "SOL",
      startTime: w3.start,
      endTime: w4.end - 1,
    });
    for (const [url, method, body, sizing] of [
      [
        urlOf("node_fills_by_block/hourly/20250801/0.lz4"),
        "GET",
        undefined,
        true,
      ],
      [
        listingUrlOf("node_fills_by_block/hourly/202508"),
        "GET",
        undefined,
        true,
      ],
      [tool.INFO, "POST", tool.fundingBody("SOL", w4), true],
      [
        tool.INFO.replace("/info", "/exchange"),
        "POST",
        tool.fundingBody("SOL", w0),
        false,
      ],
      [tool.INFO, "GET", undefined, false],
      [tool.INFO, "POST", tool.fundingBody("BTC", w0), false],
      [tool.INFO, "POST", straddling, false],
      [
        tool.INFO,
        "POST",
        JSON.stringify({ type: "userFills", user: "0x0" }),
        false,
      ],
      [urlOf("node_fills/hourly/20250607/0.lz4"), "POST", "{}", false],
      [urlOf("node_trades/hourly/20250601/0.lz4"), "GET", undefined, false],
      [urlOf("market_data/20250601/0/l2Book/SOL.lz4"), "GET", undefined, false],
      [
        urlOf("node_fills_by_block/hourly/20260529/2.lz4"),
        "GET",
        undefined,
        false,
      ],
      [
        `${urlOf("node_fills/hourly/20250607/0.lz4")}?x=1`,
        "GET",
        undefined,
        false,
      ],
      [
        urlOf("node_fills/hourly/20250607/0.lz4").replace(".us-east-2", ""),
        "GET",
        undefined,
        false,
      ],
      [
        `https://elsewhere.example/${tool.ROOT}node_fills/hourly/20250607/0.lz4`,
        "GET",
        undefined,
        false,
      ],
      [listingUrlOf("node_fills/hourly/2025"), "GET", undefined, false],
      [
        `${listingUrlOf("node_fills/hourly/202506")}&delimiter=%2F`,
        "GET",
        undefined,
        false,
      ],
      [listingUrlOf("node_fills/hourly/202608"), "GET", undefined, false],
    ] as const) {
      expect(check(url, method, body, sizing), url).toThrow(
        /outside the guard/,
      );
    }
  });

  it("align the funding windows to the seal: 20 a coin, none straddling 2025-08-01 or passing DATA END, 760 reads", () => {
    const w = tool.fundingWindows(false);
    expect(w.map((x) => iso(x.start).slice(0, 10))).toEqual([
      "2025-05-25",
      "2025-06-14",
      "2025-07-04",
      "2025-07-24",
      "2025-08-01",
      "2025-08-21",
      "2025-09-10",
      "2025-09-30",
      "2025-10-20",
      "2025-11-09",
      "2025-11-29",
      "2025-12-19",
      "2026-01-08",
      "2026-01-28",
      "2026-02-17",
      "2026-03-09",
      "2026-03-29",
      "2026-04-18",
      "2026-05-08",
      "2026-05-28",
    ]);
    expect(w[0]?.start).toBe(tool.FIRST);
    expect(w.at(-1)?.end).toBe(tool.DATA_END);
    w.forEach((x, i) => {
      if (i > 0) expect(x.start).toBe(w[i - 1]?.end);
      expect(x.end <= tool.SEAL || x.start >= tool.SEAL).toBe(true);
      expect(x.end - x.start).toBeLessThanOrEqual(20 * 24 * 60 * MINUTE);
    });
    expect(tool.fundingWindows(true)).toEqual(w.slice(0, 4));
    expect(tool.COINS).toEqual(
      "SOL HYPE PUMP ZEC XRP LIT kPEPE AAVE UNI WLD NEAR kSHIB FARTCOIN DOGE ENA ONDO SUI VVV TAO ADA ZRO BNB PONS CASHCAT USELESS KAITO ARB LDO AVAX LTC XPL XMR LINK VIRTUAL JUP ETHFI PENDLE MORPHO".split(
        " ",
      ),
    );
    expect(tool.COINS.length * w.length).toBe(760);
    expect(JSON.parse(tool.fundingBody("kPEPE", w[3] as Window))).toEqual({
      type: "fundingHistory",
      coin: "kPEPE",
      startTime: Date.parse("2025-07-24T00:00:00Z"),
      endTime: tool.SEAL - 1,
    });
  });

  it("validate a listing page (Iron Rule 3): its bucket, prefix, count and truncation; an entry with a bad key, size, ETag or time is dropped", () => {
    const prefix = `${tool.ROOT}node_fills/hourly/202506`;
    const key = (name: string) => `${tool.ROOT}node_fills/hourly/${name}`;
    const good = listingXml(
      prefix,
      [
        {
          key: key("20250601/0.lz4"),
          size: 10,
          etag: "e77eccfdaedc4a502185c5dd6a6b5251",
        },
        {
          key: key("20250601/1.lz4"),
          size: 5,
          etag: "0123456789abcdef0123456789abcdef-12",
        },
      ],
      "token-2",
    );
    expect(tool.parseListing(good, prefix)).toEqual({
      entries: [
        {
          key: key("20250601/0.lz4"),
          size: 10,
          etag: "e77eccfdaedc4a502185c5dd6a6b5251",
          lastModified: LISTED_AT,
        },
        {
          key: key("20250601/1.lz4"),
          size: 5,
          etag: "0123456789abcdef0123456789abcdef-12",
          lastModified: LISTED_AT,
        },
      ],
      next: "token-2",
      dropped: [],
    });
    const bad = listingXml(prefix, [
      {
        key: key("20250601/0.lz4"),
        size: 0,
        etag: "e77eccfdaedc4a502185c5dd6a6b5251",
      },
      {
        key: key("20250601/1.lz4"),
        size: 10,
        etag: "E77ECCFDAEDC4A502185C5DD6A6B5251",
      },
      {
        key: key("20250701/1.lz4"),
        size: 10,
        etag: "e77eccfdaedc4a502185c5dd6a6b5251",
      },
      {
        key: key("20250601/2.lz4"),
        size: 10,
        etag: "e77eccfdaedc4a502185c5dd6a6b5251",
      },
    ]).replace(
      `${key("20250601/2.lz4")}</Key><LastModified>${LISTED_AT}`,
      `${key("20250601/2.lz4")}</Key><LastModified>yesterday`,
    );
    const parsed = tool.parseListing(bad, prefix);
    expect([parsed.entries, parsed.next, parsed.dropped.length]).toEqual([
      [],
      null,
      4,
    ]);
    for (const [text, why] of [
      [
        good.replace("aws-public-blockchain", "another-bucket"),
        /another bucket or prefix/,
      ],
      [good.replace("<KeyCount>2<", "<KeyCount>3<"), /KeyCount/],
      [
        good.replace(
          "<NextContinuationToken>token-2</NextContinuationToken>",
          "",
        ),
        /continuation token/,
      ],
      [good.replace("<IsTruncated>true</IsTruncated>", ""), /IsTruncated/],
      [good.replace("</ListBucketResult>", ""), /not a ListBucketResult/],
      ["<html>busy</html>", /not a ListBucketResult/],
    ] as const) {
      expect(() => tool.parseListing(text, prefix)).toThrow(why);
    }
    expect(() =>
      tool.parseListing(good, `${tool.ROOT}node_fills/hourly/202507`),
    ).toThrow(/another bucket or prefix/);
  });

  it("in the first session list the sizing months only and fetch nothing dated before 2025-05-25 or from 2025-08-01, one request at a time with a generic User-Agent; each file and reply stored as received", async () => {
    const w = setup();
    sizingWorld(w.server);
    w.server.pageSize = 2;
    w.server.script(listingUrlOf("asset_ctxs/202506"), {
      body: Buffer.from("<html>busy</html>"),
    });
    expect(await w.run()).toBe(0);
    const gets = w.server.calls.filter((c) => c.method === "GET");
    const listed = gets
      .filter((c) => new URL(c.url).pathname === "/")
      .map((c) => {
        const q = new URL(c.url).searchParams;
        return `${q.get("prefix")?.slice(tool.ROOT.length)} ${q.get("continuation-token") ?? ""}`.trim();
      });
    expect(listed).toEqual([
      "node_fills/hourly/202505",
      "node_fills/hourly/202506",
      "node_fills/hourly/202506 2",
      "node_fills/hourly/202507",
      "node_fills_by_block/hourly/202507",
      "asset_ctxs/202505",
      "asset_ctxs/202506",
      "asset_ctxs/202506",
      "asset_ctxs/202507",
    ]);
    expect(
      gets
        .filter((c) => new URL(c.url).pathname !== "/")
        .map((c) => c.url.slice(urlOf("").length)),
    ).toEqual(SIZING_KEYS);
    const posts = w.server.calls.filter((c) => c.method === "POST");
    expect(posts.length).toBe(FUNDING_READS);
    expect(new Set(posts.map((c) => c.body))).toEqual(
      new Set(
        tool
          .fundingWindows(true)
          .flatMap((win) =>
            tool.COINS.map((coin) => tool.fundingBody(coin, win)),
          ),
      ),
    );
    expect(posts.every((c) => c.url === tool.INFO)).toBe(true);
    expect(
      w.server.calls.every(
        (c) => c.userAgent === "research-check/1.0" && c.redirect === "manual",
      ),
    ).toBe(true);
    w.server.calls.forEach((c, i) => {
      const before = w.server.calls[i - 1];
      if (before !== undefined)
        expect(c.at - before.at).toBeGreaterThanOrEqual(SECOND);
    });
    posts.forEach((c, i) => {
      const before = posts[i - 1];
      if (before !== undefined)
        expect(c.at - before.at).toBeGreaterThanOrEqual(6 * SECOND);
    });
    expect(w.server.maxOpen).toBe(1);
    expect(eventsOf(w.store, "error")).toMatchObject([
      {
        inARow: 1,
        waitS: 30,
        why: expect.stringMatching(
          /asset_ctxs\/202506 fails its schema: not a ListBucketResult/,
        ) as unknown,
      },
    ]);

    const manifest = manifestOf(w.store);
    expect(manifest.length).toBe(SIZING_KEYS.length + FUNDING_READS);
    for (const key of SIZING_KEYS) {
      const body = w.server.objects.get(tool.ROOT + key) ?? Buffer.alloc(0);
      expect(manifest.find((l) => l.key === key)).toMatchObject({
        bytes: body.length,
        etag: md5(body),
        lastModified: LISTED_AT,
        md5: md5(body),
        sha256: sha256(body),
      });
      expect(fs.readFileSync(storePath(w.store, key))).toEqual(body);
    }
    const first = tool.fundingWindows(true)[0] as Window;
    const funding = `info/fundingHistory/kPEPE/${first.start}.json`;
    expect(manifest.find((l) => l.key === funding)).toMatchObject({
      bytes: 2,
      etag: null,
      lastModified: null,
      md5: md5(Buffer.from("[]")),
      sha256: sha256(Buffer.from("[]")),
      request: {
        type: "fundingHistory",
        coin: "kPEPE",
        startTime: first.start,
        endTime: first.end - 1,
      },
    });
    expect(fs.readFileSync(storePath(w.store, funding), "utf8")).toBe("[]");
    expect(partsIn(w.store)).toEqual([]);
    expect(problemsOf(w.store)).toEqual([]);
    expect(logOf(w.store).at(-1)).toMatchObject({
      event: "done",
      files: SIZING_KEYS.length + FUNDING_READS,
    });
  }, 60_000);

  it("end the run on a redirect or an unforeseen reply (exit 1), with nothing more asked", async () => {
    for (const status of [302, 400]) {
      const w = setup();
      sizingWorld(w.server);
      const url = urlOf(SIZING_KEYS[1] ?? "");
      w.server.script(url, { status });
      expect(await w.run()).toBe(1);
      expect(w.server.calls.at(-1)?.url).toBe(url);
      expect(eventsOf(w.store, "aborted")).toMatchObject([
        {
          why: expect.stringContaining(
            status === 302
              ? `HTTP 302, a redirect, from ${url}`
              : `HTTP 400 from ${url}`,
          ) as unknown,
        },
      ]);
      expect(fileKeysOf(w.store)).toEqual([SIZING_KEYS[0]]);
    }
  }, 60_000);
});

describe("the rate", () => {
  it("is a token bucket: a second's bytes in a burst, then the rate", () => {
    const b = new tool.Bucket(1_000, 0);
    expect(b.take(1_000, 0)).toBe(0);
    expect(b.take(500, 0)).toBe(500);
    expect(b.take(0, 500)).toBe(0);
    expect(b.take(1_500, 10_000)).toBe(500);
    b.setRate(400);
    expect(b.take(0, 10_500)).toBe(750);
    expect(b.take(400, 20_000)).toBe(0);
  });

  it("keeps the files to 2 MB/s, a second's bytes ahead at most; --rate only lowers it", async () => {
    for (const rate of [2_000_000, 500_000]) {
      const w = setup();
      for (let h = 0; h < 4; h++) {
        w.server.put(
          `node_fills/hourly/20250607/${h}.lz4`,
          bytes(1_500_000, h),
        );
      }
      expect(await w.run({ rate: rate === 2_000_000 ? null : rate })).toBe(0);
      const files = w.server.delivered.filter((d) => d.url.endsWith(".lz4"));
      expect(files.reduce((s, d) => s + d.bytes, 0)).toBe(6_000_000);
      expect(overRate(files, rate)).toBeLessThanOrEqual(rate + 64 * 1024);
      const first = files[0]?.at ?? 0;
      const last = files.at(-1)?.at ?? 0;
      expect(last - first).toBeLessThanOrEqual(
        (6_000_000 / rate) * SECOND + 4 * SECOND,
      );
    }
    expect(() =>
      tool.parseArgs(["--store", "s", "--heartbeat", "h", "--rate", "2000001"]),
    ).toThrow(/it may only lower the rate/);
  }, 60_000);
});

describe("the pause windows", () => {
  it("are 02:30-06:00Z and 10:25-11:15Z by the UTC clock", () => {
    const at = (time: string) => Date.parse(`2026-11-15T${time}Z`);
    for (const [time, end] of [
      ["02:29:59.999", null],
      ["02:30:00.000", "06:00:00.000"],
      ["05:59:59.999", "06:00:00.000"],
      ["06:00:00.000", null],
      ["10:24:59.999", null],
      ["10:25:00.000", "11:15:00.000"],
      ["11:14:59.999", "11:15:00.000"],
      ["11:15:00.000", null],
      ["00:00:00.000", null],
    ] as const) {
      expect([time, tool.windowEnd(at(time))]).toEqual([
        time,
        end === null ? null : at(end),
      ]);
    }
  });

  it("start nothing inside, and end a transfer the window opens on: fetched again when it closes", async () => {
    const w = setup(Date.parse("2026-11-15T10:24:30Z"));
    const key = "node_fills/hourly/20250607/0.lz4";
    w.server.put(key, bytes(3_000_000, 1));
    expect(await w.run({ rate: 100_000 })).toBe(0);
    expect(w.server.calls.filter((c) => tool.windowEnd(c.at) !== null)).toEqual(
      [],
    );
    const gets = w.server.calledFor(urlOf(key));
    expect(gets.length).toBe(2);
    expect(gets[0]?.at).toBeLessThan(Date.parse("2026-11-15T10:25:00Z"));
    expect(gets[1]?.at).toBeGreaterThanOrEqual(
      Date.parse("2026-11-15T11:15:00Z"),
    );
    expect(
      w.server.delivered.some(
        (d) =>
          d.at > Date.parse("2026-11-15T10:25:00Z") &&
          d.at < Date.parse("2026-11-15T11:15:00Z"),
      ),
    ).toBe(false);
    expect(eventsOf(w.store, "waiting").map((l) => l.why)).toContain(
      "the pause window to 2026-11-15T11:15:00.000Z",
    );
    expect(fileKeysOf(w.store)).toEqual([key]);
    expect(eventsOf(w.store, "error")).toEqual([]);
    expect(partsIn(w.store)).toEqual([]);
  }, 60_000);
});

describe("the error ladder", () => {
  it("waits 30 s, 2 min and 10 min after errors in a row, starts again after a reply, and stops the day at the fourth (exit 4)", async () => {
    const w = setup();
    sizingWorld(w.server);
    const [k0, k1] = SIZING_KEYS as [string, string];
    w.server.script(
      urlOf(k0),
      { status: 503 },
      { status: 429 },
      { throws: "socket hang up" },
    );
    w.server.script(
      urlOf(k1),
      { stallAfter: 64 * 1024, stallMs: 61 * SECOND },
      { status: 500 },
      { status: 500 },
      { status: 500 },
    );
    expect(await w.run()).toBe(4);
    const gaps = (calls: Call[]) =>
      calls.slice(1).map((c, i) => c.at - (calls[i]?.at ?? 0));
    const g0 = gaps(w.server.calledFor(urlOf(k0)));
    const g1 = gaps(w.server.calledFor(urlOf(k1)));
    [30, 120, 600].forEach((s, i) => {
      expect(g0[i]).toBeGreaterThanOrEqual(s * SECOND);
      expect(g0[i]).toBeLessThan((s + 2) * SECOND);
    });
    [90, 120, 600].forEach((s, i) => {
      expect(g1[i]).toBeGreaterThanOrEqual(s * SECOND);
      expect(g1[i]).toBeLessThan((s + 2) * SECOND);
    });
    expect(eventsOf(w.store, "error").map((l) => [l.inARow, l.waitS])).toEqual([
      [1, 30],
      [2, 120],
      [3, 600],
      [1, 30],
      [2, 120],
      [3, 600],
    ]);
    expect(eventsOf(w.store, "error")[3]?.why).toBe(
      `no byte for 60 s: ${urlOf(k1)}`,
    );
    expect(eventsOf(w.store, "stopped")).toMatchObject([
      {
        code: 4,
        why: `stopped for the day: 4 errors in a row, the last: HTTP 500: ${urlOf(k1)}`,
      },
    ]);
    expect(w.server.calls.at(-1)?.url).toBe(urlOf(k1));
    expect(fileKeysOf(w.store)).toEqual([k0]);
    expect(partsIn(w.store)).toEqual([]);
  }, 60_000);

  it("counts a local fault in a file (a write refused) on the ladder, and ends that request", async () => {
    const w = setup();
    sizingWorld(w.server);
    const key = SIZING_KEYS[1] ?? "";
    const part = `${storePath(w.store, key)}.part`;
    const fds = new Set<number>();
    let refused = 0;
    const realOpen = fs.openSync;
    const realWrite = fs.writeSync;
    vi.spyOn(fs, "openSync").mockImplementation((file, flags, mode) => {
      const fd = realOpen(file, flags, mode);
      if (file === part) fds.add(fd);
      return fd;
    });
    vi.spyOn(fs, "writeSync").mockImplementation(
      (fd: number, ...rest: unknown[]) => {
        if (fds.has(fd) && refused === 0) {
          refused += 1;
          throw new Error("ENOSPC: the disk is full");
        }
        return (realWrite as (...args: unknown[]) => number)(fd, ...rest);
      },
    );
    expect(await w.run()).toBe(0);
    expect(refused).toBe(1);
    expect(eventsOf(w.store, "error")).toMatchObject([
      { inARow: 1, waitS: 30, why: `ENOSPC: the disk is full: ${urlOf(key)}` },
    ]);
    const gets = w.server.calledFor(urlOf(key));
    expect(gets.length).toBe(2);
    expect((gets[1]?.at ?? 0) - (gets[0]?.at ?? 0)).toBe(30 * SECOND);
    expect(w.server.maxOpen).toBe(1);
    expect(fileKeysOf(w.store)).toEqual(SIZING_KEYS);
    expect(partsIn(w.store)).toEqual([]);
  }, 60_000);

  it("records a key answered 403 or 404 as missing and goes on, the ladder untouched", async () => {
    const w = setup();
    sizingWorld(w.server);
    const [k0, k1] = SIZING_KEYS as [string, string];
    w.server.script(urlOf(k0), { status: 403 });
    w.server.script(urlOf(k1), { status: 404 });
    expect(await w.run()).toBe(0);
    expect(problemsOf(w.store)).toMatchObject([
      { key: k0, problem: "missing", detail: "HTTP 403" },
      { key: k1, problem: "missing", detail: "HTTP 404" },
    ]);
    expect(fileKeysOf(w.store)).toEqual(SIZING_KEYS.slice(2));
    expect(eventsOf(w.store, "error")).toEqual([]);
  }, 60_000);
});

describe("the watch", () => {
  it("judges a heartbeat by the collector's own rules", () => {
    const judge = (h: Partial<Health>) =>
      tool.judge(heartbeatOf(T0, { ...HEALTHY, ...h }))?.conditions;
    expect(judge({})).toEqual([]);
    expect(
      judge({ clockMs: 400, book: 15_000, audit: { rows: 90, agree: 81 } }),
    ).toEqual([]);
    expect(judge({ clockMs: null, audit: null })).toEqual([]);
    expect(judge({ clockMs: 401 })).toEqual(["the clock offset 401 ms"]);
    expect(judge({ book: 15_001 })).toEqual(["book-1 quiet 15001 ms"]);
    expect(judge({ book: "closed" })).toEqual(["book-1 closed"]);
    expect(judge({ book: "never" })).toEqual(["book-1 never framed"]);
    expect(judge({ audit: { rows: 90, agree: 80 } })).toEqual([
      "the price audit 80 of 90 agree",
    ]);
    const beat = heartbeatOf(T0, HEALTHY);
    expect(
      tool.judge({
        ...beat,
        connections: { "trades-1": { open: true, lastFrameAt: T0 } },
      })?.conditions,
    ).toEqual(["no book connection"]);
    const noClock: Record<string, unknown> = { ...beat };
    delete noClock.clock;
    for (const bad of [
      null,
      {},
      noClock,
      { ...beat, time: "now" },
      { ...beat, clock: { minuteStart: T0 } },
      { ...beat, audit: { rows: 90 } },
      { ...beat, connections: { "book-1": { open: "yes", lastFrameAt: T0 } } },
    ]) {
      expect(tool.judge(bad)).toBeNull();
    }
  });

  const harms: [string, Partial<Health>, string][] = [
    [
      "the clock offset above 400 ms",
      { clockMs: 450 },
      "the clock offset 450 ms",
    ],
    [
      "a book connection quiet more than 15 s",
      { book: 16_000 },
      "book-1 quiet 16000 ms",
    ],
    ["a book connection closed", { book: "closed" }, "book-1 closed"],
    [
      "the price audit under 90% agree",
      { audit: { rows: 90, agree: 80 } },
      "the price audit 80 of 90 agree",
    ],
    [
      "a heartbeat older than 60 s",
      { writes: false },
      "the heartbeat 61 s old",
    ],
  ];
  for (const [name, harm, why] of harms) {
    it(`pauses 10 minutes and halves the rate on ${name}`, async () => {
      const w = setup();
      sizingWorld(w.server);
      w.collector.health = { ...HEALTHY, ...harm };
      w.clock.after(5 * MINUTE, () => {
        w.collector.health = { ...HEALTHY };
      });
      expect(await w.run()).toBe(0);
      const pauses = eventsOf(w.store, "pause");
      expect(pauses).toMatchObject([{ why, rate: 1_000_000 }]);
      const pausedAt = Date.parse(pauses[0]?.at ?? "");
      expect(pauses[0]?.until).toBe(iso(pausedAt + 10 * MINUTE));
      expect(fs.readFileSync(fetchFile(w.store, "rate.txt"), "utf8")).toBe(
        "1000000\n",
      );
      expect(
        w.server.calls.filter((c) => c.at < pausedAt + 10 * MINUTE),
      ).toEqual([]);
      expect(manifestOf(w.store).length).toBe(
        SIZING_KEYS.length + FUNDING_READS,
      );
    }, 60_000);
  }

  it("ends a transfer in flight when it pauses, and fetches it again after, at half the rate", async () => {
    const w = setup();
    const key = "node_fills/hourly/20250607/0.lz4";
    w.server.put(key, bytes(4_000_000, 1));
    w.clock.after(25 * SECOND, () => {
      w.collector.health = { ...HEALTHY, audit: { rows: 90, agree: 70 } };
    });
    w.clock.after(4 * MINUTE, () => {
      w.collector.health = { ...HEALTHY };
    });
    expect(await w.run({ rate: 50_000 })).toBe(0);
    const pauses = eventsOf(w.store, "pause");
    expect(pauses).toMatchObject([
      { why: "the price audit 70 of 90 agree", rate: 25_000 },
    ]);
    const pausedAt = Date.parse(pauses[0]?.at ?? "");
    const gets = w.server.calledFor(urlOf(key));
    expect(gets.length).toBe(2);
    expect(gets[0]?.at).toBeLessThan(pausedAt);
    expect(gets[1]?.at).toBeGreaterThanOrEqual(pausedAt + 10 * MINUTE);
    const after = w.server.delivered.filter((d) => d.at > pausedAt);
    expect(after[0]?.at).toBeGreaterThanOrEqual(pausedAt + 10 * MINUTE);
    expect(
      overRate(
        after.filter((d) => d.url === urlOf(key)),
        25_000,
      ),
    ).toBeLessThanOrEqual(25_000 + 64 * 1024);
    expect(fileKeysOf(w.store)).toEqual([key]);
    expect(partsIn(w.store)).toEqual([]);
  }, 60_000);

  it("reads the heartbeat's content once a minute at most, each right after its time moved, and logs every reading", async () => {
    const w = setup();
    sizingWorld(w.server);
    const reads: number[] = [];
    recordFs(fs, ["readFileSync"], (_name, args) => {
      if (args[0] === w.collector.file) reads.push(w.clock.now());
    });
    let lockTouched = 0;
    w.clock.after(10 * MINUTE + 500, () => {
      lockTouched = fs.statSync(fetchFile(w.store, "waveh-fetch.pid")).mtimeMs;
    });
    expect(await w.run()).toBe(0);
    expect(lockTouched).toBe(T0 + 10 * MINUTE);
    expect(reads.length).toBeGreaterThan(10);
    reads.forEach((t, i) => {
      expect((t - T0) % (10 * SECOND)).toBe(0);
      if (i > 0) expect(t - (reads[i - 1] ?? 0)).toBeGreaterThanOrEqual(MINUTE);
    });
    const readings = eventsOf(w.store, "reading");
    expect(readings.length).toBe(reads.length);
    expect(readings[0]).toMatchObject({
      at: iso(T0 + 10 * SECOND),
      ageMs: 0,
      beatAt: iso(T0 + 10 * SECOND),
      clockMs: 110,
      clockMedianMs: 110,
      books: { "book-1": 100 },
      audit: { rows: 90, agree: 90, timingMiss: 0, otherMiss: 0, noBook: 0 },
      auditOkAt: T0 + 10 * SECOND - 300_000,
      stalls: 0,
      stalledMarkets: 0,
      timeouts: 0,
      network: 0,
      conditions: [],
    });
  }, 60_000);

  it("fails closed: three unreadable heartbeats in a row pause it, the third about 2 minutes after the first", async () => {
    const w = setup();
    sizingWorld(w.server);
    w.collector.health = { ...HEALTHY, garbage: true };
    w.clock.after(140 * SECOND, () => {
      w.collector.health = { ...HEALTHY };
    });
    expect(await w.run()).toBe(0);
    const noReadings = eventsOf(w.store, "no reading");
    expect(noReadings.map((l) => [l.at, l.inARow])).toEqual([
      [iso(T0 + 11 * SECOND), 1],
      [iso(T0 + 71 * SECOND), 2],
      [iso(T0 + 131 * SECOND), 3],
    ]);
    expect(eventsOf(w.store, "pause")).toMatchObject([
      { at: iso(T0 + 131 * SECOND), why: "no reading 3 times in a row" },
    ]);
    expect(manifestOf(w.store).length).toBe(SIZING_KEYS.length + FUNDING_READS);
  }, 60_000);

  it("fails closed: no heartbeat pauses it at once, and a fault in the watch pauses it", async () => {
    const gone = setup();
    sizingWorld(gone.server);
    fs.rmSync(gone.collector.file);
    gone.collector.health = { ...HEALTHY, writes: false };
    gone.clock.after(2 * MINUTE, () => {
      gone.collector.health = { ...HEALTHY };
    });
    expect(await gone.run()).toBe(0);
    expect(eventsOf(gone.store, "pause")).toMatchObject([
      { at: iso(T0), why: "no heartbeat" },
    ]);

    const fault = setup();
    sizingWorld(fault.server);
    const stopFile = fetchFile(fault.store, "waveh-fetch.stop");
    const real = fs.existsSync;
    vi.spyOn(fs, "existsSync").mockImplementation((file) => {
      if (file === stopFile && fault.clock.now() === T0 + 30 * SECOND) {
        throw new Error("a fault");
      }
      return real(file);
    });
    expect(await fault.run()).toBe(0);
    expect(eventsOf(fault.store, "pause")).toMatchObject([
      { at: iso(T0 + 30 * SECOND), why: "the watch failed: Error: a fault" },
    ]);
  }, 60_000);

  it("fails closed: a fault in a pause stops it (exit 1)", async () => {
    const w = setup();
    sizingWorld(w.server);
    w.collector.health = { ...HEALTHY, audit: { rows: 90, agree: 0 } };
    const rateFile = fetchFile(w.store, "rate.txt");
    const real = fs.writeFileSync;
    vi.spyOn(fs, "writeFileSync").mockImplementation((file, data, options) => {
      if (file === rateFile) throw new Error("F: is gone");
      real(file, data, options);
    });
    expect(await w.run()).toBe(1);
    expect(eventsOf(w.store, "stopped")).toMatchObject([
      { code: 1, why: "the watch failed: Error: F: is gone" },
    ]);
    expect(w.server.calls).toEqual([]);
  }, 60_000);

  it("stops the day at the third pause in an hour (exit 4), the rate halved twice", async () => {
    const w = setup();
    sizingWorld(w.server);
    w.collector.health = { ...HEALTHY, audit: { rows: 90, agree: 10 } };
    expect(await w.run()).toBe(4);
    const why = "the price audit 10 of 90 agree";
    expect(eventsOf(w.store, "pause")).toMatchObject([
      { at: iso(T0 + 10 * SECOND), why, rate: 1_000_000 },
      { at: iso(T0 + 10 * SECOND + 10 * MINUTE), why, rate: 500_000 },
    ]);
    const stopped = eventsOf(w.store, "stopped");
    expect(stopped).toMatchObject([
      {
        code: 4,
        why: `stopped for the day: 3 pauses in an hour, the last for ${why}`,
      },
    ]);
    expect(within(stopped[0], T0 + 10 * SECOND + 20 * MINUTE)).toBe(true);
    expect(fs.readFileSync(fetchFile(w.store, "rate.txt"), "utf8")).toBe(
      "500000\n",
    );
    expect(w.server.calls).toEqual([]);
  }, 60_000);

  it("keeps a halved rate for the next start until the supervisor raises it", async () => {
    const w = setup();
    for (let h = 0; h < 2; h++) {
      w.server.put(`node_fills/hourly/20250607/${h}.lz4`, bytes(1_500_000, h));
    }
    fs.mkdirSync(path.join(w.store, "fetch"), { recursive: true });
    fs.writeFileSync(fetchFile(w.store, "rate.txt"), "250000\n");
    expect(await w.run()).toBe(0);
    const files = w.server.delivered.filter((d) => d.url.endsWith(".lz4"));
    expect(overRate(files, 250_000)).toBeLessThanOrEqual(250_000 + 64 * 1024);
    fs.writeFileSync(fetchFile(w.store, "rate.txt"), "2000001\n");
    expect(await w.run()).toBe(2);
    expect(eventsOf(w.store, "refused").at(-1)?.why).toMatch(
      /not a rate of 1 to 2000000 bytes a second/,
    );
  }, 60_000);
});

describe("resuming", () => {
  it("after a kill in a file: the .part removed, a torn manifest line cut, a file without its line fetched again, and the store as an uninterrupted run's", async () => {
    const plain = setup();
    sizingWorld(plain.server);
    expect(await plain.run()).toBe(0);

    const killed = setup();
    sizingWorld(killed.server);
    const [, k1, k2] = SIZING_KEYS as [string, string, string];
    killed.server.script(urlOf(k1), {
      stallAfter: 64 * 1024,
      stallMs: 30 * SECOND,
    });
    const part = `${storePath(killed.store, k1)}.part`;
    await killed.clock.abandon(
      tool.run(killed.opts, killed.deps),
      () => fs.existsSync(part) && fs.statSync(part).size === 64 * 1024,
    );
    const manifestFile = path.join(killed.store, "manifest.jsonl");
    fs.appendFileSync(manifestFile, '{"key":"node_fills/hourly/2025');
    fs.writeFileSync(storePath(killed.store, k2), "half a file");
    const dead = spawnSync(process.execPath, ["-e", ""]).pid;
    const clock = new FakeClock(killed.clock.t + MINUTE);
    const pidFile = fetchFile(killed.store, "waveh-fetch.pid");
    fs.writeFileSync(pidFile, `${dead}\n`);
    fs.utimesSync(pidFile, clock.t / SECOND, clock.t / SECOND);
    const server = new FakeServer(clock);
    sizingWorld(server);
    new FakeCollector(clock, killed.collector.file);
    expect(
      await clock.drive(
        tool.run(killed.opts, { ...killed.deps, fetch: server.fetch, clock }),
      ),
    ).toBe(0);

    const kept = (store: string) =>
      manifestOf(store)
        .map(({ key, bytes, etag, lastModified, md5, sha256, request }) => ({
          key,
          bytes,
          etag,
          lastModified,
          md5,
          sha256,
          request,
        }))
        .sort((a, b) => a.key.localeCompare(b.key));
    expect(kept(killed.store)).toEqual(kept(plain.store));
    for (const line of manifestOf(plain.store)) {
      expect(fs.readFileSync(storePath(killed.store, line.key))).toEqual(
        fs.readFileSync(storePath(plain.store, line.key)),
      );
    }
    expect(partsIn(killed.store)).toEqual([]);
    expect(
      eventsOf(killed.store, "removed").map((l) => [l.why, l.file]),
    ).toEqual([
      ["a .part left by a stop", part],
      ["a torn last line", manifestFile],
      [
        "in the store without its manifest line: fetched again, never read",
        storePath(killed.store, k2),
      ],
    ]);
    expect(server.calledFor(urlOf(SIZING_KEYS[0] ?? ""))).toEqual([]);
    expect(fs.existsSync(fetchFile(killed.store, "waveh-fetch.pid"))).toBe(
      false,
    );
  }, 60_000);

  it("refuses a manifest that is not its own: a line not JSON or not a manifest line, or a key twice, ends the run (exit 1) before any request", async () => {
    const line = (key: string) =>
      JSON.stringify({
        key,
        bytes: 1,
        etag: null,
        lastModified: null,
        md5: "0".repeat(32),
        sha256: "0".repeat(64),
        fetchedAt: iso(T0),
      });
    for (const [text, why] of [
      [`${line("a")}\nnot json\n${line("b")}\n`, "line 2 is not JSON"],
      [
        `${line("a")}\n{"key":"b","bytes":-1}\n`,
        "line 2 is not a manifest line",
      ],
      [`${line("a")}\n${line("a")}\n`, "a twice"],
    ] as const) {
      const w = setup();
      sizingWorld(w.server);
      fs.mkdirSync(w.store, { recursive: true });
      fs.writeFileSync(path.join(w.store, "manifest.jsonl"), text);
      expect(await w.run()).toBe(1);
      expect(eventsOf(w.store, "crash")[0]?.why).toContain(why);
      expect(w.server.calls).toEqual([]);
      expect(
        fs.readFileSync(path.join(w.store, "manifest.jsonl"), "utf8"),
      ).toBe(text);
    }
  }, 60_000);

  it("never opens a data file for reading: in the store only the manifest and the pid file are read", async () => {
    const w = setup();
    sizingWorld(w.server);
    const calls: { name: string; file: string; flags: unknown }[] = [];
    const record = (name: string, args: unknown[]) => {
      calls.push({ name, file: String(args[0]), flags: args[1] });
    };
    recordFs(
      fs,
      [
        "readFileSync",
        "openSync",
        "readSync",
        "createReadStream",
        "readFile",
        "open",
      ],
      record,
    );
    recordFs(fs.promises, ["readFile", "open"], record);
    expect(await w.run()).toBe(0);
    expect(await w.run()).toBe(0);
    const inStore = calls.filter((c) => c.file.startsWith(w.store));
    const pidFile = path.join("fetch", "waveh-fetch.pid");
    const parts = inStore.filter(
      (c) => c.name === "openSync" && c.flags === "w",
    );
    expect(parts.length).toBe(SIZING_KEYS.length + FUNDING_READS);
    expect(parts.every((c) => c.file.endsWith(".part"))).toBe(true);
    const locks = inStore.filter(
      (c) => c.name === "openSync" && c.flags === "wx",
    );
    expect(locks.map((c) => path.relative(w.store, c.file))).toEqual([
      pidFile,
      pidFile,
    ]);
    expect(
      new Set(
        inStore
          .filter((c) => !parts.includes(c) && !locks.includes(c))
          .map((c) => `${c.name} ${path.relative(w.store, c.file)}`),
      ),
    ).toEqual(
      new Set(["readFileSync manifest.jsonl", `readFileSync ${pidFile}`]),
    );
  }, 60_000);
});

describe("the checks", () => {
  it("keep a file only when its bytes agree with the listing: its MD5 the single-part ETag, its size where multipart; else once more, then bad", async () => {
    const w = setup();
    const key = (h: number) => `node_fills/hourly/20250607/${h}.lz4`;
    const multipart = "0123456789abcdef0123456789abcdef";
    w.server.put(key(0), bytes(50_000, 1));
    w.server.put(key(1), bytes(50_000, 2), md5(bytes(50_000, 3)));
    w.server.put(key(2), bytes(50_000, 4), `${multipart}-7`);
    w.server.put(key(3), bytes(50_000, 5), `${multipart}-2`);
    w.server.script(urlOf(key(3)), { body: bytes(40_000, 5) });
    w.server.put(key(4), bytes(50_000, 6));
    w.server.script(
      urlOf(key(4)),
      { body: bytes(60_000, 6) },
      { body: bytes(60_000, 6) },
    );
    w.server.put(key(5), bytes(50_000, 7));
    const other = md5(bytes(1, 0));
    w.server.script(urlOf(key(5)), { etag: other }, { etag: other });
    const [w0, w1] = tool.fundingWindows(true) as [Window, Window];
    w.server.script(
      tool.fundingBody("SOL", w0),
      { contentType: "text/html" },
      { contentType: "text/html" },
    );
    w.server.script(
      tool.fundingBody("SOL", w1),
      { body: Buffer.alloc(0) },
      { body: Buffer.alloc(0) },
    );
    expect(await w.run()).toBe(0);
    expect(fileKeysOf(w.store)).toEqual([key(0), key(2), key(3)]);
    expect(manifestOf(w.store).find((l) => l.key === key(2))).toMatchObject({
      etag: `${multipart}-7`,
      md5: md5(bytes(50_000, 4)),
    });
    expect(problemsOf(w.store)).toMatchObject([
      {
        key: key(1),
        problem: "bad",
        detail: `the MD5 ${md5(bytes(50_000, 2))}, the ETag ${md5(bytes(50_000, 3))}`,
      },
      { key: key(4), problem: "bad", detail: "more than 50000 bytes" },
      {
        key: key(5),
        problem: "bad",
        detail: `the reply's ETag "${other}", the listing's "${md5(bytes(50_000, 7))}"`,
      },
      {
        key: `info/fundingHistory/SOL/${w0.start}.json`,
        problem: "bad",
        detail: "the content type text/html",
      },
      {
        key: `info/fundingHistory/SOL/${w1.start}.json`,
        problem: "bad",
        detail: "an empty reply",
      },
    ]);
    expect(
      [0, 1, 2, 3, 4, 5].map((h) => w.server.calledFor(urlOf(key(h))).length),
    ).toEqual([1, 2, 1, 2, 2, 2]);
    expect(
      eventsOf(w.store, "mismatch").find((l) => l.key === key(3)),
    ).toMatchObject({
      why: "40000 bytes, the listing's 50000",
      attempt: 1,
    });
    for (const h of [1, 4, 5])
      expect(fs.existsSync(storePath(w.store, key(h)))).toBe(false);
    expect(partsIn(w.store)).toEqual([]);
  }, 60_000);
});

describe("the limits", () => {
  it("stop the run at the floor on the store's disk and at the cap, before the request (exit 4)", async () => {
    const floor = setup();
    sizingWorld(floor.server);
    floor.disk.bsize = 1;
    floor.disk.bavail = tool.FLOOR + 100_000;
    expect(await floor.run()).toBe(4);
    expect(eventsOf(floor.store, "stopped")).toMatchObject([
      {
        code: 4,
        why: "stopped at the floor: 200.0 GiB free on the store's disk, 200.0 GiB kept",
      },
    ]);
    expect(
      floor.server.calls.every((c) => new URL(c.url).pathname === "/"),
    ).toBe(true);

    const cap = setup();
    sizingWorld(cap.server);
    fs.mkdirSync(cap.store, { recursive: true });
    fs.writeFileSync(
      path.join(cap.store, "manifest.jsonl"),
      `${JSON.stringify({ key: "elsewhere", bytes: 10 ** 12, etag: null, lastModified: null, md5: "0".repeat(32), sha256: "0".repeat(64), fetchedAt: iso(T0) })}\n`,
    );
    expect(await cap.run()).toBe(4);
    expect(eventsOf(cap.store, "stopped")[0]?.why).toMatch(
      /^stopped at the cap: 1000000000000 B stored, 120000 B more would pass \d+ B$/,
    );
    expect(cap.server.calls.every((c) => new URL(c.url).pathname === "/")).toBe(
      true,
    );
  }, 60_000);
});

describe("the stop file", () => {
  it("stops the run when it is there at the start, within a second in a transfer or a pause, with no .part left (exit 0)", async () => {
    const stop = (store: string) => {
      fs.mkdirSync(path.join(store, "fetch"), { recursive: true });
      fs.writeFileSync(fetchFile(store, "waveh-fetch.stop"), "");
    };
    const start = setup();
    sizingWorld(start.server);
    stop(start.store);
    expect(await start.run()).toBe(0);
    expect(start.server.calls).toEqual([]);
    expect(eventsOf(start.store, "stopped")).toMatchObject([
      { code: 0, why: "the stop file was there at the start" },
    ]);

    const transfer = setup();
    const key = "node_fills/hourly/20250607/0.lz4";
    transfer.server.put(key, bytes(2_000_000, 1));
    transfer.clock.after(30 * SECOND, () => stop(transfer.store));
    expect(await transfer.run({ rate: 50_000 })).toBe(0);
    const stopped = eventsOf(transfer.store, "stopped");
    expect(stopped).toMatchObject([{ code: 0, why: "the stop file" }]);
    expect(within(stopped[0], T0 + 30 * SECOND)).toBe(true);
    expect(transfer.server.calledFor(urlOf(key))[0]?.at).toBeLessThan(
      T0 + 30 * SECOND,
    );
    expect(
      transfer.server.delivered.every((d) => d.at <= T0 + 30 * SECOND),
    ).toBe(true);
    expect(partsIn(transfer.store)).toEqual([]);
    expect(manifestOf(transfer.store)).toEqual([]);
    expect(fs.existsSync(storePath(transfer.store, key))).toBe(false);

    const paused = setup();
    sizingWorld(paused.server);
    paused.collector.health = { ...HEALTHY, audit: { rows: 90, agree: 0 } };
    paused.clock.after(3 * MINUTE, () => stop(paused.store));
    expect(await paused.run()).toBe(0);
    const pausedStop = eventsOf(paused.store, "stopped");
    expect(pausedStop).toMatchObject([{ code: 0, why: "the stop file" }]);
    expect(within(pausedStop[0], T0 + 3 * MINUTE)).toBe(true);
    expect(paused.server.calls).toEqual([]);
  }, 60_000);
});

describe("the runner", () => {
  it("runs one instance: a live process's fresh pid file refuses a start (exit 3); a stale one is taken over", async () => {
    const w = setup();
    sizingWorld(w.server);
    const pidFile = fetchFile(w.store, "waveh-fetch.pid");
    fs.mkdirSync(path.dirname(pidFile), { recursive: true });
    fs.writeFileSync(pidFile, `${process.ppid}\n`);
    fs.utimesSync(pidFile, T0 / SECOND, T0 / SECOND);
    expect(await w.run()).toBe(3);
    expect(w.server.calls).toEqual([]);
    expect(fs.readFileSync(pidFile, "utf8")).toBe(`${process.ppid}\n`);
    expect(eventsOf(w.store, "refused")).toMatchObject([
      { why: `another instance runs (pid ${process.ppid})` },
    ]);
    const stale = (T0 - 3 * MINUTE) / SECOND;
    fs.utimesSync(pidFile, stale, stale);
    expect(await w.run()).toBe(0);
    expect(fs.existsSync(pidFile)).toBe(false);
  }, 60_000);

  it("--plan lists and prints what would come down, with bytes, and fetches nothing", async () => {
    const w = setup();
    sizingWorld(w.server);
    for (let h = 0; h < 24; h++) {
      w.server.put(`node_fills/hourly/20250608/${h}.lz4`, bytes(1_000, h));
    }
    w.server.put("node_fills/hourly/20250610/0.lz4", bytes(1_000, 1));
    expect(await w.run({ plan: true })).toBe(0);
    expect(w.server.calls.every((c) => new URL(c.url).pathname === "/")).toBe(
      true,
    );
    expect(w.out.join("")).toBe(
      [
        "WAVE-H's download: the sizing months only",
        "node_fills: 28 files 385000 B (0.00 GB); in the store 0; to fetch 28, 385000 B (0.00 GB); node_fills/hourly/20250607/0.lz4 to node_fills/hourly/20250610/0.lz4; 0 multipart; days without 24 files: 2025-06-07 3, 2025-06-09 0, 2025-06-10 1",
        "node_fills_by_block: 1 files 80000 B (0.00 GB); in the store 0; to fetch 1, 80000 B (0.00 GB); node_fills_by_block/hourly/20250728/5.lz4 to node_fills_by_block/hourly/20250728/5.lz4; 0 multipart; days without 24 files: 2025-07-28 1",
        "asset_ctxs: 1 files 40000 B (0.00 GB); in the store 0; to fetch 1, 40000 B (0.00 GB); asset_ctxs/20250601.csv.lz4 to asset_ctxs/20250601.csv.lz4; 0 multipart",
        "funding: 152 reads (at most) 39845888 B (0.04 GB); in the store 0; to fetch 152, 39845888 B (0.04 GB)",
        "in all: 40350888 B (0.04 GB) planned, the cap 41157906 B (0.04 GB); to fetch 40350888 B (0.04 GB); 4096.0 GiB free on the store's disk, the floor 200.0 GiB",
        "",
      ].join("\n"),
    );
    expect(manifestOf(w.store)).toEqual([]);
  }, 60_000);

  it("takes --store and --heartbeat, --sizing-only, --plan and a --rate from 1 to 2000000", () => {
    expect(tool.parseArgs(["--store", "s", "--heartbeat", "h"])).toEqual({
      store: path.resolve("s"),
      heartbeat: path.resolve("h"),
      sizingOnly: false,
      plan: false,
      rate: null,
    });
    expect(
      tool.parseArgs([
        "--sizing-only",
        "--plan",
        "--rate",
        "500000",
        "--store",
        "s",
        "--heartbeat",
        "h",
      ]),
    ).toEqual({
      store: path.resolve("s"),
      heartbeat: path.resolve("h"),
      sizingOnly: true,
      plan: true,
      rate: 500_000,
    });
    for (const argv of [
      [],
      ["--store", "s"],
      ["--store", "s", "--heartbeat"],
      ["--store", "s", "--heartbeat", "h", "--rate", "0"],
      ["--store", "s", "--heartbeat", "h", "--rate", "1.5"],
      ["--store", "s", "--heartbeat", "h", "--fast"],
    ]) {
      expect(() => tool.parseArgs(argv), argv.join(" ")).toThrow();
    }
  });
});
