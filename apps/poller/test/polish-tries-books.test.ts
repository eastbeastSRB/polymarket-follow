/**
 * The two book-based prints beside (src/polish/tries/books.ts) on synthetic
 * books: H8's book at each leg through WAVE-H's own code, from lz4 files on
 * a book list (a snapshot exactly 10 s old live and 10.001 s old stale, the
 * hour before in an hour's first 10 s, a file the archive lacks, a file on
 * no line); each file read once, in the legs' order, held to its SHA-256,
 * sealed after DATA END and before the gate opens; the tape against the
 * book by delay and the $10,000 and $50,000 walks, by hand.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadResearch, type Research } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { SealedError } from "../src/polish/seal.js";
import type { Line } from "../src/polish/tries/beside.js";
import { bookPrints, heldBooks } from "../src/polish/tries/books.js";
import type { Data } from "../src/polish/tries/data.js";
import { loadCoins } from "../src/waveh/coins.js";
import { SealedError as Unopened } from "../src/waveh/gate.js";
import { bookKey } from "../src/waveh/keys.js";
import { StoreError, readBookList } from "../src/waveh/store.js";
import { lz4, sha } from "./waveh-world.js";

const coins = loadCoins();
let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const SOL = 5;
const KPEPE = 15;
type Side = [number, number][];
/** A book snapshot line in the archive's shape. */
const snapshot = (coin: string, time: number, bids: Side, asks: Side) =>
  JSON.stringify({
    time: "x",
    raw: {
      channel: "l2Book",
      data: {
        coin,
        time,
        levels: [bids, asks].map((s) =>
          s.map(([px, sz]) => ({ px: String(px), sz: String(sz), n: 1 })),
        ),
      },
    },
  });
const hourOf = (x: number) => Math.floor(x / HOUR_MS) * HOUR_MS;

/** A raw store of book files and its book list: files by (coin, hour) with their snapshots, and the hours the archive lacks. */
function rawStore(
  files: { coin: string; hour: number; lines: string[] }[],
  missing: { coin: string; hour: number }[],
) {
  const dir = mkdtempSync(path.join(tmpdir(), "polish-books-"));
  const list: string[] = [];
  for (const f of files) {
    const key = bookKey(f.coin, f.hour);
    const bytes = lz4(f.lines.join("\n"));
    const file = path.join(dir, ...key.split("/"));
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, bytes);
    list.push(JSON.stringify({ key, bytes: bytes.length, sha256: sha(bytes) }));
  }
  for (const m of missing)
    list.push(JSON.stringify({ key: bookKey(m.coin, m.hour), missing: true }));
  return { dir, list: readBookList(`${list.join("\n")}\n`) };
}

const line = (slice: number, iid: number, dir: 1 | -1, t: number): Line => ({
  group: "B0",
  slice,
  t,
  iid,
  tid: "1",
  dir,
  xIn: t + 120_000,
  xOut: t + 120_000 + DAY_MS,
  net: null,
  unpriced: null,
  onMarks: null,
});

/** A world whose tape at a leg is given by (coin, side, instant). */
function dataOf(tapes: Map<string, Side>): Data {
  return {
    kit,
    start: 0,
    minutes: 0,
    coins,
    counted: [],
    forced: {
      t: Float64Array.of(),
      coin: Uint16Array.of(),
      user: Uint32Array.of(),
      side: Int8Array.of(),
      backstop: Uint8Array.of(),
      coins: [],
      px: Float64Array.of(),
      sz: Float64Array.of(),
      markPx: Float64Array.of(),
    },
    pc: new Map(),
    column: () => new Float64Array(0),
    funding: () => [],
    levels: (coin, buy, x) =>
      tapes.get(`${coin}|${buy ? "B" : "A"}|${x}`) ?? [],
  };
}

