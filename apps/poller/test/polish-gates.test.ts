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
import {
  GATES,
  GATES_FILE,
  g0,
  g1,
  g2,
  g3,
  g4,
  g5,
  g6,
  libraryOf,
  runGates,
  type GatesInput,
  type Library,
  type Step1,
} from "../src/polish/gates.js";
import { Tape, marketsFrom, minutePrice } from "../src/polish/legs.js";
import { WAVEH_RANGE, type Range } from "../src/polish/range.js";
import { openStore, type Manifest } from "../src/polish/store.js";
import { fortyOf } from "../src/polish/writers.js";
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
    ].join("\n"),
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
  for (let d = Date.parse("2025-05-25T00:00:00Z"); d < DATA_END; d += DAY_MS) {
    const rows = [CTXS_HEAD];
    for (const [coin, days] of marked)
      if (days.some((t) => dayStart(t) === d))
        for (let m = 0; m < 1_440; m++)
          rows.push(ctxsRow(coin, d + m * MINUTE_MS, 100));
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
      ["2025-06-10", 2, 4],
      ["2025-07-31", 4, 8],
      ["2025-08-01", 1, 2],
      ["2025-09-10", 5, 4],
    ]);
  });

  it("G0 fails on another list and on a column that differs from the manifest", () => {
    expect(g0(o, step1).pass).toBe(true);
    expect(g0({ ...o, listSha256: "0".repeat(64) }, step1).first).toEqual([
      "the store or the look was made from another list",
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
  });

  it("G3 fails on a price beyond 0.01 bps, on a leg's tid, on a line missing; passes a price within", () => {
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
    const near = g3With((ls) => (ls[0]!.priced.net += 0.005));
    expect(near.pass).toBe(true);
    expect(near.largestBps).toBeCloseTo(0.005, 9);
    expect(g3With((ls) => (ls[0]!.priced.net += 0.02))).toMatchObject({
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
  });

  it("G5 fails on a file whose takers and makers differ", () => {
    expect(g5(o, lib).pass).toBe(true);
    const files = structuredClone(lib.files);
    const f = files.find((x) => x.pairs.length > 0)!;
    const [coin, takers, makers] = f.pairs[0]!;
    f.pairs[0]![2] = makers + 1;
    expect(g5(o, { ...lib, files })).toMatchObject({
      pass: false,
      first: [`${f.key} ${coin}: ${takers} takers, ${makers + 1} makers`],
    });
  });

  it("explore opens only a whole store whose gates passed on its manifest, and loads its counted fills", () => {
    expect(() => trustedStore(analyzer)).toThrow("run gates first");
    const dir = path.join(analyzer, GATES);
    mkdirSync(dir, { recursive: true });
    const gates = (passed: boolean, manifestSha256: string) =>
      writeFileSync(
        path.join(dir, GATES_FILE),
        JSON.stringify({
          store: { manifestSha256 },
          passed,
          gates: {},
          written: "x",
        }),
      );
    gates(true, "0".repeat(64));
    expect(() => trustedStore(analyzer)).toThrow(
      "gates.json is of another store",
    );
    gates(false, o.store.id);
    expect(() => trustedStore(analyzer)).toThrow(
      "the store's gates did not pass",
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

  it("G6 fails on a sample day's tape row removed and a context changed, the store rewritten with its hashes", async () => {
    const dir = path.join(analyzer, "store");
    const m = JSON.parse(
      readFileSync(path.join(dir, "manifest.json"), "utf8"),
    ) as Manifest;
    const rewrite = (
      table: string,
      coin: string,
      month: string,
      edit: (file: string, b: Buffer) => Buffer,
    ) => {
      const p = m.partitions.find(
        (x) => x.table === table && x.coin === coin && x.month === month,
      )!;
      for (const [file, want] of Object.entries(p.files)) {
        const at = path.join(dir, table, coin, month, file);
        const b = edit(file, readFileSync(at));
        writeFileSync(at, b);
        Object.assign(want, { bytes: b.length, sha256: sha(b) });
      }
      return p;
    };
    // SOL's last taker of 2025-09 dropped: every column one row shorter.
    const p = rewrite("tape", "SOL", "2025-09", (_, b) =>
      b.subarray(0, b.length - b.length / 4),
    );
    expect(p.rows).toBe(4);
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
    expect(r.days.map((d) => [d.day, d.differ])).toEqual([
      ["2025-06-10", []],
      ["2025-07-31", []],
      ["2025-08-01", ["ctxs kPEPE"]],
      ["2025-09-10", ["tape SOL"]],
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
  });
});
