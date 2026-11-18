/**
 * The counted fills, the legs, the gates and explore's frame
 * (src/polish/counted.ts, legs.ts, gates.ts, explore.ts) on a synthetic
 * WAVE-H world: WAVE-H's own rehearsal and look write the references,
 * polish's `extract` and `gates` on the same raw store pass every gate, each
 * break fails its own gate, and explore opens only the trusted store. The
 * tape and the minute price apart, on a store across a month's end.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadResearch, type Research } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { explore, trustedStore, wholeStore } from "../src/polish/explore.js";
import { extract } from "../src/polish/extract.js";
import { dayFromStore } from "../src/polish/days.js";
import {
  WAVEH_EXPECTED,
  g0,
  g1,
  g2,
  g3,
  g4,
  g5,
  g6,
  runGates,
  type GatesInput,
  type Step1,
} from "../src/polish/gates.js";
import {
  Tape,
  fundingOf,
  marketsFrom,
  minuteColumn,
  minutePrice,
} from "../src/polish/legs.js";
import {
  GATES,
  GATES_FILE,
  libraryOf,
  type Library,
} from "../src/polish/library.js";
import { WAVEH_RANGE, type Range } from "../src/polish/range.js";
import { SealedError } from "../src/polish/seal.js";
import {
  Store,
  openStore,
  partitionDir,
  type FileCounts,
  type Manifest,
  type Partition,
  type Table,
} from "../src/polish/store.js";
import { BACKSTOP, fortyOf } from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import { DATA_END, TEST_START } from "../src/waveh/instants.js";
import { bookKey, ctxsKey, fundingKey } from "../src/waveh/keys.js";
import { BooksNeeded, type Ctx } from "../src/waveh/legs.js";
import { look } from "../src/waveh/look.js";
import { SizingFile, rehearse } from "../src/waveh/rehearse.js";
import { manifestList } from "../src/waveh/store.js";
import { addr, record, trade } from "./polish-world.js";
import {
  CTXS_HEAD,
  block,
  cleanScratch,
  ctxsRow,
  dayOf,
  fillKey,
  fundingFiles,
  lz4,
  makeStore,
  scratch,
  sha,
  snapshot,
} from "./waveh-world.js";

afterAll(cleanScratch);

const coins = loadCoins();
const forty = [...fortyOf(coins)];
const small = coins.list.map((c) => c.name);
const tmp = (name: string) => {
  const d = mkdtempSync(path.join(tmpdir(), `polish-${name}-`));
  scratch.push(d);
  return d;
};
const hourOf = (t: number) => t - (t % HOUR_MS);
const dayStart = (t: number) => t - (t % DAY_MS);
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const noPace = () => Promise.resolve();

// A SOL wave in SIZING (priced by the rehearsal); a kPEPE wave late on
// 2025-07-31 (its exit in TEST: left for the look); a SOL wave in TEST
// (WAVE-H's one position, its entry book missing: the tape). Block numbers
// with gaps and a line that goes back.
const W1 = Date.parse("2025-06-10T10:00:00Z");
const W3 = Date.parse("2025-07-31T23:30:00Z");
const W = Date.parse("2025-09-10T10:00:00Z");
const ENTRY = 7 * MINUTE_MS;

/** A liquidated account's own taker leg and the maker's, with every key a fill carries (liq keeps closedPnl, oid and dir). */
function liquidation(
  user: number,
  coin: string,
  side: "A" | "B",
  time: number,
  tid: number,
) {
  const liquidation = {
    liquidatedUser: addr(user),
    markPx: "100",
    method: "market",
  };
  const leg = {
    coin,
    px: "100",
    sz: "1",
    time,
    fee: "0.045",
    tid,
    liquidation,
  };
  return [
    record(addr(user), {
      ...leg,
      side,
      startPosition: side === "A" ? "1.0" : "-1.0",
      crossed: true,
    }),
    record(addr(999), {
      ...leg,
      side: side === "A" ? "B" : "A",
      startPosition: side === "A" ? "-5.0" : "5.0",
      crossed: false,
    }),
  ];
}

/** A taker's trade on `side`, no liquidation, with its maker's record. */
const taker = (
  coin: string,
  side: "A" | "B",
  time: number,
  px: string,
  sz: string,
  tid: number,
) => trade(addr(500 + tid), addr(998), { coin, side, time, px, sz, tid });

