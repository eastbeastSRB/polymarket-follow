"use strict";
/**
 * WAVE-H's download (decisions 2026-11-14, "WAVE-H's download spec"; the
 * plan, docs/reviews/wave-h-plan-2026-11-13.md section 3, with its review's
 * D1-D8): the plan's files of Hyperliquid's archive from AWS's keyless public
 * bucket and the 38 coins' settled funding from Hyperliquid's public info
 * API, into the store on F:, beside the live collector on the same line.
 * Plain Node 24, no package, never part of a frozen program. It hashes bytes
 * and never decodes or parses a data file: the test months are stored
 * unopened.
 *
 *   node tools/waveh-fetch.cjs --store <dir> --heartbeat <file>
 *     [--sizing-only] [--plan] [--rate <bytes a second, at most 2000000>]
 *     [--books <file>]
 *
 * The dates: nothing before 2025-05-25T00:00Z; DATA END is
 * 2026-05-29T01:00:00.000Z, and the hourly file of its own hour (2026-05-29
 * 01h) is the last one admitted, because a file holds its writer's hour
 * (plan H1); a daily file and a funding window end before DATA END.
 * --sizing-only keeps to files dated 2025-05-25 to 2025-07-31 and the
 * windows before 2025-08-01 (the first session); --plan lists and prints
 * what would come down; --rate may only lower the rate.
 *
 * --books <file> fetches only the book files a file names, a key a line
 * (`market_data/<YYYYMMDD>/<h>/l2Book/<COIN>.lz4`, one of the 38 coins, of
 * the plan's dates, before the seal with --sizing-only: the rehearsal's legs;
 * the look's after the freeze), under the same gate: each hour folder listed,
 * each key the listing holds fetched and checked as any file, into the
 * store's `books.jsonl` (a manifest line each), and each key its folder's
 * listing lacks written there as missing. Nothing else is requested. Its cap,
 * 1.02 times its listed bytes, counts its own keys' bytes only, for
 * `books.jsonl` keeps earlier runs' books.
 *
 * tools/waveh-fetch-start.ps1 starts it detached at idle priority; the stop
 * file stops it. In the store: the bucket's keys mirrored below ROOT,
 * info/fundingHistory/<coin>/<window start ms>.json, manifest.jsonl, and the
 * tool's own fetch/ (the pid file, which is its lock; the stop file;
 * rate.txt, the rate each pause halves, which the supervisor raises by
 * editing or deleting it before a start; problems.jsonl, the keys missing,
 * bad or changed; log/<UTC date>.jsonl). Exit codes: 0 done, or
 * stopped by the stop file; 1 a crash or an abort (a request outside the
 * guard, a redirect, an unexpected reply); 2 bad settings; 3 another
 * instance runs; 4 stopped for the day (the error ladder, three pauses in an
 * hour) or at the floor or the cap: the supervisor restarts it.
 */
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const BUCKET = "https://aws-public-blockchain.s3.us-east-2.amazonaws.com";
const ROOT = "v1.1/hyperliquid/mainnet/";
const INFO = "https://api.hyperliquid.xyz/info";
const USER_AGENT = "research-check/1.0";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const FIRST = Date.UTC(2025, 4, 25);
/** TEST's first day: from it on, the store is sealed (decisions 2026-11-13, the owner's advance approval). */
const SEAL = Date.UTC(2025, 7, 1);
const TEST_END = Date.UTC(2026, 4, 28);
const DATA_END = Date.UTC(2026, 4, 29, 1);

/** MARKET-1's 38 small coins by Hyperliquid's names (plan H3). */
const COINS =
  `SOL HYPE PUMP ZEC XRP LIT kPEPE AAVE UNI WLD NEAR kSHIB FARTCOIN DOGE ENA
  ONDO SUI VVV TAO ADA ZRO BNB PONS CASHCAT USELESS KAITO ARB LDO AVAX LTC XPL
  XMR LINK VIRTUAL JUP ETHFI PENDLE MORPHO`.split(/\s+/);

/** The plan's prefixes under ROOT (section 3.1), each listed month by month. */
const PARTS = [
  {
    name: "node_fills",
    dir: "node_fills/hourly/",
    months: months("202505", "202507"),
    hourly: true,
  },
  {
    name: "node_fills_by_block",
    dir: "node_fills_by_block/hourly/",
    months: months("202507", "202605"),
    hourly: true,
  },
  {
    name: "asset_ctxs",
    dir: "asset_ctxs/",
    months: months("202505", "202605"),
    hourly: false,
  },
];

const MAX_RATE = 2_000_000;
const FLOOR = 200 * 2 ** 30;
const CAP = 1.02;
const GAP_MS = SECOND;
const FUNDING_GAP_MS = 6 * SECOND;
/** A fundingHistory reply's bytes at most: a full window of 480 rows was 43,018 B (the review, D5). */
const FUNDING_MAX = 256 * 1024;
const LISTING_MAX = 4 * 2 ** 20;
const IDLE_MS = 60 * SECOND;
const LADDER_MS = [30 * SECOND, 2 * MINUTE, 10 * MINUTE];
const RENAME_TRIES = 10;
/** The UTC minutes of the day in which nothing is requested: 02:30-06:00 and 10:25-11:15. */
const WINDOWS = [
  [150, 360],
  [625, 675],
];
const WATCH = {
  ageMs: 60 * SECOND,
  clockMs: 400,
  quietMs: 15 * SECOND,
  agree: 0.9,
  everyMs: MINUTE,
  noReadings: 3,
  pauseMs: 10 * MINUTE,
  pausesToStop: 3,
};
/** The tool touches its pid file every minute; one untouched for 3 minutes holds no lock. */
const LOCK_FRESH_MS = 3 * MINUTE;

class Stop extends Error {
  constructor(code, why) {
    super(why);
    this.code = code;
  }
}
class Abort extends Error {}
class Settings extends Error {}

const iso = (ms) => new Date(ms).toISOString();
const gib = (bytes) => (bytes / 2 ** 30).toFixed(1);
const gb = (bytes) => `${bytes} B (${(bytes / 1e9).toFixed(2)} GB)`;

/** "YYYYMM" from one month to another, both included. */
function months(from, to) {
  const index = (ym) => Number(ym.slice(0, 4)) * 12 + Number(ym.slice(4)) - 1;
  const out = [];
  for (let i = index(from); i <= index(to); i++) {
    out.push(`${Math.floor(i / 12)}${String((i % 12) + 1).padStart(2, "0")}`);
  }
  return out;
}

const monthOk = (month, sizingOnly) =>
  !sizingOnly ||
  Date.UTC(Number(month.slice(0, 4)), Number(month.slice(4)) - 1) < SEAL;

