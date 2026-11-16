/**
 * WAVE-H's gates and readers (rules.md H0, H2, H8–H10): the freeze, the seal
 * by the key's date, the store's lists, the hash before any decoding, the
 * pinned decoder and its one frame, and the readers of fills' lines, marks,
 * funding and books.
 */
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadResearch } from "../src/paper/research.js";
import { HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { bookHours, lastAtOrBefore } from "../src/waveh/books.js";
import { loadCoins } from "../src/waveh/coins.js";
import { addCtxs, newMarks } from "../src/waveh/ctxs.js";
import { fundingRows, joinFunding } from "../src/waveh/funding.js";
import {
  CLOSURE,
  FROZEN_FILE,
  LZ4JS_FILES,
  WAVEH_FILES,
  SealedError,
  checkSealed,
  frozenFiles,
  gateOf,
  verifyFreeze,
} from "../src/waveh/gate.js";
import { DATA_END, SIZING_START, TEST_START } from "../src/waveh/instants.js";
import {
  bookKey,
  ctxsKey,
  fillKeys,
  formatOf,
  keyDate,
} from "../src/waveh/keys.js";
import { LZ4JS_DIR, decodeLz4, frameOf, loadLz4js } from "../src/waveh/lz4.js";
import { MARKS_START, marketOf } from "../src/waveh/market.js";
import {
  StoreError,
  linesOf,
  manifestList,
  readBookList,
  readDataList,
  readLz4,
  readStoreFile,
} from "../src/waveh/store.js";
import { cleanScratch, lz4 as frame, scratch } from "./waveh-world.js";

const CLOSED = { open: false } as const;
const OPEN = { open: true } as const;
const sha256 = (b: Buffer | Uint8Array | string) =>
  createHash("sha256").update(b).digest("hex");
const tmp = (name: string) => {
  const dir = mkdtempSync(path.join(tmpdir(), `waveh-${name}-`));
  scratch.push(dir);
  return dir;
};
afterEach(cleanScratch);
const put = (root: string, key: string, bytes: Buffer | string) => {
  const file = path.join(root, ...key.split("/"));
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, bytes);
};

describe("WAVE-H's freeze (H0)", () => {
  const makePackage = () => {
    const pkg = tmp("pkg");
    for (const f of [
      "dist/waveh.js",
      "dist/waveh/gate.js",
      ...CLOSURE,
      "dist/market1/daily.js",
      "dist/paper/page.js",
      "dist/schedule.js",
      "research/kit/check.mjs",
      ...LZ4JS_FILES,
      "node_modules/lz4js/README.md",
      ...WAVEH_FILES,
    ])
      put(pkg, f, `${f}\n`);
    return pkg;
  };
  const freeze = (pkg: string) => {
    const text = `${frozenFiles(pkg)
      .map((f) => `${sha256(Buffer.from(`${f}\n`))} *${f}`)
      .join("\n")}\n`;
    put(pkg, FROZEN_FILE, text);
    return sha256(text);
  };

  it("lists the program, the closure, research, lz4js and waveh, and nothing shared or else", () => {
    const pkg = makePackage();
    put(pkg, "waveh/FROZEN.draft.sha256", "x\n");
    expect(frozenFiles(pkg)).toEqual([
      "dist/waveh.js",
      "dist/waveh/gate.js",
      ...CLOSURE,
      "research/kit/check.mjs",
      ...LZ4JS_FILES,
      "waveh/coins.json",
      "waveh/data.sha256",
      "waveh/rules.md",
      "waveh/sizing.json",
    ]);
  });

  it("refuses without a list, with a changed, missing or unlisted file, and without a closure, lz4js or look file", () => {
    const pkg = makePackage();
    expect(verifyFreeze(pkg)).toEqual({
      ok: false,
      problems: [`no ${FROZEN_FILE}`],
    });
    const hash = freeze(pkg);
    const files = frozenFiles(pkg).length;
    expect(verifyFreeze(pkg)).toEqual({ ok: true, sha256: hash, files });
    expect(gateOf(verifyFreeze(pkg))).toEqual(OPEN);
    put(pkg, "waveh/rules.md", "changed\n");
    expect(verifyFreeze(pkg)).toEqual({
      ok: false,
      problems: ["changed: waveh/rules.md"],
    });
    expect(gateOf(verifyFreeze(pkg))).toEqual(CLOSED);
    put(pkg, "waveh/rules.md", "waveh/rules.md\n");
    put(pkg, "dist/waveh/extra.js", "x\n");
    expect(verifyFreeze(pkg).ok).toBe(false);
    rmSync(path.join(pkg, "dist/waveh/extra.js"));
    for (const f of [CLOSURE[0]!, LZ4JS_FILES[2]!, WAVEH_FILES[2]!]) {
      rmSync(path.join(pkg, f));
      expect(verifyFreeze(pkg)).toEqual({
        ok: false,
        problems: [`missing: ${f}`],
      });
      freeze(pkg);
      expect(verifyFreeze(pkg)).toEqual({
        ok: false,
        problems: [`not in the freeze: ${f}`],
      });
      put(pkg, f, `${f}\n`);
      freeze(pkg);
    }
    // A file outside the closure is not WAVE-H's: a fix there changes nothing here.
    put(pkg, "dist/market1/daily.js", "a fix\n");
    put(pkg, "dist/schedule.js", "a collector change\n");
    expect(verifyFreeze(pkg).ok).toBe(true);
    put(pkg, CLOSURE[0]!, "a MARKET-1 fix\n");
    expect(verifyFreeze(pkg)).toEqual({
      ok: false,
      problems: [`changed: ${CLOSURE[0]}`],
    });
  });
});