function world() {
  const files = new Map<string, string>();
  files.set(
    fillKey(W1),
    [
      ...liquidation(1, "SOL", "A", W1, 1),
      ...liquidation(2, "SOL", "A", W1 + 5 * MINUTE_MS, 2),
      ...trade(addr(31), addr(32), {
        coin: "BTC",
        side: "B",
        time: W1 + 1_000,
        px: "65000",
        sz: "0.5",
        tid: 21,
      }),
      // A BTC backstop: the account's own leg a maker's, the vault's a taker's.
      record(addr(41), {
        coin: "BTC",
        side: "A",
        time: W1 + 2_000,
        px: "64000",
        sz: "0.1",
        startPosition: "0.1",
        crossed: false,
        tid: 22,
        liquidation: {
          liquidatedUser: addr(41),
          markPx: "64000",
          method: "backstop",
        },
      }),
      record(addr(42), {
        coin: "BTC",
        side: "B",
        time: W1 + 2_000,
        px: "64000",
        sz: "0.1",
        crossed: true,
        tid: 22,
        liquidation: {
          liquidatedUser: addr(41),
          markPx: "64000",
          method: "backstop",
        },
      }),
    ].join("\n"),
  );
  // A trade at the very start of the day after W's: that day's, not W's.
  files.set(
    fillKey(dayStart(W) + DAY_MS, "node_fills_by_block"),
    block(10, taker("SOL", "B", dayStart(W) + DAY_MS, "100", "1", 23)),
  );
  files.set(
    fillKey(W3, "node_fills_by_block"),
    [
      block(1, [
        ...liquidation(5, "kPEPE", "B", W3, 3),
        ...liquidation(6, "kPEPE", "B", W3 + 5 * MINUTE_MS, 4),
      ]),
      // Stamped from TEST's start in a SIZING file: in neither part (R5).
      block(
        4,
        liquidation(9, "XRP", "A", Date.parse("2025-08-01T00:00:00.050Z"), 13),
      ),
    ].join("\n"),
  );
  // TEST's first file holding two fills stamped before TEST's start: in neither part (H1).
  files.set(
    fillKey(TEST_START, "node_fills_by_block"),
    block(3, [
      ...liquidation(10, "XRP", "A", TEST_START - 200, 16),
      ...liquidation(12, "XRP", "A", TEST_START - 100, 17),
    ]),
  );
  files.set(
    fillKey(W, "node_fills_by_block"),
    [
      block(8, liquidation(3, "SOL", "A", W, 5)),
      block(9, [
        ...liquidation(4, "SOL", "A", W + 5 * MINUTE_MS, 6),
        ...taker("SOL", "B", W + ENTRY + 100, "101", "20", 7),
        ...taker("SOL", "A", W + ENTRY + 200, "100.5", "20", 8),
        // A coin with no record in SIZING: one of THE LATE COINS.
        ...taker("DOGE", "B", W + 1_000, "0.2", "1000", 14),
      ]),
    ].join("\n"),
  );
  const marked: [string, number[]][] = [
    ["SOL", [W1, W].flatMap((t) => [t, t + DAY_MS, t + 2 * DAY_MS])],
    ["kPEPE", [W3, W3 + DAY_MS, W3 + 2 * DAY_MS]],
    ["BTC", [W1]],
  ];
  // ETH on W's day: a row of it in the day before's file, and one stamp twice (the first stands).
  const extra = new Map([
    [dayStart(W) - DAY_MS, [ctxsRow("ETH", dayStart(W) + 30_000, 2500)]],
    [
      dayStart(W),
      [2501, 2502].map((mark) =>
        ctxsRow("ETH", dayStart(W) + 5 * MINUTE_MS, mark),
      ),
    ],
  ]);
  for (let d = Date.parse("2025-05-25T00:00:00Z"); d < DATA_END; d += DAY_MS) {
    const rows = [CTXS_HEAD];
    for (const [coin, days] of marked)
      if (days.some((t) => dayStart(t) === d))
        for (let m = 0; m < 1_440; m++)
          rows.push(ctxsRow(coin, d + m * MINUTE_MS, 100));
    rows.push(...(extra.get(d) ?? []));
    files.set(`asset_ctxs/${dayOf(d)}.csv.lz4`, rows.join("\n"));
  }
  const rows = [];
  for (const [coin, from] of [
    ["SOL", dayStart(W1)],
    ["kPEPE", dayStart(W3)],
    ["SOL", dayStart(W)],
  ] as const)
    for (let h = from; h < from + 3 * DAY_MS; h += HOUR_MS)
      rows.push({ coin, fundingRate: "0.00001", premium: "0", time: h + 17 });
  for (const [key, text] of fundingFiles(rows)) files.set(key, text);
  return files;
}

type Line = {
  priced: { net: number };
  legs: { tids: string[] }[];
};