describe("the book prints beside", () => {
  // SOL's book: 30, 100 and 300 units a side about 100; kPEPE's: one level of 10,000 about 1.
  const BIDS: Side = [
    [99.9, 30],
    [99.8, 100],
    [99.5, 300],
  ];
  const ASKS: Side = [
    [100.1, 30],
    [100.2, 100],
    [100.5, 300],
  ];
  const K_BIDS: Side = [[0.999, 10_000]];
  const K_ASKS: Side = [[1.001, 10_000]];
  // P1, a long in SOL; P2, a short in kPEPE 5 s before noon; P3, a long whose hours no line holds; a slice-1 line; P5 on C.
  const t1 = Date.parse("2025-09-10T10:20:00Z");
  const t2 = Date.parse("2025-09-10T11:59:55Z");
  const t3 = Date.parse("2025-09-10T14:20:00Z");
  const t5 = Date.parse("2026-02-10T10:20:00Z");
  const snaps = (coin: string, at: number[], b: Side, a: Side) =>
    at.map((t) => snapshot(coin, t, b, a));
  const build = () =>
    rawStore(
      [
        {
          coin: "SOL",
          hour: hourOf(t1),
          // 10 s before the 10 s leg (live), 5 s before 2 min, 10.001 s before 5 min (stale), 1 s before 15 min.
          lines: snaps(
            "SOL",
            [t1, t1 + 115_000, t1 + 289_999, t1 + 899_000],
            BIDS,
            ASKS,
          ),
        },
        {
          coin: "SOL",
          hour: hourOf(t1 + DAY_MS),
          lines: snaps("SOL", [t1 + DAY_MS + 118_000], BIDS, ASKS),
        },
        {
          coin: "kPEPE",
          hour: hourOf(t2),
          lines: snaps("kPEPE", [t2 + 3_000], K_BIDS, K_ASKS),
        },
        {
          coin: "kPEPE",
          hour: hourOf(t2 + 5_000),
          // Its first snapshot after the 10 s leg (noon + 5 s), so that leg reads the hour before.
          lines: snaps(
            "kPEPE",
            [t2 + 12_000, t2 + 115_000, t2 + 295_000],
            K_BIDS,
            K_ASKS,
          ),
        },
      ],
      [
        { coin: "kPEPE", hour: hourOf(t2 + 120_000 + DAY_MS) },
        { coin: "SOL", hour: hourOf(t5) },
      ],
    );
  const tapes = new Map<string, Side>([
    [`SOL|B|${t1 + 10_000}`, [[100, 1e6]]],
    [`SOL|B|${t1 + 120_000}`, [[100, 1e6]]],
    [`SOL|B|${t1 + 900_000}`, [[100, 1e6]]],
    // Exactly the tape entry's 10 units at 100.3, the rest lower: the exit walks Q.
    [
      `SOL|A|${t1 + 120_000 + DAY_MS}`,
      [
        [100.3, 10],
        [100, 1e6],
      ],
    ],
    // 100 units at 0.9995: short of $1,000, walked on at that level.
    [`kPEPE|A|${t2 + 10_000}`, [[0.9995, 100]]],
    [`kPEPE|A|${t2 + 120_000}`, [[0.9995, 1e6]]],
  ]);
  // The E and C steps' lines (e-positions and c-positions).
  const lines = {
    e: [
      line(0, SOL, 1, t1),
      line(0, KPEPE, -1, t2),
      line(0, SOL, 1, t3),
      line(1, SOL, 1, t1),
      { ...line(0, SOL, 1, t1), group: "N" },
    ],
    c: [line(0, SOL, 1, t5)],
  };

  it("the tape against the book by delay, and the walks at $1,000, $10,000 and $50,000, by hand", async () => {
    const { dir, list } = build();
    let reads = 0;
    const p = await bookPrints(
      dataOf(tapes),
      lines,
      heldBooks(dir, { open: true }, list, () => {
        reads += 1;
        return Promise.resolve();
      }),
    );
    // Each file read once: SOL's two hours, kPEPE's noon and the hour before.
    expect(reads).toBe(4);
    const sol = ((100.1 - 100) / 100.1) * 1e4;
    const kpepe = (-1 * (0.999 - 0.9995) * 1e4) / 0.999;
    const e = p.tapeAgainstBook.E;
    // B0's slice-0 lines only: P1, P2 and P3 (P1's slice-1 and N copies left out).
    expect(e["10 s"]).toMatchObject({
      compared: { n: 2 },
      short: 1,
      notCompared: { "not held": 1 },
    });
    expect(e["10 s"]!.compared!.mean).toBeCloseTo((sol + kpepe) / 2, 9);
    expect(e["2 min"]).toMatchObject({ compared: { n: 2 }, short: 0 });
    expect(e["2 min"]!.compared!.mean).toBeCloseTo((sol + kpepe) / 2, 9);
    expect(e["5 min"]).toEqual({
      compared: null,
      short: 0,
      notCompared: { stale: 1, "no trade": 1, "not held": 1 },
    });
    expect(e["15 min"]).toMatchObject({
      compared: { n: 1 },
      notCompared: { stale: 1, "not held": 1 },
    });
    expect(e["15 min"]!.compared!.mean).toBeCloseTo(sol, 9);
    // P1's exit: the tape entry's 10 units sold at 100.3 against the book's bid of 99.9.
    expect(e["2 min exit"]).toMatchObject({
      compared: { n: 1 },
      notCompared: { "no book file": 1, "not held": 1 },
    });
    expect(e["2 min exit"]!.compared!.mean).toBeCloseTo(
      ((100.3 - 99.9) / 99.9) * 1e4,
      9,
    );
    for (const k of ["10 s", "2 min", "5 min", "15 min"])
      expect(p.tapeAgainstBook.C[k]!.notCompared).toEqual({
        "no book file": 1,
      });
    expect(p.tapeAgainstBook.C["2 min exit"]!.notCompared).toEqual({
      "not held": 1,
    });
    // The walks at x_in's book: SOL's $10,000 takes 30 at 100.1 and the rest at 100.2; $50,000 runs past its 430 units.
    const w = p.walks.E;
    expect(w).toMatchObject({ positions: 3, notWalked: { "not held": 1 } });
    const s = w.bySize;
    expect(s["$1,000"]).toMatchObject({
      cost: { n: 2 },
      extra: null,
      short: 0,
    });
    expect(s["$1,000"]!.cost!.mean).toBeCloseTo(10, 9);
    const p10 = 10_000 / (30 + (10_000 - 30 * 100.1) / 100.2);
    const p50 = 50_000 / (430 + (50_000 - 3_003 - 10_020 - 30_150) / 100.5);
    expect(s["$10,000"]).toMatchObject({ short: 1 });
    expect(s["$10,000"]!.cost!.mean).toBeCloseTo(
      ((p10 / 100 - 1) * 1e4 + 10) / 2,
      9,
    );
    expect(s["$10,000"]!.extra!.mean).toBeCloseTo(
      ((p10 / 100.1 - 1) * 1e4) / 2,
      9,
    );
    expect(s["$50,000"]).toMatchObject({ short: 2 });
    expect(s["$50,000"]!.cost!.mean).toBeCloseTo(
      ((p50 / 100 - 1) * 1e4 + 10) / 2,
      9,
    );
    expect(p.walks.C).toMatchObject({
      positions: 1,
      notWalked: { "no book file": 1 },
      bySize: { "$1,000": { cost: null, short: 0 } },
    });
  });

  it("holds each file to the list's SHA-256, seals FRESH's months and opens nothing while the gate is closed", async () => {
    const { dir, list } = build();
    const pace = () => Promise.resolve();
    const key = bookKey("SOL", hourOf(t1));
    writeFileSync(path.join(dir, ...key.split("/")), lz4("changed"));
    await expect(
      heldBooks(dir, { open: true }, list, pace)("SOL", t1 + 10_000),
    ).rejects.toThrow(StoreError);
    const after = Date.parse("2026-06-01T10:00:00Z");
    const sealed = rawStore([{ coin: "SOL", hour: after, lines: [] }], []);
    await expect(
      heldBooks(sealed.dir, { open: true }, sealed.list, pace)("SOL", after),
    ).rejects.toThrow(SealedError);
    const fresh = build();
    await expect(
      heldBooks(fresh.dir, { open: false }, fresh.list, pace)("SOL", t1),
    ).rejects.toThrow(Unopened);
  });
});