describe("the seal (H0)", () => {
  const sealed = [
    "node_fills_by_block/hourly/20250801/0.lz4",
    "node_fills_by_block/hourly/20260529/1.lz4",
    "asset_ctxs/20250801.csv.lz4",
    `info/fundingHistory/SOL/${TEST_START}.json`,
    "market_data/20251010/13/l2Book/SOL.lz4",
  ];
  const open = [
    "node_fills/hourly/20250525/14.lz4",
    "node_fills_by_block/hourly/20250731/23.lz4",
    "asset_ctxs/20250731.csv.lz4",
    `info/fundingHistory/kPEPE/${Date.parse("2025-07-24T00:00:00Z")}.json`,
    "market_data/20250731/23/l2Book/kSHIB.lz4",
  ];

  it("dates every kind of key and refuses a date that is no date", () => {
    expect(keyDate("node_fills/hourly/20250727/8.lz4")).toBe(
      Date.parse("2025-07-27T08:00:00Z"),
    );
    expect(keyDate("market_data/20250715/3/l2Book/SOL.lz4")).toBe(
      Date.parse("2025-07-15T03:00:00Z"),
    );
    expect(keyDate("asset_ctxs/20250731.csv.lz4")).toBe(
      Date.parse("2025-07-31T00:00:00Z"),
    );
    expect(keyDate("info/fundingHistory/SOL/1748131200000.json")).toBe(
      1748131200000,
    );
    for (const key of [
      "node_fills/hourly/20250230/1.lz4",
      "node_fills/hourly/20250727/24.lz4",
      "node_fills/hourly/2025072/1.lz4",
      "node_trades/hourly/20250727/1.lz4",
      "asset_ctxs/20250731.csv",
      "info/fundingHistory/SOL/174813120000.json",
      "../node_fills/hourly/20250727/1.lz4",
    ])
      expect(keyDate(key)).toBeNull();
  });

  it("refuses a TEST key while closed, and a key without a date always", () => {
    for (const key of sealed) {
      expect(() => checkSealed(CLOSED, key)).toThrow(SealedError);
      expect(() => checkSealed(OPEN, key)).not.toThrow();
    }
    for (const key of open)
      expect(() => checkSealed(CLOSED, key)).not.toThrow();
    expect(() => checkSealed(OPEN, "node_fills/x.lz4")).toThrow(SealedError);
  });

  it("refuses a TEST file before opening it: the refusal, not the file's own fault", () => {
    const store = tmp("store");
    const garbage = "not even lz4";
    const list = new Map<string, string>();
    for (const key of sealed.slice(0, 2)) {
      put(store, key, garbage);
      list.set(key, sha256("something else"));
    }
    // A sealed file that exists but differs, and one that does not exist: both refused by the seal.
    for (const key of [...sealed.slice(0, 2), sealed[2]!]) {
      expect(() => readStoreFile(CLOSED, store, list, key)).toThrow(
        SealedError,
      );
      expect(() => readLz4(CLOSED, store, list, key)).toThrow(SealedError);
    }
    expect(() => readStoreFile(OPEN, store, list, sealed[0]!)).toThrow(
      StoreError,
    );
  });

  it("parses every key the program builds back to its own date: one grammar (L9)", () => {
    const fills = fillKeys(0, Infinity);
    for (const key of fills) {
      const t = keyDate(key);
      expect(t, key).not.toBeNull();
      expect(fillKeys(t!, t! + HOUR_MS), key).toContain(key);
      expect(formatOf(key), key).toBe(key.split("/")[0]);
    }
    for (let h = SIZING_START; h <= DATA_END; h += 7 * HOUR_MS)
      for (const coin of ["SOL", "kPEPE", "FARTCOIN"])
        expect(keyDate(bookKey(coin, h))).toBe(h);
    for (let d = MARKS_START; d < DATA_END; d += 24 * HOUR_MS)
      expect(keyDate(ctxsKey(d))).toBe(d);
  });
});

