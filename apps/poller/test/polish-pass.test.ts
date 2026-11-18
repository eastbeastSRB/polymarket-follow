/**
 * The seal, the part file and the pass (src/polish/seal.ts, part.ts,
 * pass.ts): a synthetic store's files into parts, in this thread and through
 * the worker pool (the build's worker, byte for byte the same), the resume,
 * and every refusal: a sealed path or key, a file that differs from its
 * list, a part that is not whole or differs, WAVE-H's day rule.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";
import { readHeld } from "../src/polish/held.js";
import { partFile, readPart, readPartHeader } from "../src/polish/part.js";
import { WORKER_FILE, runPass, type FileTask } from "../src/polish/pass.js";
import { scanFill } from "../src/polish/scan.js";
import { SealedError, checkKey, checkPath } from "../src/polish/seal.js";
import { WIDTH, bytesOf, valuesOf } from "../src/polish/tables.js";
import {
  LiqWriter,
  Names,
  TakerWriter,
  fortyOf,
} from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import { DATA_END } from "../src/waveh/instants.js";
import { formatOf } from "../src/waveh/keys.js";
import { StoreError, manifestList } from "../src/waveh/store.js";
import { addr, byBlock, record, trade } from "./polish-world.js";
import { cleanScratch, fillKey, makeStore, scratch } from "./waveh-world.js";

afterAll(cleanScratch, 120_000);

const coins = loadCoins();
const FORTY = [...fortyOf(coins)];
const SMALL = coins.list.map((c) => c.name);

describe("the seal", () => {
  it("refuses FRESH's raw store and the analyzer's FRESH folder, in any case, before anything is opened", () => {
    for (const p of [
      "F:\\polymarket-follow-research\\FRESH\\store\\node_fills_by_block\\hourly\\20260601\\3.lz4",
      "f:\\x\\fresh\\STORE\\asset_ctxs\\20260529.csv.lz4",
      "F:\\polymarket-follow-research\\ANALYZER\\FRESH\\store\\manifest.json",
    ])
      expect(() => checkPath(p), p).toThrow(SealedError);
    for (const p of [
      "F:\\polymarket-follow-research\\WAVE-H\\store\\asset_ctxs\\20260529.csv.lz4",
      "F:\\polymarket-follow-research\\ANALYZER\\WAVE-H\\store\\manifest.json",
      "C:\\notes\\FRESH\\plan.txt",
    ])
      expect(() => checkPath(p), p).not.toThrow();
  });

  it("refuses every spelling of a sealed path: slashes, `..`, `.`, UNC, the long prefix", () => {
    for (const p of [
      "F:/polymarket-follow-research/FRESH/store/asset_ctxs/20260601.csv.lz4",
      "F:\\x\\WAVE-H\\..\\FRESH\\store\\a.lz4",
      "F:\\x\\FRESH\\y\\..\\store\\a.lz4",
      "F:\\x\\FRESH\\.\\store\\a.lz4",
      "F:\\x\\FRESH\\\\store\\a.lz4",
      "\\\\localhost\\F$\\x\\FRESH\\store\\a.lz4",
      "\\\\?\\F:\\x\\ANALYZER\\FRESH\\gates.json",
    ])
      expect(() => checkPath(p), p).toThrow(SealedError);
    expect(() =>
      checkPath("F:\\x\\FRESH\\store\\..\\..\\WAVE-H\\store\\a.lz4"),
    ).not.toThrow();
  });

  it("never resolves a path sealed by its name, so nothing of FRESH is touched; any other path it resolves", () => {
    const resolve = vi.spyOn(realpathSync, "native");
    try {
      for (const p of [
        "F:\\polymarket-follow-research\\FRESH\\store\\node_fills_by_block\\hourly\\20260601\\3.lz4",
        "F:\\polymarket-follow-research\\ANALYZER\\FRESH\\store\\manifest.json",
      ])
        expect(() => checkPath(p), p).toThrow(SealedError);
      expect(resolve).not.toHaveBeenCalled();
      checkPath(path.join(parts(), "a.lz4"));
      expect(resolve).toHaveBeenCalled();
    } finally {
      resolve.mockRestore();
    }
  });
  it("refuses a path through a junction into a sealed folder, by its real path", () => {
    const t = parts();
    const fresh = path.join(t, "FRESH", "store");
    mkdirSync(fresh, { recursive: true });
    writeFileSync(path.join(fresh, "a.lz4"), "synthetic");
    mkdirSync(path.join(t, "WAVE-H"));
    const junction = path.join(t, "WAVE-H", "store");
    symlinkSync(fresh, junction, "junction");
    try {
      for (const p of [
        junction,
        path.join(junction, "a.lz4"),
        path.join(junction, "not", "yet", "there.part"),
      ])
        expect(() => checkPath(p), p).toThrow(SealedError);
      expect(() => checkPath(path.join(t, "WAVE-H", "b.lz4"))).not.toThrow();
    } finally {
      // The junction alone, never what it points at.
      rmdirSync(junction);
    }
    expect(existsSync(path.join(fresh, "a.lz4"))).toBe(true);
  });

  it("refuses a key dated after DATA END, and one whose date does not parse", () => {
    expect(() => checkKey("node_fills_by_block/hourly/20260529/2.lz4")).toThrow(
      "after DATA END",
    );
    expect(() => checkKey("node_fills/hourly/2025061/3.lz4")).toThrow(
      "no date",
    );
    for (const k of [
      "node_fills_by_block/hourly/20260529/1.lz4",
      "asset_ctxs/20260529.csv.lz4",
      "info/fundingHistory/SOL/1779840000000.json",
    ])
      expect(() => checkKey(k), k).not.toThrow();
  });
});

describe("a part's columns", () => {
  it("hold each type's whole numbers to its bounds, and refuse one past them", () => {
    for (const [type, lo, hi] of [
      ["u8", 0, 255],
      ["u16", 0, 65_535],
      ["u32", 0, 4_294_967_295],
      ["u64", 0, 4_294_967_295],
      ["i8", -128, 127],
    ] as const) {
      const b = bytesOf(type, [lo, hi]);
      expect(b.length, type).toBe(type === "u64" ? 8 : 2 * WIDTH[type]);
      expect([...valuesOf(type, b)], type).toEqual([lo, hi]);
      for (const v of [hi + 1, lo - 1, 1.5])
        expect(() => bytesOf(type, [v]), `${type} ${v}`).toThrow(
          `a ${type} column cannot hold ${v}`,
        );
    }
    expect([...valuesOf("f64", bytesOf("f64", [-1.5, NaN, 1e300]))]).toEqual([
      -1.5,
      NaN,
      1e300,
    ]);
  });
});

const T1 = Date.parse("2025-06-10T10:00:00Z");
const T2 = Date.parse("2025-06-10T11:00:00Z");
const T3 = Date.parse("2025-07-28T09:00:00Z");

/** A day's worth of small files: two `node_fills` hours, one `node_fills_by_block` hour. */
function world(extra: Map<string, string> = new Map()) {
  const lines = (t: number, n: number) =>
    Array.from({ length: n }, (_, i) =>
      trade(addr(1 + (i % 7)), addr(30 + (i % 3)), {
        coin: ["SOL", "BTC", "TRUMP", "kPEPE"][i % 4]!,
        side: i % 2 === 0 ? "A" : "B",
        time: t + i * 1000,
        tid: t / 1000 + i,
      }),
    ).flat();
  const liq = (t: number) =>
    record(addr(3), {
      coin: "SOL",
      side: "A",
      time: t,
      startPosition: "2.0",
      crossed: true,
      tid: t,
      liquidation: { liquidatedUser: addr(3), markPx: "99", method: "market" },
    });
  const files = new Map<string, string>([
    [fillKey(T1), `${[...lines(T1, 40), liq(T1 + 99)].join("\n")}\n`],
    [fillKey(T2), `${lines(T2, 30).join("\n")}\n`],
    [
      fillKey(T3, "node_fills_by_block"),
      `${[byBlock(7, lines(T3, 10)), byBlock(8, [liq(T3 + 5)])].join("\n")}\n`,
    ],
    ...extra,
  ]);
  const { store } = makeStore(files, false);
  const list = manifestList(
    readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
  );
  const tasks: FileTask[] = [...files.keys()].map((key, index) => ({
    index,
    key,
    sha256: list.get(key)!,
  }));
  return { store, tasks };
}