describe("the gates on a WAVE-H world", { timeout: 300_000 }, () => {
  let o: GatesInput;
  let lib: Library;
  let step1: Step1;
  let root: string;
  let analyzer: string;

  beforeAll(async () => {
    const { store } = makeStore(world(), "to DATA END");
    root = tmp("waveh-root");
    const listText = readFileSync(path.join(store, "manifest.jsonl"));
    const list = manifestList(listText.toString("utf8"));
    const listSha256 = sha(listText);
    const kit: Research = await loadResearch();
    const ctx: Ctx = { store, list, coins, kit, pace: noPace, log: () => {} };
    const books: string[] = [];
    const putBook = (coin: string, x: number) => {
      const key = bookKey(coin, hourOf(x));
      const bytes = lz4(snapshot(coin, x - 2_000));
      const file = path.join(store, ...key.split("/"));
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, bytes);
      books.push(
        JSON.stringify({ key, bytes: bytes.length, sha256: sha(bytes) }),
      );
    };
    const writeBooks = () =>
      writeFileSync(path.join(store, "books.jsonl"), `${books.join("\n")}\n`);
    putBook("SOL", W1 + ENTRY);
    putBook("SOL", W1 + ENTRY + DAY_MS);
    writeBooks();
    // WAVE-H's own rehearsal and look write the references.
    const sizing = SizingFile.parse(await rehearse(ctx, root));
    await expect(
      look(ctx, { open: true }, root, sizing, listSha256),
    ).rejects.toThrow(BooksNeeded);
    books.push(
      JSON.stringify({ key: bookKey("SOL", hourOf(W + ENTRY)), missing: true }),
    );
    putBook("SOL", W + ENTRY + DAY_MS);
    putBook("kPEPE", W3 + ENTRY);
    putBook("kPEPE", W3 + ENTRY + DAY_MS);
    writeBooks();
    await look(ctx, { open: true }, root, sizing, listSha256);
    step1 = JSON.parse(
      readFileSync(path.join(root, "look", "step1.json"), "utf8"),
    ) as Step1;
    // Polish's extraction of the same raw store.
    analyzer = tmp("analyzer");
    await extract({
      store,
      root: analyzer,
      list,
      listName: "manifest.jsonl",
      listSha256,
      range: WAVEH_RANGE,
      workers: 0,
      code: "4".repeat(64),
      wavehFrozen: "5".repeat(64),
      forty,
      small,
      pace: noPace,
      log: () => {},
    });
    o = {
      store: openStore(path.join(analyzer, "store")),
      raw: store,
      list,
      listSha256,
      look: path.join(root, "look"),
      sizing,
      sizingSha256: "6".repeat(64),
      wavehFrozen: "5".repeat(64),
      gate: { open: true },
      code: "4".repeat(64),
      fill: WAVEH_RANGE.fill,
      coins,
      forty,
      kit,
      expect: {
        everySlice: step1.positions,
        sampleDays: [W1, W3, TEST_START, W].map(iso),
      },
      pace: noPace,
      log: () => {},
    };
    lib = libraryOf(o);
  }, 300_000);

  it("reproduces WAVE-H's look: every gate passes, and gates.json names the manifest and the references", async () => {
    expect(step1).toMatchObject({
      M: 1,
      positions: 1,
      sizingLate: 1,
      counts: {
        counted: 6,
        late: 2,
        early: 2,
        blocks: { missing: { "2025-07-31": 2, "2025-09-10": 3 }, back: 1 },
      },
    });
    const dir = tmp("gates");
    const r = await runGates(o, dir);
    expect(
      Object.fromEntries(Object.entries(r.gates).map(([k, g]) => [k, g.pass])),
    ).toEqual({
      G0: true,
      G1: true,
      G2: true,
      G3: true,
      G4: true,
      G5: true,
      G6: true,
    });
    expect(r.passed).toBe(true);
    expect(
      JSON.parse(readFileSync(path.join(dir, "gates.json"), "utf8")),
    ).toEqual(JSON.parse(JSON.stringify(r)));
    expect(r.store.manifestSha256).toBe(
      sha(readFileSync(path.join(analyzer, "store", "manifest.json"))),
    );
    expect(r.references).toEqual({
      step1: sha(readFileSync(path.join(root, "look", "step1.json"))),
      positions: sha(
        readFileSync(path.join(root, "look", "positions.jsonl.gz")),
      ),
      sizing: "6".repeat(64),
      books: sha(readFileSync(path.join(o.raw, "books.jsonl"))),
      dataList: o.listSha256,
    });
    expect(r.gates.G1).toMatchObject({ counted: 6, late: 2, early: 2 });
    expect(r.gates.G2).toMatchObject({
      M: 1,
      positions: 1,
      sizingPositions: 2,
      sizingLate: 1,
      everySlice: 1,
      positionsSha256: step1.sha256,
    });
    expect(r.gates.G3).toMatchObject({
      lines: 3,
      priced: 1,
      sizingPriced: 2,
      largestBps: 0,
    });
    expect(r.gates.G4).toMatchObject({ unmarked: 0, problems: 0 });
    expect(r.gates.G4!.instants).toBe(26);
    const days = (
      r.gates.G6 as unknown as {
        days: { day: string; tapeRows: number; liqRows: number }[];
      }
    ).days;
    expect(days.map((d) => [d.day, d.tapeRows, d.liqRows])).toEqual([
      ["2025-06-10", 2, 6],
      ["2025-07-31", 4, 8],
      ["2025-08-01", 1, 2],
      ["2025-09-10", 5, 4],
    ]);
  });

  it("reads the settled funding as WAVE-H's rows, each at its nominal hour", () => {
    const rows = fundingOf(o.store, "SOL");
    expect(rows).toHaveLength(2 * 72);
    expect(rows[0]).toEqual([dayStart(W1), 0.00001, dayStart(W1) + 17]);
    expect(rows.at(-1)).toEqual([
      dayStart(W) + 3 * DAY_MS - HOUR_MS,
      0.00001,
      dayStart(W) + 3 * DAY_MS - HOUR_MS + 17,
    ]);
  });

  it("G0 fails on another list, on a store of other code and on a column that differs from the manifest", () => {
    expect(g0(o, step1)).toMatchObject({
      pass: true,
      storeCode: "4".repeat(64),
      thisCode: "4".repeat(64),
    });
    expect(g0({ ...o, listSha256: "0".repeat(64) }, step1).first).toEqual([
      "the store or the look was made from another list",
    ]);
    expect(g0({ ...o, code: "7".repeat(64) }, step1).first).toEqual([
      "the store was made by other code",
    ]);
    const file = path.join(
      analyzer,
      "store",
      "funding",
      "SOL",
      "2026-03",
      "rate.f64",
    );
    writeFileSync(file, Buffer.alloc(8));
    try {
      expect(g0(o, step1).first).toEqual([
        "funding/SOL/2026-03/rate.f64: differs from the manifest",
      ]);
    } finally {
      writeFileSync(file, Buffer.alloc(0));
    }
  });

  it("G0 names the scan's counters, fails on a record refused or misread, and holds every table's rows in to its rows out", () => {
    expect(g0(o, step1)).toMatchObject({
      pass: true,
      counters: { refused: 0, misread: 0, slowLines: 0, slowRecords: 0 },
    });
    const withFiles = (edit: (ls: FileCounts[]) => void) => {
      const lines = structuredClone(lib.files);
      edit(lines);
      const store = new Store(o.store.dir, o.store.manifest, o.store.id);
      store.files = () => lines;
      return g0({ ...o, store }, step1).first;
    };
    const withManifest = (edit: (m: Manifest) => void) => {
      const m = structuredClone(o.store.manifest);
      edit(m);
      return g0({ ...o, store: new Store(o.store.dir, m, o.store.id) }, step1)
        .first;
    };
    const busy = lib.files.findIndex((f) => f.takerRows > 0 && f.liqRows > 0);
    expect(withFiles((ls) => (ls[busy]!.refused = 2))).toEqual([
      "files.jsonl: 2 records a writer refused",
    ]);
    expect(withFiles((ls) => (ls[busy]!.misread = 1))).toEqual([
      "files.jsonl: 1 records misread",
    ]);
    expect(
      withFiles((ls) => {
        ls[busy]!.slowLines = 3;
        ls[busy]!.slowRecords = 4;
      }),
    ).toEqual([]);
    const { tape, bars, liq } = o.store.manifest.counts.merge as Record<
      "tape" | "bars" | "liq",
      { in: number; out: number; duplicates: number }
    >;
    expect(tape.in + bars.in).toBeGreaterThan(0);
    expect(liq.in).toBeGreaterThan(0);
    expect(withFiles((ls) => (ls[busy]!.takerRows += 1))).toEqual([
      `the parts' taker rows, as the merge's tape and bars in: ${tape.in + bars.in + 1}, not ${tape.in + bars.in}`,
    ]);
    expect(withFiles((ls) => (ls[busy]!.liqRows -= 1))).toEqual([
      `the parts' liq rows, as the merge's liq in: ${liq.in - 1}, not ${liq.in}`,
    ]);
    expect(withManifest((m) => (m.counts.merge.tape!.duplicates += 1))).toEqual(
      [`tape in, as its out and duplicates: ${tape.in}, not ${tape.in + 1}`],
    );
    expect(withManifest((m) => (m.counts.merge.bars!.in += 1))).toEqual([
      `the parts' taker rows, as the merge's tape and bars in: ${tape.in + bars.in}, not ${tape.in + bars.in + 1}`,
      `bars in, as its out and duplicates: ${bars.in + 1}, not ${bars.in}`,
    ]);
    expect(withManifest((m) => (m.counts.merge.liq!.out -= 1))).toEqual([
      `liq in, as its out and duplicates: ${liq.in}, not ${liq.in - 1}`,
      `the liq partitions' rows, as the merge's liq out: ${liq.out}, not ${liq.out - 1}`,
    ]);
    expect(withManifest((m) => (m.counts.merge.tape!.out += 1))).toEqual([
      `tape in, as its out and duplicates: ${tape.in}, not ${tape.in + 1}`,
      `the tape partitions' rows, as the merge's tape out: ${tape.out}, not ${tape.out + 1}`,
    ]);
    expect(withManifest((m) => delete m.counts.merge.bars)).toEqual([
      "the manifest has no merge counts of tape, bars and liq",
    ]);
  });

  it("G0 fails on a store some of whose records a writer refused, every stored row conserved (EXTRACT-REVIEW's refused-demo)", async () => {
    const D = Date.parse("2025-07-05T00:00:00Z");
    const fills = [fillKey(D + 12 * HOUR_MS), fillKey(D + 13 * HOUR_MS)];
    // An ETH liquidation without `dir`, and a SOL taker whose tid is 2^64: no writer stores either.
    const noDir = record(addr(7), {
      coin: "ETH",
      side: "A",
      time: D + 12 * HOUR_MS + 3_000,
      startPosition: "1.0",
      crossed: true,
      tid: 31,
      liquidation: {
        liquidatedUser: addr(7),
        markPx: "2500",
        method: "market",
      },
    }).replace('"dir":"Open Long",', "");
    const files = new Map<string, string>([
      [
        fills[0]!,
        [
          ...taker("SOL", "B", D + 12 * HOUR_MS + 1_000, "150", "1", 30),
          ...trade(addr(3), addr(2), {
            coin: "SOL",
            side: "A",
            time: D + 12 * HOUR_MS + 2_000,
            tid: "18446744073709551616",
          }),
          noDir,
        ].join("\n"),
      ],
      [
        fills[1]!,
        taker("SOL", "A", D + 13 * HOUR_MS, "151", "2", 32).join("\n"),
      ],
      [ctxsKey(D), `${CTXS_HEAD}\n`],
      ...coins.list.map(
        (c) => [fundingKey(c.name, D), "[]"] as [string, string],
      ),
    ]);
    const made = makeStore(files, false);
    const listText = readFileSync(path.join(made.store, "manifest.jsonl"));
    const list = manifestList(listText.toString("utf8"));
    const range: Range = {
      name: "WAVE-H",
      partial: null,
      fill: fills,
      days: [D],
      fundingStarts: [D],
      end: D + DAY_MS,
      grid: { start: D, minutes: 1440 },
      months: ["2025-07"],
    };
    const root = tmp("refused");
    await extract({
      store: made.store,
      root,
      list,
      listName: "manifest.jsonl",
      listSha256: sha(listText),
      range,
      workers: 0,
      code: o.code,
      wavehFrozen: o.wavehFrozen,
      forty,
      small,
      pace: noPace,
      log: () => {},
    });
    const store = openStore(path.join(root, "store"));
    expect(
      store.files().map((f) => [f.refused, f.takerRows, f.liqRows]),
    ).toEqual([
      [2, 2, 0],
      [0, 1, 0],
    ]);
    expect(
      g0(
        { ...o, store, list, listSha256: sha(listText), fill: fills },
        { ...step1, dataSha256: sha(listText) },
      ),
    ).toMatchObject({
      pass: false,
      counters: { refused: 2, misread: 0 },
      first: ["files.jsonl: 2 records a writer refused"],
    });
  });

  it("G0 fails on another WAVE-H freeze, users.bin's size, a partition missing, a column's bytes against its rows, files.jsonl's lines and their identity", () => {
    const withManifest = (edit: (m: Manifest) => void) => {
      const m = structuredClone(o.store.manifest);
      edit(m);
      return g0({ ...o, store: new Store(o.store.dir, m, o.store.id) }, step1)
        .first;
    };
    const isSol = (table: string, month: string) => (p: Partition) =>
      p.table === table && p.coin === "SOL" && p.month === month;
    expect(g0({ ...o, wavehFrozen: "6".repeat(64) }, step1).first).toEqual([
      "the store was made under another WAVE-H freeze",
    ]);
    expect(withManifest((m) => (m.dict.users.count += 1))).toEqual([
      "users.bin is not 20 bytes an address",
    ]);
    expect(
      withManifest(
        (m) =>
          (m.partitions = m.partitions.filter(
            (p) => !isSol("funding", "2026-03")(p),
          )),
      ),
    ).toEqual(["funding/SOL/2026-03: missing"]);
    const f = o.store.manifest.partitions.find(isSol("funding", "2025-09"))!;
    expect(f.rows).toBeGreaterThan(0);
    expect(
      withManifest(
        (m) => (m.partitions.find(isSol("funding", "2025-09"))!.rows += 1),
      ),
    ).toEqual([
      `funding/SOL/2025-09/time.f64: ${f.files["time.f64"]!.bytes} bytes for ${f.rows + 1} rows`,
      `funding/SOL/2025-09/rate.f64: ${f.files["rate.f64"]!.bytes} bytes for ${f.rows + 1} rows`,
    ]);
    const n = o.fill.length;
    expect(
      g0({ ...o, fill: [...o.fill, "node_fills/hourly/20990101/0.lz4"] }, step1)
        .first,
    ).toEqual([`files.jsonl: ${n} lines, ${n + 1} files`]);
    expect(
      g0({ ...o, list: new Map(o.list).set(o.fill[0]!, "f".repeat(64)) }, step1)
        .first,
    ).toEqual([`files.jsonl line 1 is not ${o.fill[0]} as listed`]);
  });

  it("G1 fails on a count, naming the field and the day", () => {
    expect(g1(o, lib, step1).pass).toBe(true);
    const broken = structuredClone(step1);
    const days = broken.counts.days as Record<string, { records: number }>;
    days["2025-09-10"]!.records += 1;
    (broken.counts as { late: number }).late += 1;
    expect(g1(o, lib, broken)).toMatchObject({
      pass: false,
      differ: ["days", "late"],
      daysDiffer: ["2025-09-10"],
    });
  });

  it("G2 fails on the positions' SHA-256, on M, and on the entries of every slice", () => {
    expect(g2(o, lib, step1).result.pass).toBe(true);
    expect(
      g2(o, lib, { ...step1, sha256: "0".repeat(64) }).result.differ,
    ).toEqual(["positionsSha256"]);
    expect(
      g2({ ...o, sizing: { ...o.sizing, M: 2 } }, lib, step1).result.differ,
    ).toEqual(["M"]);
    expect(
      g2({ ...o, expect: { ...o.expect, everySlice: 2 } }, lib, step1).result
        .differ,
    ).toEqual(["everySlice"]);
    expect(
      g2({ ...o, sizing: { ...o.sizing, counted: 5 } }, lib, step1).result
        .differ,
    ).toEqual(["sizingCounted"]);
    // M's scan, and slice 0's counts.
    expect(o.sizing.scan.length).toBeGreaterThan(0);
    expect(
      g2(
        {
          ...o,
          sizing: { ...o.sizing, scan: [...o.sizing.scan, o.sizing.scan[0]!] },
        },
        lib,
        step1,
      ).result.differ,
    ).toEqual(["scan"]);
    const slice0 = structuredClone(step1.counts.slice0) as {
      backstopEntries: number;
    };
    slice0.backstopEntries += 1;
    expect(
      g2(o, lib, { ...step1, counts: { ...step1.counts, slice0 } }).result
        .differ,
    ).toEqual(["slice0"]);
  });

  it("G3 fails on a price beyond 1e-9 bps, on a leg's tid, on a line missing; passes a price within", () => {
    const { spots, sizing } = g2(o, lib, step1);
    const lines = gunzipSync(
      readFileSync(path.join(root, "look", "positions.jsonl.gz")),
    )
      .toString("utf8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Line);
    const g3With = (edit: (ls: Line[]) => void) => {
      const ls = structuredClone(lines);
      edit(ls);
      const dir = tmp("look");
      writeFileSync(
        path.join(dir, "positions.jsonl.gz"),
        gzipSync(`${ls.map((l) => JSON.stringify(l)).join("\n")}\n`),
      );
      return g3({ ...o, look: dir }, lib, spots, sizing).result;
    };
    expect(g3With(() => {}).pass).toBe(true);
    const near = g3With((ls) => (ls[0]!.priced.net += 5e-10));
    expect(near.pass).toBe(true);
    expect(near.largestBps).toBeGreaterThan(4e-10);
    expect(near.largestBps).toBeLessThan(6e-10);
    expect(g3With((ls) => (ls[0]!.priced.net += 2e-9))).toMatchObject({
      pass: false,
      first: ["line 1 differs"],
    });
    expect(lines[0]!.legs[0]!.tids).toEqual(["7"]);
    expect(g3With((ls) => (ls[0]!.legs[0]!.tids = ["8"]))).toMatchObject({
      pass: false,
      first: ["line 1 differs"],
    });
    expect(g3With((ls) => ls.pop())).toMatchObject({
      pass: false,
      first: ["2 lines, 3 positions"],
    });
  });

  it("G4 fails where a missing mark would be filled by a trade", () => {
    const two = g2(o, lib, step1);
    const { wave } = g3(o, lib, two.spots, two.sizing);
    expect(g4(o, lib, wave).pass).toBe(true);
    // SOL's marks gone for the 10 minutes before WAVE-H's entry: its trades fill the minute.
    const sol = coins.byName.get("SOL")!.assetId;
    const mk = lib.markets.get(sol)!;
    const marks = mk.marks.slice();
    const at = (W + ENTRY - mk.start) / MINUTE_MS;
    marks.fill(NaN, at - 10, at + 1);
    const holed = new Map(lib.markets).set(sol, { ...mk, marks });
    expect(g4(o, { ...lib, markets: holed }, wave)).toMatchObject({
      pass: false,
      unmarked: 1,
      problems: 1,
      first: [`SOL ${new Date(W + ENTRY).toISOString()}`],
    });
    // The first settlement read at the minute before its hour: no mark there, and no trade.
    const h = hourOf(W + ENTRY) + HOUR_MS;
    const before = mk.marks.slice();
    const m = (h - 1 - mk.start - ((h - 1 - mk.start) % MINUTE_MS)) / MINUTE_MS;
    before.fill(NaN, m - 5, m + 1);
    expect(
      g4(
        o,
        {
          ...lib,
          markets: new Map(lib.markets).set(sol, { ...mk, marks: before }),
        },
        wave,
      ),
    ).toMatchObject({ pass: true, unmarked: 1, problems: 0 });
  });

  it("G5 pairs a trade split across two files next in order, and fails on any record left unpaired, by file, coin and tid", () => {
    expect(g5(o, lib)).toMatchObject({ pass: true, straddled: 0, problems: 0 });
    expect(lib.files.every((f) => f.unpaired.length === 0)).toBe(true);
    const i = lib.files.findIndex((f) => f.pairs.length > 0);
    const g5With = (open: Record<number, [string, string, number][]>) => {
      const files = structuredClone(lib.files);
      for (const [at, list] of Object.entries(open))
        files[Number(at)]!.unpaired = list;
      return g5(o, { ...lib, files });
    };
    const key = (at: number) => lib.files[at]!.key;
    // A taker at a file's end, its maker in the next file; and a maker first, its taker next.
    expect(
      g5With({
        [i]: [["SOL", "77", 1]],
        [i + 1]: [
          ["SOL", "77", -1],
          ["ETH", "5", -1],
        ],
        [i + 2]: [["ETH", "5", 1]],
      }),
    ).toMatchObject({ pass: true, straddled: 2, problems: 0 });
    // Left alone; two files apart; two takers and two makers; two coins.
    expect(g5With({ [i]: [["SOL", "77", 1]] })).toMatchObject({
      pass: false,
      first: [`${key(i)} SOL 77: 1 taker unpaired`],
    });
    expect(
      g5With({ [i]: [["SOL", "77", 1]], [i + 2]: [["SOL", "77", -1]] }),
    ).toMatchObject({
      pass: false,
      straddled: 0,
      first: [
        `${key(i)} SOL 77: 1 taker unpaired`,
        `${key(i + 2)} SOL 77: 1 maker unpaired`,
      ],
    });
    expect(
      g5With({ [i]: [["SOL", "77", 2]], [i + 1]: [["SOL", "77", -2]] }),
    ).toMatchObject({
      pass: false,
      first: [
        `${key(i)} SOL 77: 2 takers unpaired`,
        `${key(i + 1)} SOL 77: 2 makers unpaired`,
      ],
    });
    expect(
      g5With({ [i]: [["SOL", "77", 1]], [i + 1]: [["kPEPE", "77", -1]] }),
    ).toMatchObject({ pass: false, problems: 2 });
    // Three records of one tid in three files in a row: never a pair.
    expect(
      g5With({
        [i]: [["SOL", "77", 1]],
        [i + 1]: [["SOL", "77", -1]],
        [i + 2]: [["SOL", "77", 1]],
      }),
    ).toMatchObject({ pass: false, problems: 3 });
  });

  it("refuses a sealed raw store or look before it reads anything", async () => {
    const sealed = path.join(tmp("sealed"), "ANALYZER", "FRESH");
    for (const edit of [{ raw: path.join(sealed, "raw") }, { look: sealed }])
      await expect(runGates({ ...o, ...edit }, tmp("gates"))).rejects.toThrow(
        SealedError,
      );
  });

  it("writes gates.json with passed false when a gate fails", async () => {
    const look = tmp("look");
    const broken = structuredClone(step1);
    (broken.counts as { late: number }).late += 1;
    writeFileSync(path.join(look, "step1.json"), JSON.stringify(broken));
    writeFileSync(
      path.join(look, "positions.jsonl.gz"),
      readFileSync(path.join(root, "look", "positions.jsonl.gz")),
    );
    const dir = tmp("gates");
    const r = await runGates({ ...o, look }, dir);
    expect(r.passed).toBe(false);
    expect(
      Object.entries(r.gates)
        .filter(([, g]) => !g.pass)
        .map(([k]) => k),
    ).toEqual(["G1"]);
    expect(
      JSON.parse(readFileSync(path.join(dir, "gates.json"), "utf8")),
    ).toMatchObject({ passed: false });
  });

  it("explore opens only a whole store whose gates passed on its manifest, and loads its counted fills", () => {
    expect(() => trustedStore(analyzer)).toThrow("run gates first");
    const dir = path.join(analyzer, GATES);
    mkdirSync(dir, { recursive: true });
    const every = (pass: (g: string) => boolean) =>
      Object.fromEntries(
        ["G0", "G1", "G2", "G3", "G4", "G5", "G6"].map((g) => [
          g,
          { pass: pass(g) },
        ]),
      );
    const gates = (
      passed: boolean,
      manifestSha256: string,
      each: Record<string, { pass: boolean }> = every(() => true),
    ) =>
      writeFileSync(
        path.join(dir, GATES_FILE),
        JSON.stringify({
          store: { manifestSha256 },
          passed,
          gates: each,
          written: "x",
        }),
      );
    gates(true, "0".repeat(64));
    expect(() => trustedStore(analyzer)).toThrow(
      "gates.json is of another store",
    );
    gates(false, o.store.id);
    expect(() => trustedStore(analyzer)).toThrow(
      "the store's gates did not pass (gates.json: passed false)",
    );
    // passed alone is never enough: each of G0 to G6 must be there and pass.
    gates(true, o.store.id, {});
    expect(() => trustedStore(analyzer)).toThrow(
      "the store's gates did not pass (gates.json: G0, G1, G2, G3, G4, G5, G6)",
    );
    gates(
      true,
      o.store.id,
      every((g) => g !== "G3"),
    );
    expect(() => trustedStore(analyzer)).toThrow(
      "the store's gates did not pass (gates.json: G3)",
    );
    const six = every(() => true);
    delete six.G6;
    gates(true, o.store.id, six);
    expect(() => trustedStore(analyzer)).toThrow(
      "the store's gates did not pass (gates.json: G6)",
    );
    gates(true, o.store.id);
    expect(explore(trustedStore(analyzer), coins)).toMatchObject({
      store: { manifestSha256: o.store.id, range: "WAVE-H" },
      counts: { counted: 6, sizing: 4 },
      tries: "no try is defined",
    });
    // A timing run's store is never a whole one.
    const timing = tmp("timing");
    mkdirSync(path.join(timing, "store"));
    const m = JSON.parse(
      readFileSync(path.join(analyzer, "store", "manifest.json"), "utf8"),
    ) as Manifest;
    writeFileSync(
      path.join(timing, "store", "manifest.json"),
      JSON.stringify({ ...m, partial: "2025-10-10" }),
    );
    expect(() => wholeStore(timing)).toThrow(
      "the store is a timing run's (2025-10-10)",
    );
    expect(() => trustedStore(timing)).toThrow("timing run's");
  });

  it("G6 waits on its pace before each raw file it reads", async () => {
    let calls = 0;
    const r = await g6({
      ...o,
      expect: { ...o.expect, sampleDays: [iso(W)] },
      pace: () => {
        calls += 1;
        return Promise.resolve();
      },
    });
    expect(r.pass).toBe(true);
    // W's day: its 24 hours and one either side.
    expect(calls).toBe(26);
  });

  it("G6 reads a month's last and first day and the day DATA END cuts to its hour", async () => {
    expect(WAVEH_EXPECTED.sampleDays).toEqual([
      "2025-05-31",
      "2025-06-01",
      "2025-06-15",
      "2025-07-27",
      "2025-08-15",
      "2025-09-15",
      "2025-10-10",
      "2025-11-15",
      "2025-12-15",
      "2026-01-15",
      "2026-02-15",
      "2026-03-15",
      "2026-04-15",
      "2026-05-28",
      "2026-05-29",
    ]);
    const r = (await g6({
      ...o,
      expect: {
        ...o.expect,
        sampleDays: ["2025-05-31", "2025-06-01", "2026-05-29"],
      },
    })) as unknown as { pass: boolean; days: { day: string; pass: boolean }[] };
    expect(r.days.map((d) => [d.day, d.pass])).toEqual([
      ["2025-05-31", true],
      ["2025-06-01", true],
      ["2026-05-29", true],
    ]);
    const cut = dayFromStore(o, Date.parse("2026-05-29T00:00:00Z"));
    expect([cut.bars.SOL!.last!.length, cut.ctxs.BTC!.mark!.length]).toEqual([
      60, 60,
    ]);
  });

  it("G6 fails on a sample day's tape row removed, a context, two bars and four liq columns changed, the store rewritten with its hashes", async () => {
    const dir = path.join(analyzer, "store");
    const m = JSON.parse(
      readFileSync(path.join(dir, "manifest.json"), "utf8"),
    ) as Manifest;
    const rewrite = (
      table: Table,
      coin: string | null,
      month: string,
      edit: (file: string, b: Buffer) => Buffer,
    ) => {
      const p = m.partitions.find(
        (x) => x.table === table && x.coin === coin && x.month === month,
      )!;
      for (const [file, want] of Object.entries(p.files)) {
        const at = path.join(
          dir,
          ...partitionDir(table, coin, month).split("/"),
          file,
        );
        const b = edit(file, readFileSync(at));
        writeFileSync(at, b);
        Object.assign(want, { bytes: b.length, sha256: sha(b) });
      }
      return p;
    };
    const f64At = (b: Buffer, row: number, f: (x: number) => number) => {
      const c = Buffer.from(b);
      c.writeDoubleLE(f(c.readDoubleLE(8 * row)), 8 * row);
      return c;
    };
    // EXTRACT-REVIEW's columns-demo on W's day: liq's px, fee, closedPnl and markPx, SOL's high and liqSellNtl.
    rewrite("liq", null, "2025-09", (file, b) =>
      file === "px.f64"
        ? f64At(b, 0, (x) => x + 5)
        : file === "fee.f64"
          ? f64At(b, 1, () => 123)
          : file === "closedPnl.f64"
            ? f64At(b, 0, () => -777)
            : file === "markPx.f64"
              ? f64At(b, 2, () => 1)
              : b,
    );
    const wAt = 9 * 1440 + 600;
    rewrite("minute", "SOL", "2025-09", (file, b) =>
      file === "high.f64"
        ? f64At(b, wAt, (x) => x + 9)
        : file === "liqSellNtl.f64"
          ? f64At(b, wAt, () => 1)
          : b,
    );
    // SOL's fourth taker of 2025-09 (W's day; the fifth is the next day's) dropped from every column,
    // and its first made a backstop's: a column only the minute price's fallback reads.
    const p = rewrite("tape", "SOL", "2025-09", (file, b) => {
      const w = b.length / 5;
      const c = Buffer.concat([b.subarray(0, 3 * w), b.subarray(4 * w)]);
      if (file === "flags.u8") c[0] = c[0]! | BACKSTOP;
      return c;
    });
    expect(p.rows).toBe(5);
    p.rows -= 1;
    // kPEPE's oracle at 2025-08-01 00:30 changed.
    rewrite("minute", "kPEPE", "2025-08", (file, b) => {
      if (file !== "oracle.f64") return b;
      const c = Buffer.from(b);
      c.writeDoubleLE(2, 30 * 8);
      return c;
    });
    writeFileSync(path.join(dir, "manifest.json"), `${JSON.stringify(m)}\n`);
    const r = (await g6({ ...o, store: openStore(dir) })) as unknown as {
      pass: boolean;
      days: { day: string; differ: string[] }[];
    };
    expect(r.pass).toBe(false);
    const w = new Date(W).toISOString();
    expect(r.days.map((d) => [d.day, d.differ])).toEqual([
      ["2025-06-10", []],
      ["2025-07-31", []],
      [
        "2025-08-01",
        [
          "ctxs kPEPE oracle: 1 of 1440 minutes differ, the first at 2025-08-01T00:30:00.000Z",
        ],
      ],
      [
        "2025-09-10",
        [
          "tape SOL",
          // The backstop's flag empties 10:00 to 10:04; the dropped trade changes 10:07 to 10:11.
          `fallback SOL: 10 of 1440 minutes differ, the first at ${w}`,
          `bars SOL high: 1 of 1440 minutes differ, the first at ${w}`,
          `bars SOL liqSellNtl: 1 of 1440 minutes differ, the first at ${w}`,
          "liq px: 1 of 4 rows differ, the first row 0",
          "liq markPx: 1 of 4 rows differ, the first row 2",
          "liq fee: 1 of 4 rows differ, the first row 1",
          "liq closedPnl: 1 of 4 rows differ, the first row 0",
        ],
      ],
    ]);
  });
});