describe("the store's files (H2)", () => {
  const key = "node_fills/hourly/20250701/12.lz4";
  const text = '["0x1",{}]\n["0x2",{}]\n';

  it("reads a file only when its hash is the list's, and decodes its one frame", () => {
    const store = tmp("store");
    const bytes = frame(text);
    put(store, key, bytes);
    const list = new Map([[key, sha256(bytes)]]);
    expect(Buffer.from(readLz4(CLOSED, store, list, key)).toString()).toBe(
      text,
    );
    expect(() => readStoreFile(CLOSED, store, new Map(), key)).toThrow(
      `${key}: not in the list`,
    );
    expect(() =>
      readStoreFile(CLOSED, store, list, "node_fills/hourly/20250701/13.lz4"),
    ).toThrow(StoreError);
    const other = "node_fills/hourly/20250701/13.lz4";
    expect(() =>
      readStoreFile(CLOSED, store, new Map([[other, sha256("x")]]), other),
    ).toThrow(`${other}: ENOENT`);
    put(store, key, Buffer.concat([bytes, Buffer.from([0])]));
    expect(() => readStoreFile(CLOSED, store, list, key)).toThrow("SHA-256");
    for (const bad of [
      Buffer.concat([bytes, Buffer.from([0])]),
      Buffer.concat([bytes, bytes]),
      bytes.subarray(0, bytes.length - 2),
      Buffer.from("not a frame at all"),
    ]) {
      put(store, key, bad);
      expect(() =>
        readLz4(CLOSED, store, new Map([[key, sha256(bad)]]), key),
      ).toThrow(StoreError);
    }
  });

  it("walks a frame's flags: content size, content checksum, an uncompressed block; refuses what lz4js misreads", () => {
    const body = Buffer.from("abc\n");
    const u32 = (n: number) => {
      const b = Buffer.alloc(4);
      b.writeUInt32LE(n);
      return b;
    };
    const head = (flg: number, extra: Buffer) =>
      Buffer.concat([
        u32(0x184d2204),
        Buffer.from([flg, 0x70]),
        extra,
        Buffer.from([0]),
      ]);
    const block = Buffer.concat([u32(0x80000000 + body.length), body]);
    const plain = Buffer.concat([head(0x40, Buffer.alloc(0)), block, u32(0)]);
    expect(Buffer.from(decodeLz4(plain)).toString()).toBe("abc\n");
    const size = Buffer.alloc(8);
    size.writeUInt32LE(4);
    const all = Buffer.concat([
      head(0x40 | 0x08 | 0x04, size),
      block,
      u32(0),
      u32(9),
    ]);
    expect(frameOf(all).end).toBe(all.length);
    expect(Buffer.from(decodeLz4(all)).toString()).toBe("abc\n");
    size.writeUInt32LE(5);
    expect(() =>
      decodeLz4(Buffer.concat([head(0x48, size), block, u32(0)])),
    ).toThrow("its header says 5");
    // A dictionary id, and block checksums: lz4js reads the checksum as the block's first bytes.
    for (const flg of [0x41, 0x50])
      expect(() =>
        decodeLz4(
          Buffer.concat([head(flg, Buffer.alloc(0)), block, u32(7), u32(0)]),
        ),
      ).toThrow("cannot read");
  });

  it("loads lz4js only when its three files are the pinned ones", () => {
    expect(() => loadLz4js()).not.toThrow();
    const dir = tmp("lz4js");
    cpSync(LZ4JS_DIR, dir, { recursive: true });
    writeFileSync(path.join(dir, "xxh32.js"), "// changed\n");
    expect(() => loadLz4js(dir)).toThrow("lz4js xxh32.js");
  });

  it("reads the lists: the frozen data list, the manifest while it is written, the book list", () => {
    const h = "a".repeat(64);
    expect(readDataList(`# head\n${h} *asset_ctxs/20250701.csv.lz4\n`)).toEqual(
      new Map([["asset_ctxs/20250701.csv.lz4", h]]),
    );
    expect(() => readDataList(`${h} asset_ctxs/x\n`)).toThrow("line 1");
    expect(() => readDataList(`${h} *k\n${h} *k\n`)).toThrow("line 2");
    const line = (k: string) =>
      JSON.stringify({ key: k, bytes: 3, sha256: h, md5: "m" });
    expect(manifestList(`${line("a")}\n${line("b")}\n{"key":"c","by`)).toEqual(
      new Map([
        ["a", h],
        ["b", h],
      ]),
    );
    expect(() => manifestList(`${line("a")}\n{"key":"b"}\n`)).toThrow("line 2");
    expect(() => manifestList(`${line("a")}\n${line("a")}\n`)).toThrow(
      "line 2",
    );
    const books = readBookList(`${line("x")}\n{"key":"y","missing":true}\n`);
    expect([...books.files.keys(), ...books.missing]).toEqual(["x", "y"]);
    expect(() => readBookList(`{"key":"y","missing":false}\n`)).toThrow(
      "line 1",
    );
  });

  it("splits decoded bytes into lines without a whole-file string", () => {
    expect([...linesOf(Buffer.from("a\nbc\n"))]).toEqual(["a", "bc"]);
    expect([...linesOf(Buffer.from("a\n\nb"))]).toEqual(["a", "", "b"]);
    expect([...linesOf(new Uint8Array(0))]).toEqual([]);
  });

  it("names every fill file of the hours, both formats in the hour they share", () => {
    const sizing = fillKeys(Date.parse("2025-05-25T00:00:00Z"), TEST_START);
    expect(sizing[0]).toBe("node_fills/hourly/20250525/14.lz4");
    expect(sizing.at(-1)).toBe("node_fills_by_block/hourly/20250731/23.lz4");
    expect(sizing.filter((k) => k.startsWith("node_fills/"))).toHaveLength(
      1_507,
    );
    expect(sizing.filter((k) => k.includes("by_block"))).toHaveLength(112);
    expect(sizing.filter((k) => k.endsWith("20250727/8.lz4"))).toHaveLength(2);
    const all = fillKeys(0, Infinity);
    expect(all.at(-1)).toBe("node_fills_by_block/hourly/20260529/1.lz4");
    expect(all).toHaveLength(1_507 + 112 + 7_200 + 24 + 2);
  });
});