/** The instant a name below its part's folder dates (its hour, or its day), or null when it is not the part's shape. */
function keyTime(part, name) {
  const m = part.hourly
    ? /^(\d{4})(\d{2})(\d{2})\/(0|[1-9]\d?)\.lz4$/.exec(name)
    : /^(\d{4})(\d{2})(\d{2})\.csv\.lz4$/.exec(name);
  if (m === null) return null;
  const [y, mo, d, h] = [m[1], m[2], m[3], m[4] ?? "0"].map(Number);
  const t = Date.UTC(y, mo - 1, d, h);
  const back = new Date(t);
  // An hour past 23 or a day past the month's end rolls the date, so the round trip refuses both.
  return back.getUTCFullYear() === y &&
    back.getUTCMonth() === mo - 1 &&
    back.getUTCDate() === d
    ? t
    : null;
}

/** The date guard: whether a file may come down (the header gives the rule). */
function admitted(part, name, sizingOnly) {
  const t = keyTime(part, name);
  if (t === null || t < FIRST) return false;
  if (sizingOnly) return t < SEAL;
  return part.hourly ? t <= DATA_END : t < DATA_END;
}

/** fundingHistory's windows (D5): aligned to the seal, so that none straddles it; the last ends at DATA END. */
function fundingWindows(sizingOnly) {
  const edges = [
    FIRST,
    Date.UTC(2025, 5, 14),
    Date.UTC(2025, 6, 4),
    Date.UTC(2025, 6, 24),
    SEAL,
  ];
  for (let t = SEAL + 20 * DAY; t <= TEST_END; t += 20 * DAY) edges.push(t);
  edges.push(DATA_END);
  const windows = edges.slice(1).map((end, i) => ({ start: edges[i], end }));
  return sizingOnly ? windows.filter((w) => w.end <= SEAL) : windows;
}

/** The read of one window, its end made exclusive whether the API's end is inclusive or not. */
const fundingBody = (coin, w) =>
  JSON.stringify({
    type: "fundingHistory",
    coin,
    startTime: w.start,
    endTime: w.end - 1,
  });

/** A book file's hour (plan H8, H15): `market_data/<YYYYMMDD>/<h>/l2Book/<COIN>.lz4` of one of the 38 coins, else null. */
function bookTime(key) {
  const m = /^market_data\/(\d{8})\/(0|[1-9]\d?)\/l2Book\/([^/]+)\.lz4$/.exec(
    key,
  );
  if (m === null || !COINS.includes(m[3])) return null;
  return keyTime({ hourly: true }, `${m[1]}/${m[2]}.lz4`);
}

const bookFolder = (key) => key.slice(0, key.lastIndexOf("/") + 1);

/** The book files a --books file names, a key a line: each of the plan's dates, before the seal with --sizing-only. */
function readBooks(file, sizingOnly) {
  const keys = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  for (const key of keys) {
    const t = bookTime(key);
    if (t === null || t < FIRST || t > DATA_END || (sizingOnly && t >= SEAL))
      throw new Settings(
        `--books: "${key.slice(0, 120)}" is not a book file of the plan's dates`,
      );
  }
  return new Set(keys);
}

function listingUrl(prefix, token) {
  const q = new URLSearchParams({
    "list-type": "2",
    prefix,
    "max-keys": "1000",
  });
  if (token !== null) q.set("continuation-token", token);
  return `${BUCKET}/?${q}`;
}

function listingOk(q, sizingOnly, books) {
  const names = [...q.keys()].sort().join(",");
  const prefix = q.get("prefix");
  return (
    (names === "list-type,max-keys,prefix" ||
      names === "continuation-token,list-type,max-keys,prefix") &&
    q.get("list-type") === "2" &&
    q.get("max-keys") === "1000" &&
    (books === null
      ? PARTS.some((p) =>
          p.months.some(
            (m) => monthOk(m, sizingOnly) && prefix === `${ROOT}${p.dir}${m}`,
          ),
        )
      : [...books].some((k) => prefix === `${ROOT}${bookFolder(k)}`))
  );
}

/**
 * The guard on every request: a listing of a planned month, a GET of an
 * admitted key, or a planned fundingHistory read; with --books, only a
 * listing of a needed key's hour folder and a GET of a needed key. Anything
 * else, /exchange among it, ends the run.
 */
function checkRequest(url, method, body, sizingOnly, books = null) {
  let ok = false;
  if (method === "POST") {
    ok =
      books === null &&
      url === INFO &&
      fundingWindows(sizingOnly).some((w) =>
        COINS.some((coin) => fundingBody(coin, w) === body),
      );
  } else if (
    books !== null &&
    method === "GET" &&
    body === undefined &&
    url.startsWith(`${BUCKET}/`)
  ) {
    const u = new URL(url);
    ok =
      u.hash === "" &&
      (u.pathname === "/"
        ? listingOk(u.searchParams, sizingOnly, books)
        : u.search === "" &&
          u.pathname.startsWith(`/${ROOT}`) &&
          books.has(u.pathname.slice(1 + ROOT.length)));
  } else if (
    method === "GET" &&
    body === undefined &&
    url.startsWith(`${BUCKET}/`)
  ) {
    const u = new URL(url);
    ok =
      u.hash === "" &&
      (u.pathname === "/"
        ? listingOk(u.searchParams, sizingOnly, null)
        : u.search === "" &&
          PARTS.some(
            (p) =>
              u.pathname.startsWith(`/${ROOT}${p.dir}`) &&
              admitted(
                p,
                u.pathname.slice(1 + ROOT.length + p.dir.length),
                sizingOnly,
              ),
          ));
  }
  if (!ok) throw new Abort(`refused, outside the guard: ${method} ${url}`);
}

const XML = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
const unescapeXml = (s) =>
  s === null ? null : s.replace(/&(amp|lt|gt|quot|apos);/g, (_, n) => XML[n]);

/**
 * A ListObjectsV2 page, validated (D6; Iron Rule 3): a page that is not one
 * throws; an entry with a bad key, size, ETag or time is dropped and
 * returned for the log. ETags are kept without their quotes.
 */