describe("the tape and the minute price", { timeout: 60_000 }, () => {
  const E = Date.parse("2025-07-01T00:00:00Z");
  const D = E - DAY_MS;

  it("gives a leg's takers on our side across a month's end, no backstop's; the last trade where a mark is missing", async () => {
    const fills = [fillKey(E - HOUR_MS), fillKey(E)];
    const backstop = {
      liquidatedUser: addr(9),
      markPx: "12",
      method: "backstop",
    };
    const files = new Map<string, string>([
      [
        fills[0]!,
        [
          ...trade(addr(1), addr(2), {
            coin: "SOL",
            side: "B",
            time: E - 30_000,
            px: "10",
            tid: 1,
          }),
          ...trade(addr(3), addr(2), {
            coin: "SOL",
            side: "A",
            time: E - 20_000,
            px: "11",
            tid: 2,
          }),
          record(addr(9), {
            coin: "SOL",
            side: "B",
            time: E - 10_000,
            px: "12",
            crossed: true,
            tid: 3,
            liquidation: backstop,
          }),
        ].join("\n"),
      ],
      [
        fills[1]!,
        trade(addr(4), addr(2), {
          coin: "SOL",
          side: "B",
          time: E + 10_000,
          px: "13",
          tid: 4,
        }).join("\n"),
      ],
      [ctxsKey(D), `${CTXS_HEAD}\n`],
      [ctxsKey(E), `${CTXS_HEAD}\n`],
      ...coins.list.map(
        (c) => [fundingKey(c.name, D), "[]"] as [string, string],
      ),
    ]);
    const { store } = makeStore(files, false);
    const range: Range = {
      name: "TEST",
      partial: null,
      fill: fills,
      days: [D, E],
      fundingStarts: [D],
      end: E + DAY_MS,
      grid: { start: D, minutes: 2 * 1440 },
      months: ["2025-06", "2025-07"],
    };
    const root = tmp("tape");
    await extract({
      store,
      root,
      list: manifestList(
        readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
      ),
      listName: "manifest.jsonl",
      listSha256: "3".repeat(64),
      range,
      workers: 0,
      code: "4".repeat(64),
      wavehFrozen: "5".repeat(64),
      forty,
      small,
      pace: noPace,
      log: () => {},
    });
    const s = openStore(path.join(root, "store"));
    const tape = new Tape(s);
    const tids = (x: number, buy: boolean) =>
      tape.at("SOL", buy, x).map((t) => t.tid);
    expect(tids(E - 35_000, true)).toEqual(["1", "4"]);
    expect(tids(E - 30_000, true)).toEqual(["1", "4"]);
    expect(tids(E - 35_000, false)).toEqual(["2"]);
    expect(tids(E - 29_999, true)).toEqual(["4"]);
    expect(tids(E - 50_000, true)).toEqual(["1"]);
    expect(tape.at("SOL", true, E - 35_000)[0]).toEqual({
      t: E - 30_000,
      px: 10,
      sz: 2,
      user: addr(1),
      tid: "1",
    });
    expect(tape.last("SOL", E - MINUTE_MS, E)).toBe(11);
    expect(tape.last("SOL", E - MINUTE_MS, E - 20_000)).toBe(10);
    expect(tape.last("SOL", E - 25_000, E - 15_000)).toBe(11);
    expect(tape.last("SOL", E - 20_000, E - 19_999)).toBe(11);
    expect(tape.last("SOL", E - 15_000, E)).toBe(null);
    const kit = await loadResearch();
    const { markets } = marketsFrom(s, kit, coins);
    const mk = markets.get(coins.byName.get("SOL")!.assetId)!;
    // No mark: the last trade in the 5 minutes before the minute's end.
    expect(minutePrice(kit, mk, tape, E - 1)).toBe(11);
    expect(minutePrice(kit, mk, tape, E + 30_000)).toBe(13);
    expect(minutePrice(kit, mk, tape, E + 4 * MINUTE_MS + 59_999)).toBe(13);
    expect(minutePrice(kit, mk, tape, E + 5 * MINUTE_MS)).toBe(null);
    expect(minutePrice(kit, mk, tape, E - 10 * MINUTE_MS)).toBe(null);
    // A mark in force wins.
    const marks = mk.marks.slice();
    marks[(E - D) / MINUTE_MS - 3] = 99;
    expect(minutePrice(kit, { ...mk, marks }, tape, E - 1)).toBe(99);
    // The grid read whole: a month's minutes not following the month before are refused.
    const shifted = new Store(
      s.dir,
      {
        ...s.manifest,
        partitions: s.manifest.partitions.map((p) =>
          p.table === "minute" && p.month === "2025-07"
            ? { ...p, start: p.start + MINUTE_MS }
            : p,
        ),
      },
      s.id,
    );
    expect(() => minuteColumn(shifted, "SOL", "mark")).toThrow(
      "minute/SOL/2025-07 does not follow its month before",
    );
  });
});