describe("the marks, funding and the market object (H9, H10; R1)", () => {
  const coins = loadCoins();
  const day = Date.parse("2025-07-15T00:00:00Z");
  const iso = (t: number) => new Date(t).toISOString().replace(".000Z", "Z");
  const head =
    "time,coin,funding,open_interest,prev_day_px,day_ntl_vlm,premium,oracle_px,mark_px,mid_px,impact_bid_px,impact_ask_px";
  const row = (t: number, coin: string, mark: string) =>
    `${iso(t)},${coin},0.0000125,1,1,1,0,1,${mark},1,1,1`;

  it("takes the row stamped m + 1 min as the mark at the end of minute m", () => {
    const marks = newMarks(coins, day, day + 2 * 86_400_000);
    const text = [
      head,
      row(day, "SOL", "100"),
      row(day + MINUTE_MS, "SOL", "101"),
      row(day + 2 * MINUTE_MS, "SOL", "102"),
      row(day + 2 * MINUTE_MS, "SOL", "999"),
      row(day + 3 * MINUTE_MS, "BTC", "50000"),
      row(day + 3 * MINUTE_MS, "SOL", "-1"),
      `${iso(day + 4 * MINUTE_MS)},SOL,1`,
      row(day + 86_400_000, "SOL", "200"),
      "",
    ].join("\n");
    const count = addCtxs(marks, text, day + 86_400_000);
    expect(count).toEqual({ rows: 7, failed: 2, late: 1, twice: 1 });
    const sol = marks.byCoin.get("SOL")!;
    expect([sol[0], sol[1], sol[2]]).toEqual([101, 102, NaN]);
    // The next day's 00:00 row fills the day's last minute.
    addCtxs(
      marks,
      [head, row(day + 86_400_000, "SOL", "200")].join("\n"),
      Infinity,
    );
    expect(sol[1_439]).toBe(200);
    expect(() => addCtxs(marks, "time,coin,funding\n", Infinity)).toThrow(
      "header",
    );
  });

  it("rounds a funding row's stamp to its nominal hour and refuses two rows of an hour", () => {
    const H = day + 5 * HOUR_MS;
    const reply = JSON.stringify([
      {
        coin: "SOL",
        fundingRate: "0.0000125",
        premium: "0.0001",
        time: H + 17,
      },
      {
        coin: "SOL",
        fundingRate: "-0.00002",
        premium: "0",
        time: H + HOUR_MS - 3,
      },
      { coin: "VVV", fundingRate: "0.1", premium: "0", time: H },
      { coin: "SOL", fundingRate: "x", premium: "0", time: H },
      { coin: "SOL", fundingRate: "0.3", premium: "0", time: H + 9 * HOUR_MS },
    ]);
    expect(fundingRows("SOL", reply, H + 8 * HOUR_MS)).toEqual({
      rows: [
        [H, 0.0000125, H + 17],
        [H + HOUR_MS, -0.00002, H + HOUR_MS - 3],
      ],
      failed: 2,
      late: 1,
    });
    expect(fundingRows("SOL", "[]", Infinity)).toEqual({
      rows: [],
      failed: 0,
      late: 0,
    });
    expect(() => fundingRows("SOL", "{}", Infinity)).toThrow(
      "not a fundingHistory reply",
    );
    expect(
      joinFunding([
        [H + HOUR_MS, 1, 0],
        [H, 2, 0],
      ]).map((r) => r[0]),
    ).toEqual([H, H + HOUR_MS]);
    expect(() =>
      joinFunding([
        [H, 1, 0],
        [H, 2, 0],
      ]),
    ).toThrow("two funding rows");
  });

  it("charges a settlement at the mark of the row stamped at its hour, through the kit", async () => {
    const kit = await loadResearch();
    const marks = newMarks(coins, day, day + 86_400_000);
    const H = day + 2 * HOUR_MS;
    addCtxs(
      marks,
      [
        head,
        row(H - MINUTE_MS, "SOL", "150"),
        row(H, "SOL", "160"),
        row(H + MINUTE_MS, "SOL", "170"),
      ].join("\n"),
      Infinity,
    );
    const mk = marketOf(kit, coins.byName.get("SOL")!, marks, [
      [H, 0.001, H + 17],
    ]);
    expect(kit.panel.markAtMinuteEnd(mk, H - 1)).toBe(160);
    expect(kit.panel.fundingBetween(mk, H - HOUR_MS, H)).toEqual({
      sum: 0.001 * 160,
      missing: 0,
    });
    expect(kit.panel.fundingBetween(mk, H, H + HOUR_MS)).toEqual({
      sum: 0,
      missing: 1,
    });
  });
});