function parseListing(xml, prefix) {
  const one = (text, name) => {
    const all = [
      ...text.matchAll(new RegExp(`<${name}>([^<]*)</${name}>`, "g")),
    ];
    return all.length === 1 ? all[0][1] : null;
  };
  if (
    !/^<\?xml[^>]*>\s*<ListBucketResult[\s>]/.test(xml) ||
    !xml.trimEnd().endsWith("</ListBucketResult>")
  ) {
    throw new Error("not a ListBucketResult");
  }
  const blocks = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map(
    (m) => m[1],
  );
  const head = xml.replace(/<Contents>[\s\S]*?<\/Contents>/g, "");
  if (
    one(head, "Name") !== "aws-public-blockchain" ||
    unescapeXml(one(head, "Prefix")) !== prefix
  ) {
    throw new Error("another bucket or prefix");
  }
  if (one(head, "KeyCount") !== String(blocks.length))
    throw new Error("KeyCount is not the entries' count");
  const truncated = one(head, "IsTruncated");
  const next = unescapeXml(one(head, "NextContinuationToken"));
  if (truncated !== "true" && truncated !== "false")
    throw new Error("no IsTruncated");
  if (truncated === "true" && !next)
    throw new Error("truncated without a continuation token");
  const entries = [];
  const dropped = [];
  for (const block of blocks) {
    const key = unescapeXml(one(block, "Key"));
    const size = one(block, "Size");
    const etag = /^"([0-9a-f]{32}(?:-[1-9]\d{0,4})?)"$/.exec(
      unescapeXml(one(block, "ETag")) ?? "",
    );
    const lastModified = one(block, "LastModified");
    if (
      key !== null &&
      key.startsWith(prefix) &&
      /^[1-9]\d{0,11}$/.test(size ?? "") &&
      etag !== null &&
      /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d{1,3})?Z$/.test(lastModified ?? "")
    ) {
      entries.push({ key, size: Number(size), etag: etag[1], lastModified });
    } else {
      dropped.push(block.slice(0, 300));
    }
  }
  return { entries, next: truncated === "true" ? next : null, dropped };
}

/** The end of the pause window `now` falls in, or null. */
function windowEnd(now) {
  const day = now - (now % DAY);
  const minute = Math.floor((now - day) / MINUTE);
  for (const [from, to] of WINDOWS) {
    if (minute >= from && minute < to) return day + to * MINUTE;
  }
  return null;
}

/** The token bucket: `rate` bytes a second, one second's bytes at most in a burst. */
class Bucket {
  constructor(rate, now) {
    this.rate = rate;
    this.tokens = rate;
    this.at = now;
  }

  /** Takes n bytes; returns the ms to wait before taking more. */
  take(n, now) {
    this.tokens =
      Math.min(
        this.rate,
        this.tokens + ((now - this.at) * this.rate) / SECOND,
      ) - n;
    this.at = now;
    return this.tokens >= 0
      ? 0
      : Math.ceil((-this.tokens * SECOND) / this.rate);
  }

  setRate(rate) {
    this.rate = rate;
    this.tokens = Math.min(this.tokens, rate);
  }
}

/**
 * A heartbeat's content conditions (D2, the collector's own rules in
 * apps/poller/src/health/status.ts): the clock offset above 400 ms; a book
 * connection closed, never framed or quiet more than 15 s before the
 * heartbeat's own time, or none; the latest price audit's agree under 90% of
 * its rows. Null when the fields are not the heartbeat's
 * (apps/poller/src/health/heartbeat.ts, `Heartbeat`).
 */
function judge(beat) {
  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const isObj = (v) => typeof v === "object" && v !== null;
  if (!isObj(beat) || !isNum(beat.time) || !isObj(beat.connections))
    return null;
  const books = Object.entries(beat.connections).filter(([name]) =>
    name.startsWith("book-"),
  );
  const shaped = books.every(
    ([, c]) =>
      isObj(c) &&
      typeof c.open === "boolean" &&
      (c.lastFrameAt === null || isNum(c.lastFrameAt)),
  );
  const { clock, audit } = beat;
  if (
    !shaped ||
    (clock !== null && !(isObj(clock) && isNum(clock.minOffsetMs))) ||
    (audit !== null &&
      !(isObj(audit) && isNum(audit.rows) && isNum(audit.agree)))
  ) {
    return null;
  }
  const conditions = [];
  if (clock !== null && clock.minOffsetMs > WATCH.clockMs) {
    conditions.push(`the clock offset ${clock.minOffsetMs} ms`);
  }
  if (books.length === 0) conditions.push("no book connection");
  const quiet = {};
  for (const [name, c] of books) {
    quiet[name] = !c.open
      ? "closed"
      : c.lastFrameAt === null
        ? "never framed"
        : beat.time - c.lastFrameAt;
    if (typeof quiet[name] === "string")
      conditions.push(`${name} ${quiet[name]}`);
    else if (quiet[name] > WATCH.quietMs)
      conditions.push(`${name} quiet ${quiet[name]} ms`);
  }
  if (audit !== null && audit.agree < WATCH.agree * audit.rows) {
    conditions.push(`the price audit ${audit.agree} of ${audit.rows} agree`);
  }
  return {
    conditions,
    fields: {
      beatAt: iso(beat.time),
      clockMs: clock === null ? null : clock.minOffsetMs,
      books: quiet,
      audit,
      auditOkAt: beat.jobs?.["price-audit"]?.lastOkAt ?? null,
      stalls: beat.streams?.stalls ?? null,
      stalledMarkets: beat.streams?.stalledMarkets ?? null,
      timeouts: beat.rest?.timeouts ?? null,
      network: beat.rest?.network ?? null,
    },
  };
}

/**
 * The watch on the collector (D1, D2): the heartbeat's time by stat every
 * second, which cannot block the collector's rename; its content read once a
 * minute at most, right after its time moved (the next rename is then about
 * 9 s away), a failed read tried once more after 1 s. Every reading is
 * logged.
 */
class Watch {
  constructor(file, log) {
    this.file = file;
    this.log = log;
    this.mtime = null;
    this.readAt = null;
    this.retryAt = null;
    this.noReadings = 0;
    this.reading = null;
    this.day = null;
    this.offsets = [];
  }

  tick(now) {
    let mtime = null;
    try {
      mtime = fs.statSync(this.file).mtimeMs;
    } catch {
      // No time this second: the heartbeat's age grows.
    }
    const moved = mtime !== null && this.mtime !== null && mtime !== this.mtime;
    if (mtime !== null) this.mtime = mtime;
    if (this.retryAt !== null) {
      if (now >= this.retryAt) this.read(now, true);
    } else if (
      moved &&
      (this.readAt === null || now - this.readAt >= WATCH.everyMs)
    ) {
      this.read(now, false);
    }
  }

