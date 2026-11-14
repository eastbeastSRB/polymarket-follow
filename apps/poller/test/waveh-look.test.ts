/**
 * The one look (rules.md H15, R3, R7) end to end in a synthetic store: the
 * rehearsal first (its sealed SIZING outcomes), then step 1 (the books
 * listed, the positions' SHA-256), the refusals between, step 2 (the price
 * at the tape and the book, the verdict written before the report, the
 * SIZING line from the sealed outcomes and the position the rehearsal left),
 * and a second step 2 refused. The tests run in order on one store.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadResearch } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { bookKey } from "../src/waveh/books.js";
import { loadCoins } from "../src/waveh/coins.js";
import { DATA_END } from "../src/waveh/instants.js";
import {
  AlreadyRun,
  FrozenDiffer,
  look,
  SizingFile,
} from "../src/waveh/look.js";
import {
  BooksNeeded,
  CLOSED,
  rehearse,
  type Ctx,
} from "../src/waveh/rehearse.js";
import { StoreError, manifestList } from "../src/waveh/store.js";
import {
  CTXS_HEAD,
  block,
  cleanScratch,
  ctxsRow,
  dayOf,
  fillKey,
  liquidation,
  lz4,
  makeStore,
  scratch,
  sha,
  snapshot,
  taker,
} from "./waveh-world.js";

afterAll(cleanScratch);

// A SOL wave in SIZING (priced by the rehearsal); a SOL wave late on
// 2025-07-30 (its exit book missing and its tape sealed: left for the look);
// a kPEPE wave late on 2025-07-31 (its exit in TEST: left for the look); a
// SOL wave in TEST (WAVE-H's one position, its entry book missing: the tape).
const W1 = Date.parse("2025-06-10T10:00:00Z");
const W2 = Date.parse("2025-07-30T23:10:00Z");
const W3 = Date.parse("2025-07-31T23:30:00Z");
const W = Date.parse("2025-09-10T10:00:00Z");
const ENTRY = 7 * MINUTE_MS;
const hourOf = (t: number) => t - (t % HOUR_MS);
const dayStart = (t: number) => t - (t % DAY_MS);

function world() {
  const files = new Map<string, string>();
  files.set(
    fillKey(W1),
    [
      ...liquidation(1, "SOL", "A", W1, 1),
      ...liquidation(2, "SOL", "A", W1 + 5 * MINUTE_MS, 2),
    ].join("\n"),
  );
  files.set(
    fillKey(W2, "node_fills_by_block"),
    block(1, [
      ...liquidation(7, "SOL", "A", W2, 11),
      ...liquidation(8, "SOL", "A", W2 + 5 * MINUTE_MS, 12),
    ]),
  );
  files.set(
    fillKey(W3, "node_fills_by_block"),
    [
      block(1, [
        ...liquidation(5, "kPEPE", "B", W3, 3),
        ...liquidation(6, "kPEPE", "B", W3 + 5 * MINUTE_MS, 4),
      ]),
      // W2's exit on the tape, read at the look only.
      block(2, [taker("SOL", "A", W2 + ENTRY + DAY_MS + 100, "99", "50", 15)]),
      // R5: stamped from TEST's start in a SIZING file: in neither SIZING nor TEST.
      block(
        3,
        liquidation(9, "XRP", "A", Date.parse("2025-08-01T00:00:00.050Z"), 13),
      ),
    ].join("\n"),
  );
  files.set(
    fillKey(W, "node_fills_by_block"),
    [
      block(2, liquidation(3, "SOL", "A", W, 5)),
      block(3, [
        ...liquidation(4, "SOL", "A", W + 5 * MINUTE_MS, 6),
        taker("SOL", "B", W + ENTRY + 100, "101", "20", 7),
        // A coin with no record in SIZING: one of THE LATE COINS.
        taker("DOGE", "B", W + 1_000, "0.2", "1000", 14),
      ]),
    ].join("\n"),
  );
  // Marks at 100 on the days the legs and their funding read; every day file present.
  const marked: [string, number[]][] = [
    ["SOL", [W1, W2, W].flatMap((t) => [t, t + DAY_MS, t + 2 * DAY_MS])],
    ["kPEPE", [W3, W3 + DAY_MS, W3 + 2 * DAY_MS]],
  ];
  for (let d = Date.parse("2025-05-25T00:00:00Z"); d < DATA_END; d += DAY_MS) {
    const rows = [CTXS_HEAD];
    for (const [coin, days] of marked)
      if (days.some((t) => dayStart(t) === d))
        for (let m = 0; m < 1_440; m++)
          rows.push(ctxsRow(coin, d + m * MINUTE_MS, 100));
    files.set(`asset_ctxs/${dayOf(d)}.csv.lz4`, rows.join("\n"));
  }
  for (const [coin, from] of [
    ["SOL", dayStart(W1)],
    ["SOL", dayStart(W2)],
    ["kPEPE", dayStart(W3)],
    ["SOL", dayStart(W)],
  ] as const) {
    const rows = [];
    for (let h = from; h < from + 3 * DAY_MS; h += HOUR_MS)
      rows.push({ coin, fundingRate: "0.00001", premium: "0", time: h + 17 });
    files.set(`info/fundingHistory/${coin}/${from}.json`, JSON.stringify(rows));
  }
  return files;
}

describe("the one look (H15, R3, R7)", { timeout: 180_000 }, () => {
  let store: string;
  let root: string;
  let ctx: Ctx;
  let sizing: SizingFile;
  const books: string[] = [];
  /** A book file at x's hour (a snapshot 2 s before x) in the store and its list line. */
  const putBook = (coin: string, x: number, listed = true) => {
    const key = bookKey(coin, hourOf(x));
    const bytes = lz4(snapshot(coin, x - 2_000));
    const file = path.join(store, ...key.split("/"));
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, bytes);
    if (listed)
      books.push(
        JSON.stringify({ key, bytes: bytes.length, sha256: sha(bytes) }),
      );
    return key;
  };
  const writeBooks = (lines = books) =>
    writeFileSync(path.join(store, "books.jsonl"), `${lines.join("\n")}\n`);
  const dir = () => path.join(root, "look");
  const readJson = (file: string) =>
    JSON.parse(readFileSync(path.join(dir(), file), "utf8")) as Record<
      string,
      unknown
    >;

  beforeAll(async () => {
    ({ store } = makeStore(world(), "to DATA END"));
    root = mkdtempSync(path.join(tmpdir(), "waveh-root-"));
    scratch.push(root);
    ctx = {
      store,
      list: manifestList(
        readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
      ),
      coins: loadCoins(),
      kit: await loadResearch(),
      pace: () => Promise.resolve(),
      log: () => {},
    };
    putBook("SOL", W1 + ENTRY);
    putBook("SOL", W2 + ENTRY);
    books.push(
      JSON.stringify({
        key: bookKey("SOL", hourOf(W2 + ENTRY + DAY_MS)),
        missing: true,
      }),
    );
    putBook("SOL", W1 + ENTRY + DAY_MS);
    writeBooks();
    // The frozen sizing.json is the rehearsal's own output: it must parse.
    sizing = SizingFile.parse(await rehearse(ctx, root));
  }, 120_000);

  it("starts from the rehearsal's sealed outcomes, and refuses a closed gate before opening anything", async () => {
    expect(sizing).toMatchObject({
      M: 1,
      counted: 6,
      outcomes: { positions: 3 },
    });
    await expect(
      look(
        { ...ctx, store: path.join(root, "nowhere") },
        CLOSED,
        root,
        sizing,
        "d",
      ),
    ).rejects.toThrow(FrozenDiffer);
    expect(existsSync(dir())).toBe(false);
  });

  it("step 1 lists the book files of WAVE-H's legs and of the position the rehearsal left, with the positions' SHA-256, and stops", async () => {
    const err: unknown = await look(
      ctx,
      { open: true },
      root,
      sizing,
      "d",
    ).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(BooksNeeded);
    expect((err as Error).message).toBe("step 1 done: 6 book files listed");
    const x = W + ENTRY;
    const x3 = W3 + 5 * MINUTE_MS + 2 * MINUTE_MS;
    expect(readFileSync(path.join(dir(), "books-needed.txt"), "utf8")).toBe(
      `${[
        bookKey("SOL", hourOf(x)),
        bookKey("SOL", hourOf(x + DAY_MS)),
        bookKey("kPEPE", hourOf(x3)),
        bookKey("kPEPE", hourOf(x3 + DAY_MS)),
        bookKey("SOL", hourOf(W2 + ENTRY)),
        bookKey("SOL", hourOf(W2 + ENTRY + DAY_MS)),
      ]
        .sort()
        .join("\n")}\n`,
    );
    expect(readJson("step1.json")).toMatchObject({
      M: 1,
      positions: 1,
      sizingLate: 2,
      booksNeeded: 6,
      dataSha256: "d",
      counts: { counted: 8, late: 2, sizingCoins: ["SOL", "kPEPE"] },
    });
    expect(existsSync(path.join(dir(), "result.json"))).toBe(false);
  });

  it("stops while a book file is lacking, when the positions' SHA-256 differs from step 1's, and when the sealed outcomes differ", async () => {
    await expect(look(ctx, { open: true }, root, sizing, "d")).rejects.toThrow(
      "4 of 6 book files",
    );
    const stepFile = path.join(dir(), "step1.json");
    const good = readFileSync(stepFile, "utf8");
    const step = JSON.parse(good) as { sha256: string };
    writeFileSync(
      stepFile,
      good.replace(
        step.sha256,
        step.sha256.replace(/^./, (c) => (c === "0" ? "1" : "0")),
      ),
    );
    await expect(look(ctx, { open: true }, root, sizing, "d")).rejects.toThrow(
      "the positions' SHA-256",
    );
    writeFileSync(stepFile, good);
    books.push(
      JSON.stringify({ key: bookKey("SOL", hourOf(W + ENTRY)), missing: true }),
    );
    putBook("SOL", W + ENTRY + DAY_MS);
    putBook("kPEPE", W3 + ENTRY);
    putBook("kPEPE", W3 + ENTRY + DAY_MS);
    writeBooks();
    await expect(
      look(
        ctx,
        { open: true },
        root,
        { ...sizing, outcomes: { ...sizing.outcomes, sha256: "0".repeat(64) } },
        "d",
      ),
    ).rejects.toThrow(StoreError);
    // A sealed file whose bytes are its hash's but whose position is not SIZING's.
    const sealedFile = path.join(root, "rehearsal", "sizing-outcomes.jsonl.gz");
    const real = readFileSync(sealedFile);
    const t1 = W1 + 5 * MINUTE_MS;
    const moved = gzipSync(
      gunzipSync(real)
        .toString("utf8")
        .replace(`"t":${t1}`, `"t":${t1 + 1}`),
    );
    writeFileSync(sealedFile, moved);
    await expect(
      look(
        ctx,
        { open: true },
        root,
        { ...sizing, outcomes: { ...sizing.outcomes, sha256: sha(moved) } },
        "d",
      ),
    ).rejects.toThrow("position 1 is not SIZING's");
    writeFileSync(sealedFile, real);
    // R7: a book file held but not its list's bytes stops the look.
    const bad = books.map((l) =>
      l.includes("kPEPE") && !l.includes("missing")
        ? l.replace(/"sha256":"[0-9a-f]+"/, `"sha256":"${"0".repeat(64)}"`)
        : l,
    );
    writeBooks(bad);
    await expect(look(ctx, { open: true }, root, sizing, "d")).rejects.toThrow(
      "SHA-256",
    );
    writeBooks();
    expect(existsSync(path.join(dir(), "result.json"))).toBe(false);
  });

  it("step 2 prices every leg, writes the result, the positions and the report, and a second step 2 refuses", async () => {
    await expect(look(ctx, { open: true }, root, sizing, "d")).resolves.toEqual(
      {
        verdict: "TOO FEW TO TELL",
      },
    );
    // The entry bought 1,000 ÷ 101 on the tape; the exit sold at the book's 99.9;
    // 4.5 bps a leg; 24 settlements of 0.00001 at the mark 100, a long paying.
    const Q = 1_000 / 101;
    const gross = (99.9 - 101) * Q * 10;
    const fees = (0.00045 * 1_000 + 0.00045 * 99.9 * Q) * 10;
    const funding = -24 * 0.00001 * 100 * Q * 10;
    const result = readJson("result.json") as {
      verdict: string;
      positions: number;
      priced: number;
      stat: { mean: number; n: number };
      meanExcess: number;
      M: number;
    };
    expect(result).toMatchObject({
      verdict: "TOO FEW TO TELL",
      positions: 1,
      priced: 1,
      M: 1,
      dataSha256: "d",
    });
    expect(result.stat.mean).toBeCloseTo(gross - fees + funding, 9);
    expect(result.meanExcess).toBeCloseTo(0, 9);
    const lines = gunzipSync(
      readFileSync(path.join(dir(), "positions.jsonl.gz")),
    )
      .toString("utf8")
      .trim()
      .split("\n")
      .map(
        (l) =>
          JSON.parse(l) as {
            set: string;
            spot: { t: number };
            priced: { net: number } | null;
            legs: {
              source: string;
              why: string | null;
              tids: string[];
              file: string | null;
            }[];
          },
      );
    expect(lines.map((l) => [l.set, l.spot.t])).toEqual([
      ["WAVE-H", W + 5 * MINUTE_MS],
      ["SIZING", W1 + 5 * MINUTE_MS],
      ["SIZING", W2 + 5 * MINUTE_MS],
      ["SIZING", W3 + 5 * MINUTE_MS],
    ]);
    expect(lines[2]!.legs.map((l) => [l.source, l.why, l.tids])).toEqual([
      ["book", null, []],
      ["tape", "no book file", ["15"]],
    ]);
    expect(
      lines[0]!.legs.map((l) => [l.source, l.why, l.tids, l.file]),
    ).toEqual([
      ["tape", "no book file", ["7"], null],
      ["book", null, [], bookKey("SOL", hourOf(W + ENTRY + DAY_MS))],
    ]);
    expect(lines.every((l) => l.priced?.net !== null)).toBe(true);
    const report = readJson("report.json") as Record<
      string,
      Record<string, unknown>
    >;
    expect(Object.keys(report).slice(0, 3)).toEqual([
      "WAVE-H",
      "THE DAY WITH THE MOST POSITIONS",
      "SIZING",
    ]);
    expect(report["THE DAY WITH THE MOST POSITIONS"]).toMatchObject({
      day: "2025-09-10",
      positions: 1,
      share: 1,
      fiveBusiestShare: 1,
    });
    expect(report.SIZING).toMatchObject({ positions: 3, priced: 3 });
    expect(report["M HALVED"]).toMatchObject({ M: 1, positions: 1 });
    expect(report["M DOUBLED"]).toMatchObject({ M: 2 });
    expect((report["M BY MONTH"]!.months as unknown[]).length).toBe(10);
    expect((report["THE LATE COINS"]!.coins as string[]).includes("SOL")).toBe(
      false,
    );
    expect((report["THE LATE COINS"]!.coins as string[]).length).toBe(36);
    expect(report["THE LATE COINS"]!.coins).toEqual(
      expect.arrayContaining(["DOGE", "XRP"]),
    );
    expect(report["THE BOOK AND THE TAPE"]).toMatchObject({
      book: { positions: 0 },
      tape: { positions: 1 },
    });
    expect(report.prints).toMatchObject({
      bookHoles: {
        filesByDay: { "2025-07-31": 1, "2025-09-10": 1 },
        legsByDay: { "2025-09-10": 1 },
      },
      baseTier: [],
      files: { books: 4, booksMissing: 2 },
    });
    await expect(look(ctx, { open: true }, root, sizing, "d")).rejects.toThrow(
      AlreadyRun,
    );
  });
});