describe("the books (H8)", () => {
  const T = Date.parse("2025-07-15T12:00:00Z");
  const snap = (coin: string, time: number, bid: string, ask: string) =>
    JSON.stringify({
      time: "2025-07-15T12:00:01.4",
      ver_num: 1,
      raw: {
        channel: "l2Book",
        data: {
          coin,
          time,
          levels: [
            [
              { px: bid, sz: "2", n: 1 },
              { px: String(Number(bid) - 1), sz: "3", n: 2 },
            ],
            [{ px: ask, sz: "4", n: 1 }],
          ],
        },
      },
    });

  it("takes the coin's last snapshot at or before x, the later line on a tie", () => {
    const text = [
      snap("SOL", T - 500, "99", "101"),
      snap("SOL", T, "100", "102"),
      snap("SOL", T, "100.5", "102"),
      snap("BTC", T, "1", "2"),
      "{not json",
      snap("SOL", T + 540, "98", "100"),
    ].join("\n");
    const r = lastAtOrBefore(Buffer.from(text), "SOL", T + 100);
    expect(r.lines).toBe(6);
    expect(r.failed).toBe(2);
    expect(r.book).toEqual({
      ts: T,
      bids: [
        [100.5, 2],
        [99.5, 3],
      ],
      asks: [[102, 4]],
    });
    expect(lastAtOrBefore(Buffer.from(text), "SOL", T - 501).book).toBeNull();
    // A snapshot at x itself is at or before x.
    expect(lastAtOrBefore(Buffer.from(text), "SOL", T).book?.bids[0]).toEqual([
      100.5, 2,
    ]);
  });

  it("names the files of x's hour, and of the hour before in its first 10 seconds", () => {
    expect(bookKey("kPEPE", Date.parse("2025-07-15T03:00:00Z"))).toBe(
      "market_data/20250715/3/l2Book/kPEPE.lz4",
    );
    expect(bookHours(T + 9_999)).toEqual([T, T - HOUR_MS]);
    expect(bookHours(T + 10_000)).toEqual([T]);
    expect(bookHours(T + HOUR_MS - 1)).toEqual([T]);
  });
});