  read(now, retry) {
    this.retryAt = null;
    if (!retry) this.readAt = now;
    let reading = null;
    let why = "not the heartbeat's shape";
    try {
      reading = judge(JSON.parse(fs.readFileSync(this.file, "utf8")));
    } catch (err) {
      why = err.code ?? err.message;
    }
    if (reading === null) {
      if (!retry) {
        this.retryAt = now + SECOND;
        return;
      }
      this.noReadings += 1;
      this.log("no reading", { why, inARow: this.noReadings });
      return;
    }
    this.noReadings = 0;
    this.reading = { ...reading, at: now };
    this.log("reading", {
      ageMs: now - this.mtime,
      ...reading.fields,
      clockMedianMs: this.median(now, reading.fields.clockMs),
      conditions: reading.conditions,
    });
  }

  /** The median of the UTC day's clock offsets (D2: beside each reading). */
  median(now, value) {
    const day = iso(now).slice(0, 10);
    if (day !== this.day) {
      this.day = day;
      this.offsets = [];
    }
    if (value !== null) this.offsets.push(value);
    const sorted = [...this.offsets].sort((a, b) => a - b);
    return sorted.length === 0 ? null : sorted[Math.floor(sorted.length / 2)];
  }

  /**
   * The conditions that pause the download now, and whether the watch is
   * clear: no condition, on a reading taken at or after `since` (a pause's
   * end). An older reading neither pauses nor clears: one up to a minute old
   * re-paused the run on 2026-11-15 00:18Z, the audit recovered.
   */
  verdict(now, since) {
    const conditions = [];
    if (this.mtime === null) conditions.push("no heartbeat");
    else if (now - this.mtime > WATCH.ageMs) {
      conditions.push(
        `the heartbeat ${Math.round((now - this.mtime) / SECOND)} s old`,
      );
    }
    if (this.noReadings >= WATCH.noReadings)
      conditions.push(`no reading ${this.noReadings} times in a row`);
    const fresh = this.reading !== null && this.reading.at >= since;
    if (fresh) conditions.push(...this.reading.conditions);
    return { conditions, clear: conditions.length === 0 && fresh };
  }
}

/** The bytes kept in memory (a listing page). */
function memorySink() {
  const chunks = [];
  return {
    write: (chunk) => chunks.push(chunk),
    end: () => Buffer.concat(chunks),
    discard: () => {},
  };
}

/** The bytes written to `<file>.part`, flushed at the end; a discarded one is removed. */
function partSink(part) {
  fs.mkdirSync(path.dirname(part), { recursive: true });
  const fd = fs.openSync(part, "w");
  let open = true;
  const close = () => {
    if (open) {
      open = false;
      fs.closeSync(fd);
    }
  };
  return {
    write: (chunk) => {
      for (let at = 0; at < chunk.length;) at += fs.writeSync(fd, chunk, at);
    },
    end: () => {
      fs.fsyncSync(fd);
      close();
      return null;
    },
    discard: () => {
      close();
      fs.rmSync(part, { force: true });
    },
  };
}

/** D6's classes of a reply that is not HTTP 200; a redirect or anything unforeseen ends the run. */
function statusClass(status, url) {
  if (status === 403 || status === 404) return { kind: "missing", status };
  if (status === 429 || status >= 500)
    return { kind: "error", why: `HTTP ${status}: ${url}` };
  throw new Abort(
    `HTTP ${status}${status >= 300 && status < 400 ? ", a redirect," : ""} from ${url}`,
  );
}

/** Why a reply's bytes are not the listed file's, or not a fundingHistory reply's; null when they agree. */
function disagreement(item, r) {
  if (item.kind === "funding") {
    if (!/^application\/json\b/.test(r.contentType ?? ""))
      return `the content type ${r.contentType}`;
    return r.bytes === 0 ? "an empty reply" : null;
  }
  if (r.bytes !== item.size)
    return `${r.bytes} bytes, the listing's ${item.size}`;
  if (r.etag !== `"${item.etag}"`)
    return `the reply's ETag ${r.etag}, the listing's "${item.etag}"`;
  if (!item.etag.includes("-") && r.md5 !== item.etag)
    return `the MD5 ${r.md5}, the ETag ${item.etag}`;
  return null;
}

/**
 * The manifest (store/manifest.jsonl, a line a file): a torn last line, left
 * by a stop in its write, is cut off; any other line that is not ours throws.
 */
class Manifest {
  /** `missing`: the book list, whose lines may also name a key its folder's listing lacks. */
  constructor(file, log, missing = false) {
    this.file = file;
    this.lines = new Map();
    this.missing = new Set();
    this.bytes = 0;
    if (!fs.existsSync(file)) return;
    let text = fs.readFileSync(file, "utf8");
    if (text !== "" && !text.endsWith("\n")) {
      const keep = text.slice(0, text.lastIndexOf("\n") + 1);
      log("removed", {
        file,
        why: "a torn last line",
        line: text.slice(keep.length, keep.length + 300),
      });
      fs.truncateSync(file, Buffer.byteLength(keep));
      text = keep;
    }
    const rows = text.split("\n");
    rows.pop();
    rows.forEach((row, i) => {
      let line;
      try {
        line = JSON.parse(row);
      } catch {
        throw new Error(`${file}: line ${i + 1} is not JSON`);
      }
      if (
        missing &&
        line?.missing === true &&
        typeof line.key === "string" &&
        !this.lines.has(line.key) &&
        !this.missing.has(line.key)
      ) {
        this.missing.add(line.key);
        return;
      }
      if (
        typeof line?.key !== "string" ||
        !Number.isSafeInteger(line.bytes) ||
        line.bytes < 0 ||
        !/^[0-9a-f]{64}$/.test(line.sha256 ?? "")
      ) {
        throw new Error(`${file}: line ${i + 1} is not a manifest line`);
      }
      if (this.lines.has(line.key) || this.missing.has(line.key))
        throw new Error(`${file}: ${line.key} twice`);
      this.lines.set(line.key, line);
      this.bytes += line.bytes;
    });
  }

  add(line) {
    fs.appendFileSync(this.file, `${JSON.stringify(line)}\n`);
    this.lines.set(line.key, line);
    this.bytes += line.bytes;
  }

  addMissing(key, at) {
    fs.appendFileSync(
      this.file,
      `${JSON.stringify({ key, missing: true, listedAt: iso(at) })}\n`,
    );
    this.missing.add(key);
  }
}

function storeFiles(store) {
  const dir = path.join(store, "fetch");
  return {
    logDir: path.join(dir, "log"),
    pid: path.join(dir, "waveh-fetch.pid"),
    stop: path.join(dir, "waveh-fetch.stop"),
    rate: path.join(dir, "rate.txt"),
    problems: path.join(dir, "problems.jsonl"),
    manifest: path.join(store, "manifest.jsonl"),
    books: path.join(store, "books.jsonl"),
  };
}

