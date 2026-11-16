/**
 * WAVE-H's pass over fill files and its rehearsal on SIZING (rules.md H1,
 * H2, H5, H8; R2, R3, R5, R9), in a synthetic store compressed by lz4js's
 * own encoder: the counts the pass keeps, the stop on a day's failures, the
 * books the legs need, the tape, the sealed outcomes, and no TEST file ever
 * opened.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { loadResearch, type Research } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { loadCoins } from "../src/waveh/coins.js";
import { SIZING_START, TEST_START } from "../src/waveh/instants.js";
import { lookStep1 } from "../src/waveh/look.js";
import { CLOSED, SealedError } from "../src/waveh/gate.js";
import { bookKey } from "../src/waveh/keys.js";
import { BooksNeeded, priceSpot, type Ctx } from "../src/waveh/legs.js";
import { newPass, passFile } from "../src/waveh/pass.js";
import { rehearse } from "../src/waveh/rehearse.js";
import { Settings, windowEnd } from "../src/waveh/run.js";
import { StoreError, manifestList } from "../src/waveh/store.js";
import {
  addr,
  cleanScratch,
  dayOf,
  fillKey,
  liquidation,
  lz4js,
  makeStore,
  scratch,
  sha,
  snapshot,
  taker,
} from "./waveh-world.js";

afterEach(cleanScratch);
const coins = loadCoins();
let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

describe("the pass over fill files (H2, H4, R3)", { timeout: 60_000 }, () => {
  const T = Date.parse("2025-07-27T08:00:00Z");
  const ctxOf = (files: Map<string, string>) => {
    const { store } = makeStore(files, false);
    return {
      store,
      list: manifestList(
        readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
      ),
    };
  };

  it("counts a fill both formats hold once, and keeps the legs, the late records, the blocks and the top taker rate", () => {
    const [own, cp] = liquidation(1, "SOL", "A", T + 1_000, 7);
    const block = (n: number, events: string[]) =>
      JSON.stringify({
        local_time: "x",
        block_time: "x",
        block_number: n,
        events: events.map((e) => JSON.parse(e) as unknown),
      });
    const files = new Map([
      [
        fillKey(T),
        [own, cp, taker("SOL", "B", T + 2_000, "100", "2", 8)].join("\n"),
      ],
      [
        fillKey(T, "node_fills_by_block"),
        [
          block(10, [own!, cp!]),
          block(11, []),
          block(14, [
            taker("SOL", "B", T + 3_000, "100", "1", 9).replace(
              '"fee":"0.01"',
              '"fee":"0.045"',
            ),
          ]),
          block(13, [taker("SOL", "A", TEST_START, "1", "1", 10)]),
          block(15, [
            taker("BTC", "B", T + 4_000, "100", "1", 11).replace(
              '"fee":"0.01"',
              '"fee":"9"',
            ),
          ]),
          block(15, []),
          // A maker's fee and a builder's are no taker's base rate.
          block(17, [
            taker("SOL", "B", T + 5_000, "100", "1", 12)
              .replace('"crossed":true', '"crossed":false')
              .replace('"fee":"0.01"', '"fee":"1.0"'),
            taker("SOL", "B", T + 6_000, "100", "1", 13).replace(
              '"fee":"0.01"',
              '"fee":"1.0","builderFee":"0.1"',
            ),
          ]),
        ].join("\n"),
      ],
    ]);
    const { store, list } = ctxOf(files);
    const pass = newPass();
    const seen = new Set<string>();
    for (const key of [fillKey(T), fillKey(T, "node_fills_by_block")])
      passFile(pass, seen, CLOSED, store, list, key, coins, TEST_START);
    expect(pass.counted).toEqual([
      {
        t: T + 1_000,
        iid: 5,
        addr: addr(1),
        side: -1,
        tid: "7",
        method: "market",
      },
    ]);
    expect(Object.fromEntries(pass.legs)).toEqual({
      "2025-07|counted|market": 1,
      "2025-07|counterparty|market": 1,
    });
    expect(pass.days.get("2025-07-27")).toEqual({ records: 10, failed: 0 });
    expect(pass.late).toBe(1);
    // 12 and 13, then 16; 13 after 14 and 15 twice go back.
    expect(Object.fromEntries(pass.blocks.missing)).toEqual({
      "2025-07-27": 3,
    });
    expect(pass.blocks.back).toBe(2);
    expect(pass.topTaker.get("2025-07")).toBeCloseTo(0.00045, 12);
  });

  it("stops on a day with more than 1%, and at least 10, of its records failing", () => {
    const good = taker("SOL", "B", T, "100", "1", 1);
    const lines = (bad: number, ok: number) =>
      [
        ...Array<string>(bad).fill("{not json"),
        ...Array<string>(ok).fill(good),
      ].join("\n");
    for (const [bad, ok, stops] of [
      [10, 989, true],
      [10, 990, false],
      [9, 100, false],
    ] as const) {
      const { store, list } = ctxOf(new Map([[fillKey(T), lines(bad, ok)]]));
      const run = () =>
        passFile(
          newPass(),
          new Set(),
          CLOSED,
          store,
          list,
          fillKey(T),
          coins,
          TEST_START,
        );
      if (stops) expect(run).toThrow(StoreError);
      else expect(run).not.toThrow();
    }
  });
});

describe(
  "the rehearsal on SIZING (the plan's part 3)",
  { timeout: 120_000 },
  () => {
    const minute = (t: number) => t - (t % MINUTE_MS);
    // A SOL wave on 2025-06-10 (its entry's book missing: the tape), a SOL wave late on
    // 2025-07-30 (its exit's tape reaches TEST: never read), a kPEPE wave late on
    // 2025-07-31 (its exit in TEST: left for the look).
    const W1 = Date.parse("2025-06-10T10:00:00Z");
    const W2 = Date.parse("2025-07-30T23:10:00Z");
    const W3 = Date.parse("2025-07-31T23:30:00Z");
    const world = () => {
      const files = new Map<string, string>();
      const add = (key: string, lines: string[]) =>
        files.set(
          key,
          [...(files.get(key)?.split("\n") ?? []), ...lines].join("\n"),
        );
      add(fillKey(W1), [
        ...liquidation(1, "SOL", "A", W1, 1),
        ...liquidation(2, "SOL", "A", W1 + 5 * MINUTE_MS, 2),
        taker("SOL", "B", W1 + 7 * MINUTE_MS + 100, "101", "4", 3),
        taker("SOL", "B", W1 + 7 * MINUTE_MS + 200, "102", "100", 4),
      ]);
      // After 2025-07-27 08h only `node_fills_by_block` is read (H2).
      add(fillKey(W2, "node_fills_by_block"), [
        JSON.stringify({
          block_number: 1,
          events: [
            ...liquidation(3, "SOL", "A", W2, 5),
            ...liquidation(4, "SOL", "A", W2 + 10 * MINUTE_MS, 6),
          ].map((l) => JSON.parse(l) as unknown),
        }),
      ]);
      // A tape fill its writer put in the next hour's file: the tape reads both.
      add(fillKey(W2 + HOUR_MS, "node_fills_by_block"), [
        JSON.stringify({
          block_number: 3,
          events: [
            JSON.parse(
              taker("SOL", "B", W2 + 12 * MINUTE_MS + 500, "99", "50", 7),
            ) as unknown,
          ],
        }),
      ]);
      add(fillKey(W3, "node_fills_by_block"), [
        JSON.stringify({
          block_number: 2,
          events: [
            ...liquidation(5, "kPEPE", "B", W3, 8),
            ...liquidation(6, "kPEPE", "B", W3 + 5 * MINUTE_MS, 9),
          ].map((l) => JSON.parse(l) as unknown),
        }),
      ]);
      // Marks: SOL at 100 every minute; funding: SOL hourly at 0.00001.
      const head =
        "time,coin,funding,open_interest,prev_day_px,day_ntl_vlm,premium,oracle_px,mark_px,mid_px,impact_bid_px,impact_ask_px";
      for (
        let d = Date.parse("2025-05-25T00:00:00Z");
        d < TEST_START;
        d += DAY_MS
      ) {
        const rows = [head];
        for (let m = 0; m < 1_440; m++)
          rows.push(
            `${new Date(d + m * MINUTE_MS).toISOString().replace(".000Z", "Z")},SOL,0,1,1,1,0,1,100,1,1,1`,
          );
        files.set(`asset_ctxs/${dayOf(d)}.csv.lz4`, rows.join("\n"));
      }
      const edges = [
        "2025-05-25",
        "2025-06-14",
        "2025-07-04",
        "2025-07-24",
        "2025-08-01",
      ].map((d) => Date.parse(`${d}T00:00:00Z`));
      for (let i = 0; i + 1 < edges.length; i++) {
        const rows = [];
        for (let h = edges[i]!; h < edges[i + 1]!; h += HOUR_MS)
          rows.push({
            coin: "SOL",
            fundingRate: "0.00001",
            premium: "0",
            time: h + 17,
          });
        files.set(
          `info/fundingHistory/SOL/${edges[i]}.json`,
          JSON.stringify(rows),
        );
      }
      return files;
    };

    it("lists the legs' book files and stops until the book list answers each", async () => {
      const { store } = makeStore(world());
      const root = mkdtempSync(path.join(tmpdir(), "waveh-root-"));
      scratch.push(root);
      const ctx: Ctx = {
        store,
        list: manifestList(
          readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
        ),
        coins,
        kit,
        pace: () => Promise.resolve(),
        log: () => {},
      };
      const err: unknown = await rehearse(ctx, root).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(BooksNeeded);
      expect((err as Error).message).toBe("4 of 4 book files");
      const x1 = W1 + 7 * MINUTE_MS;
      const x2 = W2 + 12 * MINUTE_MS;
      expect(
        readFileSync(path.join(root, "rehearsal", "books-needed.txt"), "utf8"),
      ).toBe(
        `${[
          bookKey("SOL", minute(x1) - (x1 % HOUR_MS) + 0),
          bookKey("SOL", x1 - (x1 % HOUR_MS) + DAY_MS),
          bookKey("SOL", x2 - (x2 % HOUR_MS)),
          bookKey("SOL", x2 - (x2 % HOUR_MS) + DAY_MS),
        ]
          .sort()
          .join("\n")}\n`,
      );
      const counts = JSON.parse(
        readFileSync(path.join(root, "rehearsal", "counts.json"), "utf8"),
      ) as Record<string, unknown>;
      expect(counts).toMatchObject({
        counted: 6,
        M: 1,
        scanRows: 1,
        liquidatedAccounts: 6,
        slice0: {
          entries: 3,
          priceable: 2,
          leftForTheLook: 1,
          backstopEntries: 0,
        },
        booksNeeded: 4,
        booksLacking: 4,
        late: 0,
      });
    });

    it("prices the legs at the book or the tape, seals the outcomes and opens no TEST file", async () => {
      const files = world();
      const { store, put } = makeStore(files);
      const x1 = W1 + 7 * MINUTE_MS;
      const x2 = W2 + 12 * MINUTE_MS;
      const books: string[] = [];
      const book = (t: number) => {
        const key = bookKey("SOL", t - (t % HOUR_MS));
        const bytes = Buffer.from(
          lz4js.compress(Buffer.from(snapshot("SOL", t - 2_000))),
        );
        const file = path.join(store, ...key.split("/"));
        mkdirSync(path.dirname(file), { recursive: true });
        writeFileSync(file, bytes);
        books.push(
          JSON.stringify({ key, bytes: bytes.length, sha256: sha(bytes) }),
        );
      };
      books.push(
        JSON.stringify({
          key: bookKey("SOL", x1 - (x1 % HOUR_MS)),
          missing: true,
        }),
      );
      book(x1 + DAY_MS);
      book(x2);
      book(x2 + DAY_MS);
      writeFileSync(path.join(store, "books.jsonl"), `${books.join("\n")}\n`);
      // A TEST file in the list, which the rehearsal must never open: not even lz4.
      put(
        "node_fills_by_block/hourly/20250801/0.lz4",
        Buffer.from("never opened"),
      );
      const root = mkdtempSync(path.join(tmpdir(), "waveh-root-"));
      scratch.push(root);
      const lines = readFileSync(path.join(store, "manifest.jsonl"), "utf8");
      const garbage = [
        "node_fills_by_block/hourly/20250801/0.lz4",
        `info/fundingHistory/SOL/${TEST_START}.json`,
      ]
        .map((key) =>
          JSON.stringify({
            key,
            bytes: 12,
            sha256: sha(Buffer.from("never opened")),
          }),
        )
        .join("\n");
      const sizing = await rehearse(
        {
          store,
          list: manifestList(`${lines}${garbage}\n`),
          coins,
          kit,
          pace: () => Promise.resolve(),
          log: () => {},
        },
        root,
      );
      const dir = path.join(root, "rehearsal");
      const sealed = readFileSync(path.join(dir, "sizing-outcomes.jsonl.gz"));
      expect(sizing).toMatchObject({
        M: 1,
        counted: 6,
        outcomes: { positions: 3, sha256: sha(sealed) },
      });
      expect(
        JSON.parse(readFileSync(path.join(dir, "sizing.json"), "utf8")),
      ).toEqual(sizing);
      const report = JSON.parse(
        readFileSync(path.join(dir, "report.json"), "utf8"),
      ) as Record<string, unknown>;
      expect(report).toMatchObject({
        legsBySource: { "buy tape": 1, "buy book": 1, "sell book": 2 },
        tapeWhy: { "no book file": 1 },
        depthShortPositions: 0,
        unpriced: {},
        tapeMinusBookBps: { buy: { n: 1 }, sell: { n: 0 } },
      });
      // R2: the entry at 07-30 23:22 walked 50 at 99 on the tape against 100.1 at the book.
      expect(
        (report.tapeMinusBookBps as { buy: { median: number } }).buy.median,
      ).toBeCloseTo(((99 - 100.1) / 100.1) * 1e4, 9);
      const outcomes = gunzipSync(sealed)
        .toString("utf8")
        .trim()
        .split("\n")
        .map(
          (l) =>
            JSON.parse(l) as {
              spot: { t: number };
              priced: { legs: { source: string }[] } | null;
            },
        );
      expect(
        outcomes.map((o) => [
          o.spot.t,
          o.priced?.legs.map((l) => l.source) ?? null,
        ]),
      ).toEqual([
        [W1 + 5 * MINUTE_MS, ["tape", "book"]],
        [W2 + 10 * MINUTE_MS, ["book", "book"]],
        [W3 + 5 * MINUTE_MS, null],
      ]);
      expect(existsSync(path.join(dir, "counts.json"))).toBe(true);
    });

    it("slices the pool by M and prices slice 0's waves only", async () => {
      // 766 lone ADA liquidations 90 minutes apart: r(2) = 768 ÷ 2 ÷ 67.42 is the nearest 5.68.
      const files = new Map<string, string>();
      const add = (key: string, line: string) =>
        files.set(
          key,
          [...(files.get(key)?.split("\n") ?? []), line].join("\n"),
        );
      const T = Date.parse("2025-05-26T00:00:00Z");
      for (let i = 0; i < 766; i++)
        add(
          fillKey(T + i * 90 * MINUTE_MS),
          liquidation(
            1_000 + i,
            "ADA",
            "A",
            T + i * 90 * MINUTE_MS,
            100 + i,
          )[0]!,
        );
      // Accounts 2 and 4 (slice 0 of 2) in SOL; 3 and 5 (slice 1) in kPEPE.
      for (const [n, coin, t] of [
        [2, "SOL", W1],
        [4, "SOL", W1 + 5 * MINUTE_MS],
        [3, "kPEPE", W1 + 10 * DAY_MS],
        [5, "kPEPE", W1 + 10 * DAY_MS + 5 * MINUTE_MS],
      ] as const)
        for (const line of liquidation(n, coin, "A", t, 9_000 + n))
          add(fillKey(t), line);
      const { store } = makeStore(files);
      const root = mkdtempSync(path.join(tmpdir(), "waveh-root-"));
      scratch.push(root);
      const ctx: Ctx = {
        store,
        list: manifestList(
          readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
        ),
        coins,
        kit,
        pace: () => Promise.resolve(),
        log: () => {},
      };
      await expect(rehearse(ctx, root)).rejects.toThrow("2 of 2 book files");
      const counts = JSON.parse(
        readFileSync(path.join(root, "rehearsal", "counts.json"), "utf8"),
      ) as { M: number; slice0: { entries: number; byCoin: object } };
      expect(counts.M).toBe(2);
      expect(counts.slice0).toMatchObject({ entries: 1, byCoin: { SOL: 1 } });
      const x = W1 + 7 * MINUTE_MS;
      expect(
        readFileSync(path.join(root, "rehearsal", "books-needed.txt"), "utf8"),
      ).toBe(
        `${bookKey("SOL", x - (x % HOUR_MS))}\n${bookKey("SOL", x - (x % HOUR_MS) + DAY_MS)}\n`,
      );
    });

    it("leaves a position for the look when a leg has no book and its tape is sealed", () => {
      const { store } = makeStore(new Map(), false);
      const xIn = Date.parse("2025-07-30T23:22:00Z");
      const xOut = xIn + DAY_MS;
      const inKey = bookKey("SOL", xIn - (xIn % HOUR_MS));
      const bytes = Buffer.from(
        lz4js.compress(Buffer.from(snapshot("SOL", xIn - 1_000))),
      );
      mkdirSync(path.dirname(path.join(store, ...inKey.split("/"))), {
        recursive: true,
      });
      writeFileSync(path.join(store, ...inKey.split("/")), bytes);
      const books = {
        files: new Map([[inKey, sha(bytes)]]),
        missing: new Set([bookKey("SOL", xOut - (xOut % HOUR_MS))]),
      };
      const T0 = Date.parse("2025-07-29T00:00:00Z");
      const mk = kit.panel.marketFrom({
        iid: 5,
        symbol: "SOL",
        category: "crypto",
        start: T0,
        end: T0 + 3 * DAY_MS,
        firstTrade: null,
        retired: null,
        marks: new Array<number>((3 * DAY_MS) / MINUTE_MS).fill(100),
        klines: { minute: [], trades: [], volume: [] },
        funding: [],
      });
      const spot = {
        slice: 0,
        iid: 5,
        t: xIn - 120_000,
        side: -1 as const,
        dir: 1 as const,
        xIn,
        xOut,
        method: "market",
        accounts: [addr(3), addr(4)],
      };
      const ctx: Ctx = {
        store,
        list: new Map(),
        coins,
        kit,
        pace: () => Promise.resolve(),
        log: () => {},
      };
      const out = priceSpot(
        ctx,
        CLOSED,
        books,
        new Map([
          ["0|0", []],
          ["0|1", null],
        ]),
        mk,
        spot,
        "0",
        null,
      );
      expect(out.priced).toBeNull();
      expect(out.legs.map((l) => [l.source, l.why, l.file])).toEqual([
        ["book", null, inKey],
        ["sealed", "no book file", null],
      ]);
    });

    it("refuses a missing SIZING fill file, and settings with one folder inside the other", async () => {
      const { store } = makeStore(new Map());
      const list = new Map(
        manifestList(readFileSync(path.join(store, "manifest.jsonl"), "utf8")),
      );
      list.delete(fillKey(SIZING_START));
      const root = mkdtempSync(path.join(tmpdir(), "waveh-root-"));
      scratch.push(root);
      await expect(
        rehearse(
          {
            store,
            list,
            coins,
            kit,
            pace: () => Promise.resolve(),
            log: () => {},
          },
          root,
        ),
      ).rejects.toThrow("1 SIZING fill files are not in the store's list");
      expect(
        Settings.safeParse({ WAVEH_STORE: "F:/a", WAVEH_ROOT: "F:/a/b" })
          .success,
      ).toBe(false);
      expect(
        Settings.safeParse({ WAVEH_STORE: "F:/a/b", WAVEH_ROOT: "F:/a" })
          .success,
      ).toBe(false);
      expect(
        Settings.safeParse({ WAVEH_STORE: "F:/a", WAVEH_ROOT: "F:/ab" })
          .success,
      ).toBe(true);
      expect(
        Settings.safeParse({ WAVEH_STORE: "a", WAVEH_ROOT: "F:/b" }).success,
      ).toBe(false);
      expect(Settings.safeParse({ WAVEH_ROOT: "F:/b" }).success).toBe(false);
    });

    it("waits out 02:30–06:00Z and 10:25–11:15Z", () => {
      const d = Date.parse("2025-07-01T00:00:00Z");
      const at = (h: number, m: number) => d + h * HOUR_MS + m * MINUTE_MS;
      expect(windowEnd(at(2, 29))).toBeNull();
      expect(windowEnd(at(2, 30))).toBe(at(6, 0));
      expect(windowEnd(at(5, 59))).toBe(at(6, 0));
      expect(windowEnd(at(6, 0))).toBeNull();
      expect(windowEnd(at(10, 25))).toBe(at(11, 15));
      expect(windowEnd(at(11, 15))).toBeNull();
    });
  },
);

describe("the look's first step (H15, R3)", { timeout: 120_000 }, () => {
  // A SOL wave in TEST (2025-09-10), in `node_fills_by_block` files; SIZING holds none.
  const W = Date.parse("2025-09-10T10:00:00Z");
  let store: string;
  let list: ReturnType<typeof manifestList>;
  beforeAll(() => {
    const block = (n: number, lines: string[]) =>
      JSON.stringify({
        block_number: n,
        events: lines.map((l) => JSON.parse(l) as unknown),
      });
    const files = new Map([
      [
        fillKey(W, "node_fills_by_block"),
        [
          block(1, liquidation(1, "SOL", "A", W, 1)),
          block(2, liquidation(2, "SOL", "A", W + 5 * MINUTE_MS, 2)),
        ].join("\n"),
      ],
    ]);
    ({ store } = makeStore(files, "to DATA END"));
    scratch.splice(scratch.indexOf(store), 1);
    list = manifestList(
      readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
    );
  });
  afterAll(() => rmSync(store, { recursive: true, force: true }));
  const ctx = (): Ctx => ({
    store,
    list,
    coins,
    kit,
    pace: () => Promise.resolve(),
    log: () => {},
  });

  it("reads every fill file with the gate open, holds M to sizing.json and lists slice 0's books", async () => {
    const step = await lookStep1(ctx(), { open: true }, 1);
    expect(step.M).toBe(1);
    expect(step.spots.map((s) => [s.t, s.iid, s.dir])).toEqual([
      [W + 5 * MINUTE_MS, 5, 1],
    ]);
    const x = W + 7 * MINUTE_MS;
    expect(step.needed).toEqual([
      bookKey("SOL", x - (x % HOUR_MS)),
      bookKey("SOL", x - (x % HOUR_MS) + DAY_MS),
    ]);
    expect(step.late).toEqual([]);
    expect(step.sha256).toBe(
      sha(Buffer.from(JSON.stringify({ spots: step.spots, late: [] }))),
    );
    expect(step.counts).toMatchObject({
      files: 8_845,
      counted: 2,
      M: 1,
      sizingCoins: [],
      slice0: {
        positions: 1,
        byMonth: { "2025-09": 1 },
        backstopEntries: 0,
        episodesADayByMonth: { "2025-08": 0, "2025-09": 1 / 30, "2026-05": 0 },
        sizingPositions: 0,
        sizingLate: 0,
      },
    });
  });

  it("stops when M differs from sizing.json's, and never reads TEST with the gate closed", async () => {
    await expect(lookStep1(ctx(), { open: true }, 2)).rejects.toThrow(
      "M is 1 on SIZING, sizing.json's 2",
    );
    await expect(lookStep1(ctx(), CLOSED, 1)).rejects.toThrow(SealedError);
  });
});