const parts = () => {
  const d = mkdtempSync(path.join(tmpdir(), "polish-parts-"));
  scratch.push(d);
  return d;
};
const pass = (
  store: string,
  dir: string,
  files: readonly FileTask[],
  workers = 0,
  code = "code-a",
) =>
  runPass({
    store,
    parts: dir,
    files,
    end: DATA_END,
    code,
    forty: FORTY,
    small: SMALL,
    workers,
    pace: () => Promise.resolve(),
    log: () => {},
  });

describe("the pass", () => {
  it("writes each file's part with the scan's rows and counts, and resumes without redoing a part of the same code", async () => {
    const { store, tasks } = world();
    const dir = parts();
    const first = await pass(store, dir, tasks);
    expect(first).toMatchObject({
      files: 3,
      skipped: 0,
      extracted: 3,
      failed: 0,
    });
    expect(first.records).toBe(80 + 1 + 60 + 20 + 1);
    for (const t of tasks) {
      const p = readPart(partFile(dir, t.index));
      expect(p.header.input).toEqual(t);
      expect(p.header.code).toBe("code-a");
      // The same file scanned here gives the same rows.
      const users = new Names();
      const taker = new TakerWriter(new Set(FORTY), new Set(SMALL));
      const liq = new LiqWriter();
      const scan = scanFill(
        readFileSync(path.join(store, ...t.key.split("/"))),
        formatOf(t.key),
        DATA_END,
        new Set(FORTY),
        [taker, liq],
        users,
      );
      expect(p.header.scan.records).toBe(scan.records);
      expect(p.users).toEqual(users.list);
      for (const [coin, rows] of taker.coins) {
        const got = p.taker.get(coin)!;
        expect([...got.time!], coin).toEqual(rows.time);
        expect([...got.px!], coin).toEqual(rows.px);
        expect([...got.side!], coin).toEqual(rows.side);
        expect([...got.user!], coin).toEqual(rows.user);
        expect([...got.tid!], coin).toEqual(rows.tid);
      }
      expect([...p.liq.startPosition!]).toEqual(liq.rows.startPosition);
      expect([...p.liq.liqUser!]).toEqual(liq.rows.liqUser);
      expect(p.header.liq.coins).toEqual(liq.coins.list);
    }
    const again = await pass(store, dir, tasks);
    expect(again).toMatchObject({ skipped: 3, extracted: 0 });
    const other = await pass(store, dir, tasks, 0, "code-b");
    expect(other).toMatchObject({ skipped: 0, extracted: 3 });
  });

  it("names the scan's counters over every file of the range, a resumed part's from its header", async () => {
    const t = Date.parse("2025-06-12T10:00:00Z");
    // A taker whose tid is 2^64 (refused), and a record whose fill does not open with its coin (the slow path).
    const odd = [
      ...trade(addr(1), addr(2), {
        coin: "SOL",
        side: "B",
        time: t,
        tid: "18446744073709551616",
      }),
      `["${addr(4)}",{"px":"151","coin":"SOL","sz":"1.0","side":"B","time":${t + 1},"startPosition":"0.0","dir":"Open Long","closedPnl":"0.0","hash":"0x00","oid":7,"crossed":true,"fee":"0.0068","tid":5,"feeToken":"USDC"}]`,
    ];
    const { store, tasks } = world(
      new Map([[fillKey(t), `${odd.join("\n")}\n`]]),
    );
    const dir = parts();
    const want = { refused: 1, misread: 0, slowLines: 0, slowRecords: 1 };
    expect((await pass(store, dir, tasks)).counters).toEqual(want);
    const again = await pass(store, dir, tasks);
    expect(again).toMatchObject({ skipped: 4, extracted: 0, counters: want });
  });

  it("refuses a part that is not whole or whose payload differs, and redoes it", async () => {
    const { store, tasks } = world();
    const dir = parts();
    await pass(store, dir, tasks);
    const file = partFile(dir, 1);
    const whole = readFileSync(file);
    writeFileSync(file, whole.subarray(0, whole.length - 3));
    expect(readPartHeader(file)).toBeNull();
    expect(() => readPart(file)).toThrow("not a whole part");
    const flipped = Buffer.from(whole);
    flipped[flipped.length - 1] = flipped[flipped.length - 1]! ^ 1;
    writeFileSync(file, flipped);
    expect(readPartHeader(file)).not.toBeNull();
    expect(() => readPart(file)).toThrow("payload's SHA-256 differs");
    writeFileSync(file, whole.subarray(0, 5));
    const again = await pass(store, dir, tasks);
    expect(again).toMatchObject({ skipped: 2, extracted: 1 });
    expect(readFileSync(file).equals(whole)).toBe(true);
  });

  it("stops at a file that differs from its list, and at a sealed store, naming it", async () => {
    const { store, tasks } = world();
    const wrong = tasks.map((t, i) =>
      i === 1 ? { ...t, sha256: "0".repeat(64) } : t,
    );
    await expect(pass(store, parts(), wrong)).rejects.toThrow(
      new StoreError(
        `${tasks[1]!.key}: SHA-256 ${tasks[1]!.sha256}, the list's ${"0".repeat(64)}`,
      ),
    );
    const sealed = path.join(store, "FRESH", "store");
    await expect(pass(sealed, parts(), tasks)).rejects.toThrow(SealedError);
    // A key dated after DATA END is refused before the list is asked or the file opened.
    expect(() =>
      readHeld(
        store,
        "node_fills_by_block/hourly/20260601/0.lz4",
        "a".repeat(64),
      ),
    ).toThrow(
      new SealedError(
        "node_fills_by_block/hourly/20260601/0.lz4: dated after DATA END, FRESH's months, sealed until the polishing's exam is frozen",
      ),
    );
  });

  it("stops on WAVE-H's day rule: more than 1%, and 10, of a day's records failing", async () => {
    const t = Date.parse("2025-06-11T10:00:00Z");
    const bad = Array.from({ length: 11 }, () => "not a record").join("\n");
    const good = Array.from({ length: 2000 }, (_, i) =>
      record(addr(9), {
        coin: "SOL",
        side: "B",
        time: t + i,
        crossed: false,
        tid: i,
      }),
    ).join("\n");
    const { store, tasks } = world(
      new Map([[fillKey(t), `${good}\n${bad}\n`]]),
    );
    // 11 of 2,011: 0.55%, not above 1%.
    await expect(pass(store, parts(), tasks)).resolves.toMatchObject({
      failed: 11,
    });
    const worse = Array.from({ length: 30 }, () => "not a record").join("\n");
    const w2 = world(new Map([[fillKey(t), `${good}\n${worse}\n`]]));
    await expect(pass(w2.store, parts(), w2.tasks)).rejects.toThrow(
      "2025-06-11: 30 of 2030 records fail WAVE-H's schema",
    );
    // Exactly 10, above 1%: the least that stops; 9 above 1% does not.
    const few = (n: number) =>
      world(
        new Map([
          [
            fillKey(t),
            `${good.split("\n").slice(0, 500).join("\n")}\n${bad.split("\n").slice(0, n).join("\n")}\n`,
          ],
        ]),
      );
    const ten = few(10);
    await expect(pass(ten.store, parts(), ten.tasks)).rejects.toThrow(
      "2025-06-11: 10 of 510 records fail WAVE-H's schema",
    );
    const nine = few(9);
    await expect(pass(nine.store, parts(), nine.tasks)).resolves.toMatchObject({
      failed: 9,
    });
  });

  /** Each pace call: the parts written when it starts and when it ends (it waits 30 ms). */
  const paced = async (workers: number) => {
    const { store, tasks } = world();
    const dir = parts();
    const seen: [number, number][] = [];
    await runPass({
      store,
      parts: dir,
      files: tasks,
      end: DATA_END,
      code: "code-a",
      forty: FORTY,
      small: SMALL,
      workers,
      pace: async () => {
        const before = readdirSync(dir).length;
        await new Promise((r) => setTimeout(r, 30));
        seen.push([before, readdirSync(dir).length]);
      },
      log: () => {},
    });
    return seen;
  };

  it("waits on its pace before each file, in this thread, and writes nothing while it waits", async () => {
    expect(await paced(0)).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
    ]);
  });

  it.runIf(existsSync(WORKER_FILE))(
    "waits on its pace before each file through the pool, and writes nothing while it waits",
    async () => {
      expect(await paced(1)).toEqual([
        [0, 0],
        [1, 1],
        [2, 2],
      ]);
    },
    60_000,
  );

  it.runIf(existsSync(WORKER_FILE))(
    "through the worker pool writes the same parts byte for byte, and reports each thread's memory",
    async () => {
      const { store, tasks } = world();
      const here = parts();
      const there = parts();
      await pass(store, here, tasks);
      const got = await pass(store, there, tasks, 2);
      expect(got).toMatchObject({ extracted: 3, skipped: 0 });
      for (const t of tasks)
        expect(
          readFileSync(partFile(there, t.index)).equals(
            readFileSync(partFile(here, t.index)),
          ),
          t.key,
        ).toBe(true);
      expect(got.peaks.workers.length).toBe(2);
      for (const m of [got.peaks.main, ...got.peaks.workers])
        expect(m.heapUsed).toBeGreaterThan(0);
      // Each worker's own 4 GB ceiling (and a young generation's few MB), whatever the thread that starts it has.
      for (const m of got.peaks.workers) {
        expect(m.heapLimit / 2 ** 20).toBeGreaterThanOrEqual(4096);
        expect(m.heapLimit / 2 ** 20).toBeLessThan(4096 + 512);
      }
      const bad = tasks.map((t, i) =>
        i === 2 ? { ...t, sha256: "1".repeat(64) } : t,
      );
      await expect(pass(store, parts(), bad, 2)).rejects.toThrow(StoreError);
    },
    60_000,
  );
});