function makeLog(dir, clock) {
  return (event, fields = {}) => {
    const at = iso(clock.now());
    fs.appendFileSync(
      path.join(dir, `${at.slice(0, 10)}.jsonl`),
      `${JSON.stringify({ at, event, ...fields })}\n`,
    );
  };
}

/** The rate a pause left (D2: halved until the supervisor raises it), or the cap. */
function readRate(file) {
  if (!fs.existsSync(file)) return MAX_RATE;
  const text = fs.readFileSync(file, "utf8").trim();
  if (!/^\d{1,7}$/.test(text) || Number(text) < 1 || Number(text) > MAX_RATE) {
    throw new Settings(
      `${file} holds "${text.slice(0, 40)}", not a rate of 1 to ${MAX_RATE} bytes a second`,
    );
  }
  return Number(text);
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === "EPERM";
  }
}

/** One instance (D3): null when taken, else the holder's pid. A holder is a live process whose pid file was touched in the last 3 minutes. */
function takeLock(file, now) {
  try {
    const pid = Number(fs.readFileSync(file, "utf8").trim());
    if (
      Number.isInteger(pid) &&
      pid > 0 &&
      pid !== process.pid &&
      alive(pid) &&
      now - fs.statSync(file).mtimeMs < LOCK_FRESH_MS
    ) {
      return pid;
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
  fs.rmSync(file, { force: true });
  try {
    fs.writeFileSync(file, `${process.pid}\n`, { flag: "wx" });
  } catch (err) {
    if (err.code === "EEXIST") return 0;
    throw err;
  }
  fs.utimesSync(file, now / SECOND, now / SECOND);
  return null;
}

function releaseLock(file) {
  try {
    if (Number(fs.readFileSync(file, "utf8").trim()) === process.pid)
      fs.rmSync(file);
  } catch {
    // Not ours, or gone: nothing to release.
  }
}

/** At the start, every `.part` a kill left is removed (D6). */
function removeParts(store, log) {
  for (const entry of fs.readdirSync(store, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (entry.isFile() && entry.name.endsWith(".part")) {
      const file = path.join(entry.parentPath, entry.name);
      fs.rmSync(file);
      log("removed", { file, why: "a .part left by a stop" });
    }
  }
}

/**
 * The one door to the network: one request at a time through the gate (the
 * stop file, the pause windows, the watch, the spacing), the token bucket
 * and the error ladder. A tick every second checks the stop file, touches the
 * pid file, runs the watch, pauses on harm, and ends a transfer the gate
 * closes on.
 */
class Fetcher {
  constructor({
    clock,
    fetch,
    statfs,
    log,
    files,
    store,
    sizingOnly,
    rate,
    watch,
    books = null,
  }) {
    this.clock = clock;
    this.fetch = fetch;
    this.statfs = statfs;
    this.log = log;
    this.files = files;
    this.store = store;
    this.sizingOnly = sizingOnly;
    this.books = books;
    this.watch = watch;
    this.bucket = new Bucket(rate, clock.now());
    this.errors = 0;
    this.lastStart = -Infinity;
    this.lastFunding = -Infinity;
    this.pausedUntil = 0;
    this.pauses = [];
    this.stopping = null;
    this.current = null;
    this.touchedAt = clock.now();
    this.cancelTick = () => {};
  }

  start() {
    const loop = () => {
      this.tick();
      this.cancelTick = this.clock.after(SECOND, loop);
    };
    loop();
  }

  stop() {
    this.cancelTick();
  }

  tick() {
    const now = this.clock.now();
    try {
      if (fs.existsSync(this.files.stop)) return this.halt(0, "the stop file");
      if (now - this.touchedAt >= MINUTE) {
        try {
          fs.utimesSync(this.files.pid, now / SECOND, now / SECOND);
        } catch (err) {
          return this.halt(
            1,
            `the pid file, the lock, cannot be touched: ${err.message}`,
          );
        }
        this.touchedAt = now;
      }
      this.watch.tick(now);
      if (this.current !== null && windowEnd(now) !== null)
        this.current.abort("window");
      if (now >= this.pausedUntil) {
        const { conditions } = this.watch.verdict(now, this.pausedUntil);
        if (conditions.length > 0) this.pause(now, conditions.join("; "));
      }
    } catch (err) {
      // Failing closed (D1): a fault in the watch pauses the download, and a fault in the pause stops it.
      try {
        if (now < this.pausedUntil)
          this.log("watch failed", { why: String(err) });
        else this.pause(now, `the watch failed: ${String(err)}`);
      } catch (again) {
        this.halt(1, `the watch failed: ${String(again)}`);
      }
    }
  }

  /** A pause of 10 minutes; the rate halved and kept in rate.txt until the supervisor raises it; the third in an hour stops the day. */
  pause(now, why) {
    this.pauses = this.pauses.filter((t) => now - t < HOUR).concat(now);
    if (this.pauses.length >= WATCH.pausesToStop) {
      this.halt(
        4,
        `stopped for the day: ${this.pauses.length} pauses in an hour, the last for ${why}`,
      );
      return;
    }
    const rate = Math.max(1, Math.floor(this.bucket.rate / 2));
    fs.writeFileSync(this.files.rate, `${rate}\n`);
    this.bucket.setRate(rate);
    this.pausedUntil = now + WATCH.pauseMs;
    this.log("pause", { why, until: iso(this.pausedUntil), rate });
    this.current?.abort("pause");
  }

  halt(code, why) {
    this.stopping ??= { code, why };
    this.current?.abort("stop");
  }

  throwIfStopping() {
    if (this.stopping !== null)
      throw new Stop(this.stopping.code, this.stopping.why);
  }

  sleep(ms) {
    return new Promise((resolve) => this.clock.after(ms, resolve));
  }

  /** Waits `ms`, ending early when the request is aborted. */
  async pace(ms, signal) {
    const until = this.clock.now() + ms;
    while (!signal.aborted && this.clock.now() < until) {
      await this.sleep(Math.min(SECOND, until - this.clock.now()));
    }
  }

  /** Waits `ms`, ending the run when it stops. */
  async wait(ms) {
    const until = this.clock.now() + ms;
    while (this.clock.now() < until) {
      this.throwIfStopping();
      await this.sleep(Math.min(SECOND, until - this.clock.now()));
    }
    this.throwIfStopping();
  }

  /** Why no request may start now, or null. */
  shut(now) {
    const end = windowEnd(now);
    if (end !== null) return `the pause window to ${iso(end)}`;
    if (now < this.pausedUntil) return `paused to ${iso(this.pausedUntil)}`;
    const { conditions, clear } = this.watch.verdict(now, this.pausedUntil);
    if (conditions.length > 0) return "the watch sees harm";
    if (clear) return null;
    return this.watch.reading === null
      ? "the watch's first reading"
      : "a reading after the pause";
  }

  /** Waits until a request may start: the gate open, 1 s after the last request, 6 s after the last fundingHistory read (D5). */
  async ready(kind) {
    let said = null;
    for (;;) {
      this.throwIfStopping();
      const now = this.clock.now();
      const why = this.shut(now);
      if (why === null) {
        const at = Math.max(
          this.lastStart + GAP_MS,
          kind === "funding" ? this.lastFunding + FUNDING_GAP_MS : 0,
        );
        if (now >= at) return;
        await this.sleep(Math.min(SECOND, at - now));
      } else {
        if (why !== said) this.log("waiting", { why });
        said = why;
        await this.sleep(SECOND);
      }
    }
  }

  /** One HTTP exchange: "ok" (HTTP 200, its bytes counted and hashed), "missing", "long", "error" or "interrupted"; an abort throws. */
  async attempt(spec) {
    checkRequest(spec.url, spec.method, spec.body, this.sizingOnly, this.books);
    const ac = new AbortController();
    let unwatch = () => {};
    const watchIdle = () => {
      unwatch = this.clock.after(IDLE_MS, () => ac.abort("idle"));
    };
    this.current = ac;
    this.lastStart = this.clock.now();
    if (spec.kind === "funding") this.lastFunding = this.lastStart;
    let sink = null;
    try {
      watchIdle();
      const res = await this.fetch(spec.url, {
        method: spec.method,
        headers:
          spec.body === undefined
            ? { "User-Agent": USER_AGENT }
            : { "User-Agent": USER_AGENT, "Content-Type": "application/json" },
        body: spec.body,
        redirect: "manual",
        signal: ac.signal,
      });
      unwatch();
      if (res.status !== 200) {
        await res.body?.cancel().catch(() => {});
        return statusClass(res.status, spec.url);
      }
      sink = spec.begin();
      const md5 = createHash("md5");
      const sha256 = createHash("sha256");
      const reader = res.body.getReader();
      let bytes = 0;
      for (;;) {
        watchIdle();
        const { done, value } = await reader.read();
        unwatch();
        if (done) break;
        bytes += value.length;
        if (bytes > spec.max) {
          ac.abort("long");
          sink.discard();
          return { kind: "long" };
        }
        md5.update(value);
        sha256.update(value);
        sink.write(value);
        await this.pace(
          this.bucket.take(value.length, this.clock.now()),
          ac.signal,
        );
        if (ac.signal.aborted) throw new Error("aborted");
      }
      return {
        kind: "ok",
        bytes,
        md5: md5.digest("hex"),
        sha256: sha256.digest("hex"),
        etag: res.headers.get("etag"),
        contentType: res.headers.get("content-type"),
        body: sink.end(),
      };
    } catch (err) {
      if (err instanceof Abort) throw err;
      sink?.discard();
      const reason = ac.signal.aborted ? ac.signal.reason : null;
      // A local fault (a write, a folder) leaves the reply unread: ending it frees the connection.
      if (reason === null) ac.abort("ended");
      if (reason === "stop") this.throwIfStopping();
      if (reason === "pause" || reason === "window")
        return { kind: "interrupted" };
      const why =
        reason === "idle"
          ? `no byte for ${IDLE_MS / SECOND} s`
          : String(err?.message ?? err);
      return { kind: "error", why: `${why}: ${spec.url}` };
    } finally {
      unwatch();
      this.current = null;
    }
  }

  /** A request through the gate and the error ladder: "ok", "missing" or "long". */
  async request(spec) {
    for (;;) {
      await this.ready(spec.kind);
      const r = await this.attempt(spec);
      if (r.kind === "interrupted") continue;
      if (r.kind === "error") {
        await this.failed(r.why);
        continue;
      }
      this.errors = 0;
      return r;
    }
  }

  /** The error ladder: waits 30 s, 2 min and 10 min, then stops for the day (Iron Rule 5). */
  async failed(why) {
    this.errors += 1;
    if (this.errors > LADDER_MS.length) {
      throw new Stop(
        4,
        `stopped for the day: ${this.errors} errors in a row, the last: ${why}`,
      );
    }
    const ms = LADDER_MS[this.errors - 1];
    this.log("error", { why, inARow: this.errors, waitS: ms / SECOND });
    await this.wait(ms);
  }

  async listing(part, month, token) {
    const prefix = `${ROOT}${part.dir}${month}`;
    for (;;) {
      const r = await this.request({
        kind: "list",
        url: listingUrl(prefix, token),
        method: "GET",
        max: LISTING_MAX,
        begin: memorySink,
      });
      if (r.kind !== "ok") {
        throw new Abort(
          `the listing of ${prefix}: ${r.kind === "missing" ? `HTTP ${r.status}` : "too long"}`,
        );
      }
      try {
        return parseListing(r.body.toString("utf8"), prefix);
      } catch (err) {
        await this.failed(
          `the listing of ${prefix} fails its schema: ${err.message}`,
        );
      }
    }
  }

  /** The floor on the store's disk and the cap on the bytes `stored` the cap counts (D4). */
  checkLimits(max, stored, cap) {
    const disk = this.statfs(this.store);
    const free = disk.bavail * disk.bsize;
    if (free - max < FLOOR) {
      throw new Stop(
        4,
        `stopped at the floor: ${gib(free)} GiB free on the store's disk, ${gib(FLOOR)} GiB kept`,
      );
    }
    if (stored + max > cap) {
      throw new Stop(
        4,
        `stopped at the cap: ${stored} B stored, ${max} B more would pass ${cap} B`,
      );
    }
  }

  /** One file or reply: `.part`, hashed as it comes, checked, renamed, then its manifest line (D6). */
  async fetchItem(item, manifest, cap, stored) {
    const file = path.join(this.store, ...item.key.split("/"));
    const part = `${file}.part`;
    this.checkLimits(item.max, stored, cap);
    if (fs.existsSync(file)) {
      fs.rmSync(file);
      this.log("removed", {
        file,
        why: "in the store without its manifest line: fetched again, never read",
      });
    }
    let why = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const r = await this.request({
        ...item.request,
        max: item.max,
        begin: () => partSink(part),
      });
      if (r.kind === "missing") {
        this.problem(item.key, "missing", `HTTP ${r.status}`);
        return;
      }
      why =
        r.kind === "long"
          ? `more than ${item.max} bytes`
          : disagreement(item, r);
      if (why === null) {
        await this.rename(part, file);
        manifest.add({
          key: item.key,
          bytes: r.bytes,
          etag: item.etag ?? null,
          lastModified: item.lastModified ?? null,
          md5: r.md5,
          sha256: r.sha256,
          fetchedAt: iso(this.clock.now()),
          ...(item.kind === "funding"
            ? { request: JSON.parse(item.request.body) }
            : {}),
        });
        this.log("fetched", {
          key: item.key,
          bytes: r.bytes,
          files: manifest.lines.size,
          storedBytes: manifest.bytes,
        });
        return;
      }
      fs.rmSync(part, { force: true });
      this.log("mismatch", { key: item.key, why, attempt });
    }
    this.problem(item.key, "bad", why);
  }

  /** A rename refused (on Windows, while another process holds the file) is tried again once a second, 10 times in all. */
  async rename(from, to) {
    for (let i = 1; ; i++) {
      try {
        fs.renameSync(from, to);
        return;
      } catch (err) {
        if (i >= RENAME_TRIES) throw err;
        await this.sleep(SECOND);
      }
    }
  }

  problem(key, problem, detail) {
    fs.appendFileSync(
      this.files.problems,
      `${JSON.stringify({ at: iso(this.clock.now()), key, problem, detail })}\n`,
    );
    this.log("problem", { key, problem, detail });
  }
}

/** The key plan from the listings (validated, guarded, each key once), then the funding reads. */
async function makePlan(fetcher, sizingOnly, log) {
  const items = [];
  for (const part of PARTS) {
    const keys = new Map();
    for (const month of part.months.filter((m) => monthOk(m, sizingOnly))) {
      let token = null;
      do {
        const page = await fetcher.listing(part, month, token);
        for (const entry of page.dropped) log("dropped", { entry });
        for (const e of page.entries) {
          const name = e.key.slice(ROOT.length + part.dir.length);
          const time = keyTime(part, name);
          if (time === null)
            log("dropped", { key: e.key, why: "not the part's shape" });
          else if (admitted(part, name, sizingOnly)) {
            keys.set(e.key, {
              kind: "file",
              part: part.name,
              key: part.dir + name,
              time,
              size: e.size,
              etag: e.etag,
              lastModified: e.lastModified,
              max: e.size,
              request: {
                kind: "file",
                url: `${BUCKET}/${e.key}`,
                method: "GET",
              },
            });
          }
        }
        token = page.next;
      } while (token !== null);
    }
    items.push(...[...keys.values()].sort((a, b) => a.time - b.time));
  }
  for (const w of fundingWindows(sizingOnly)) {
    for (const coin of COINS) {
      items.push({
        kind: "funding",
        part: "funding",
        key: `info/fundingHistory/${coin}/${w.start}.json`,
        max: FUNDING_MAX,
        request: {
          kind: "funding",
          url: INFO,
          method: "POST",
          body: fundingBody(coin, w),
        },
      });
    }
  }
  return items;
}

/** The books' plan: each needed key's hour folder listed; a key it holds is an item, one it lacks is missing. */
async function makeBooksPlan(fetcher, books) {
  const items = [];
  const missing = [];
  for (const folder of [...new Set([...books].map(bookFolder))].sort()) {
    const listed = new Map();
    let token = null;
    do {
      const page = await fetcher.listing({ dir: "" }, folder, token);
      for (const entry of page.dropped) fetcher.log("dropped", { entry });
      for (const e of page.entries) listed.set(e.key, e);
      token = page.next;
    } while (token !== null);
    for (const key of [...books]
      .filter((k) => bookFolder(k) === folder)
      .sort()) {
      const e = listed.get(ROOT + key);
      if (e === undefined) missing.push(key);
      else
        items.push({
          kind: "file",
          part: "books",
          key,
          time: bookTime(key),
          size: e.size,
          etag: e.etag,
          lastModified: e.lastModified,
          max: e.size,
          request: { kind: "file", url: `${BUCKET}/${e.key}`, method: "GET" },
        });
    }
  }
  return { items, missing };
}

/** What --plan prints: each part's files and bytes, what is in the store, the days short of 24 hour files, the cap and the floor. */
function planText(items, manifest, cap, disk, sizingOnly) {
  const lines = [
    `WAVE-H's download: ${sizingOnly ? "the sizing months only" : "the full plan"}`,
  ];
  let left = 0;
  for (const name of [...PARTS.map((p) => p.name), "funding"]) {
    const mine = items.filter((i) => i.part === name);
    const todo = mine.filter((i) => !manifest.lines.has(i.key));
    const bytes = todo.reduce((s, i) => s + i.max, 0);
    left += bytes;
    const total = mine.reduce((s, i) => s + i.max, 0);
    let line = `${name}: ${mine.length} ${name === "funding" ? "reads (at most)" : "files"} ${gb(total)}; in the store ${mine.length - todo.length}; to fetch ${todo.length}, ${gb(bytes)}`;
    if (name !== "funding" && mine.length > 0) {
      line += `; ${mine[0].key} to ${mine.at(-1).key}; ${mine.filter((i) => i.etag.includes("-")).length} multipart`;
      if (PARTS.find((p) => p.name === name).hourly) {
        const perDay = new Map();
        for (const i of mine) {
          const day = Math.floor(i.time / DAY) * DAY;
          perDay.set(day, (perDay.get(day) ?? 0) + 1);
        }
        const short = [];
        for (
          let day = Math.min(...perDay.keys());
          day <= Math.max(...perDay.keys());
          day += DAY
        ) {
          if ((perDay.get(day) ?? 0) !== 24)
            short.push(`${iso(day).slice(0, 10)} ${perDay.get(day) ?? 0}`);
        }
        line += `; days without 24 files: ${short.join(", ") || "none"}`;
      }
    }
    lines.push(line);
  }
  const planned = items.reduce((s, i) => s + i.max, 0);
  lines.push(
    `in all: ${gb(planned)} planned, the cap ${gb(cap)}; to fetch ${gb(left)}; ${gib(disk.bavail * disk.bsize)} GiB free on the store's disk, the floor ${gib(FLOOR)} GiB`,
  );
  return `${lines.join("\n")}\n`;
}

/** The run: the lock, the plan from the listings, then every planned item not in the manifest. */
async function run(opts, deps) {
  const files = storeFiles(opts.store);
  fs.mkdirSync(files.logDir, { recursive: true });
  const log = makeLog(files.logDir, deps.clock);
  const holder = takeLock(files.pid, deps.clock.now());
  if (holder !== null) {
    log("refused", { why: `another instance runs (pid ${holder})` });
    return 3;
  }
  let fetcher = null;
  try {
    log("start", { pid: process.pid, node: process.version, ...opts });
    if (fs.existsSync(files.stop))
      throw new Stop(0, "the stop file was there at the start");
    if (!opts.plan) removeParts(opts.store, log);
    const books =
      (opts.books ?? null) === null
        ? null
        : readBooks(opts.books, opts.sizingOnly);
    const manifest =
      books === null
        ? new Manifest(files.manifest, log)
        : new Manifest(files.books, log, true);
    fetcher = new Fetcher({
      clock: deps.clock,
      fetch: deps.fetch,
      statfs: deps.statfs,
      log,
      files,
      store: opts.store,
      sizingOnly: opts.sizingOnly,
      rate: Math.min(readRate(files.rate), opts.rate ?? MAX_RATE),
      watch: new Watch(opts.heartbeat, log),
      books,
    });
    fetcher.start();
    if (books !== null)
      return await runBooks(fetcher, books, manifest, opts, deps, log);
    const items = await makePlan(fetcher, opts.sizingOnly, log);
    const cap = Math.ceil(items.reduce((s, i) => s + i.max, 0) * CAP);
    const text = planText(
      items,
      manifest,
      cap,
      deps.statfs(opts.store),
      opts.sizingOnly,
    );
    log("plan", { text });
    if (opts.plan) {
      deps.out(text);
      return 0;
    }
    for (const item of items) {
      const done = manifest.lines.get(item.key);
      if (done === undefined)
        await fetcher.fetchItem(item, manifest, cap, manifest.bytes);
      else if (
        item.kind === "file" &&
        (done.etag !== item.etag || done.bytes !== item.size)
      ) {
        fetcher.problem(
          item.key,
          "changed",
          `stored ${done.bytes} B with the ETag ${done.etag}; listed now ${item.size} B with ${item.etag}`,
        );
      }
    }
    log("done", { files: manifest.lines.size, bytes: manifest.bytes });
    return 0;
  } catch (err) {
    if (err instanceof Stop) {
      log("stopped", { why: err.message, code: err.code });
      return err.code;
    }
    if (err instanceof Settings) {
      log("refused", { why: err.message });
      return 2;
    }
    log(err instanceof Abort ? "aborted" : "crash", {
      why: String(err?.stack ?? err),
    });
    return 1;
  } finally {
    fetcher?.stop();
    releaseLock(files.pid);
  }
}

/** The --books run: the plan, then each missing key written, each listed key fetched once. */
async function runBooks(fetcher, books, manifest, opts, deps, log) {
  const { items, missing } = await makeBooksPlan(fetcher, books);
  const cap = Math.ceil(items.reduce((s, i) => s + i.max, 0) * CAP);
  const todo = items.filter((i) => !manifest.lines.has(i.key));
  const text = `WAVE-H's book files: ${books.size} needed; listed ${items.length}, ${gb(items.reduce((s, i) => s + i.max, 0))}; in the store ${items.length - todo.length}; to fetch ${todo.length}, ${gb(todo.reduce((s, i) => s + i.max, 0))}; not in their hour folder's listing ${missing.length}\n`;
  log("plan", { text });
  if (opts.plan) {
    deps.out(text);
    return 0;
  }
  for (const key of missing)
    if (!manifest.missing.has(key) && !manifest.lines.has(key))
      manifest.addMissing(key, deps.clock.now());
  // The cap counts this run's keys only: books.jsonl also holds earlier runs' books.
  const stored = () =>
    items.reduce((s, i) => s + (manifest.lines.get(i.key)?.bytes ?? 0), 0);
  for (const item of items) {
    const done = manifest.lines.get(item.key);
    if (manifest.missing.has(item.key))
      fetcher.problem(item.key, "changed", "written as missing; listed now");
    else if (done === undefined)
      await fetcher.fetchItem(item, manifest, cap, stored());
    else if (done.etag !== item.etag || done.bytes !== item.size)
      fetcher.problem(
        item.key,
        "changed",
        `stored ${done.bytes} B with the ETag ${done.etag}; listed now ${item.size} B with ${item.etag}`,
      );
  }
  log("done", { books: manifest.lines.size, missing: manifest.missing.size });
  return 0;
}

function parseArgs(argv) {
  const opts = {
    store: null,
    heartbeat: null,
    sizingOnly: false,
    plan: false,
    rate: null,
    books: null,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--sizing-only") opts.sizingOnly = true;
    else if (arg === "--plan") opts.plan = true;
    else if (
      arg === "--store" ||
      arg === "--heartbeat" ||
      arg === "--rate" ||
      arg === "--books"
    ) {
      const value = argv[++i];
      if (value === undefined) throw new Settings(`${arg} needs a value`);
      if (arg === "--rate") {
        if (
          !/^\d{1,7}$/.test(value) ||
          Number(value) < 1 ||
          Number(value) > MAX_RATE
        ) {
          throw new Settings(
            `--rate ${value}: from 1 to ${MAX_RATE} bytes a second, for it may only lower the rate`,
          );
        }
        opts.rate = Number(value);
      } else opts[arg.slice(2)] = path.resolve(value);
    } else throw new Settings(`an unknown argument: ${arg}`);
  }
  if (opts.store === null || opts.heartbeat === null)
    throw new Settings("--store and --heartbeat are needed");
  return opts;
}

const realClock = {
  now: () => Date.now(),
  after: (ms, fn) => {
    const timer = setTimeout(fn, ms);
    return () => clearTimeout(timer);
  },
};

async function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`waveh-fetch: ${err.message}\n`);
    process.exit(2);
  }
  // Idle: the collector, at Task Scheduler's below normal until the owner's re-registration, always comes first (D3).
  os.setPriority(os.constants.priority.PRIORITY_LOW);
  const code = await run(opts, {
    fetch,
    clock: realClock,
    statfs: (dir) => fs.statfsSync(dir),
    out: (text) => fs.writeSync(1, text),
  });
  if (code !== 0) {
    const logDir = storeFiles(opts.store).logDir;
    process.stderr.write(`waveh-fetch: exit ${code}; why: ${logDir}\n`);
  }
  process.exit(code);
}

module.exports = {
  BUCKET,
  COINS,
  DATA_END,
  FIRST,
  FLOOR,
  FUNDING_MAX,
  INFO,
  MAX_RATE,
  PARTS,
  ROOT,
  SEAL,
  Bucket,
  Fetcher,
  Manifest,
  Watch,
  admitted,
  bookTime,
  checkRequest,
  fundingBody,
  fundingWindows,
  judge,
  makeLog,
  parseArgs,
  parseListing,
  readBooks,
  realClock,
  run,
  storeFiles,
  windowEnd,
};

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(`waveh-fetch: ${String(err?.stack ?? err)}\n`);
    process.exit(1);
  });
}
