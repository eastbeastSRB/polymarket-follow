/**
 * The store against the local MongoDB server, in `polymarket_follow_test`
 * only (COLLECTOR-PLAN §1.6, integration tests, local only): dropped before
 * and after.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import * as mongodb from "mongodb";
import { MongoClient, type Db } from "mongodb";
import { pino } from "pino";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { boardSnapshot } from "../src/jobs/board-pass.js";
import {
  BoardSnapshot,
  Store,
  UniverseDoc,
  canonical,
  checkDbName,
} from "../src/store/db.js";
import { universeUpdates } from "../src/store/universe.js";
import { address, boardPage } from "./fixtures.js";

const URI = "mongodb://127.0.0.1:27017";
const NAME = "polymarket_follow_test";
const log = pino({ level: "silent" });
let admin: MongoClient;
const db = () => admin.db(NAME);

beforeAll(async () => {
  admin = new MongoClient(URI, { serverSelectionTimeoutMS: 5_000 });
  await db().dropDatabase();
});
afterAll(async () => {
  await db().dropDatabase();
  await admin.close();
});

describe("the database name (Iron Rule 2)", () => {
  it("is ours or our test's, nothing else", () => {
    expect(checkDbName("polymarket_follow")).toBe("polymarket_follow");
    expect(checkDbName("polymarket_follow_test")).toBe(
      "polymarket_follow_test",
    );
    for (const name of ["polymarket_lab", "admin", "polymarket_follow_x"]) {
      expect(() => checkDbName(name)).toThrow(/only polymarket_follow/);
      expect(() => Store.open(URI, name, log)).toThrow(
        /only polymarket_follow/,
      );
    }
  });
});

describe("the universe", () => {
  it("never moves a first date later or a last date earlier, and gathers sources", async () => {
    const a = address(1);
    const b = address(2);
    const store = Store.open(URI, NAME, log);
    store.noteSeen([a, b, a.toLowerCase()], "board:day:pnl", "2026-11-10");
    store.noteSeen([a], "board:day:pnl", "2026-11-12");
    store.noteSeen([a], "board:day:pnl", "2026-11-11");
    store.noteSeen([a], "competition:1:include_unqualified", "2026-11-11");
    store.noteSeen([], "board:day:roi", "2026-11-11");
    await store.close();
    expect(store.counts).toEqual({
      done: 4,
      failed: 0,
      waiting: 0,
      refused: 0,
    });
    const docs = await db()
      .collection("universe")
      .find()
      .sort({ _id: 1 })
      .toArray();
    expect(docs.map((d) => UniverseDoc.parse(d))).toEqual([
      {
        _id: a.toLowerCase(),
        sources: {
          "board:day:pnl": { first: "2026-11-10", last: "2026-11-12" },
          "competition:1:include_unqualified": {
            first: "2026-11-11",
            last: "2026-11-11",
          },
        },
      },
      {
        _id: b.toLowerCase(),
        sources: {
          "board:day:pnl": { first: "2026-11-10", last: "2026-11-10" },
        },
      },
    ]);
  });

  it("builds one upsert an address, lower-cased", () => {
    expect(
      universeUpdates(
        ["0xAB", "0xab", "0xCd"],
        "board:all:notional",
        "2026-11-10",
      ),
    ).toEqual(
      ["0xab", "0xcd"].map((id) => ({
        updateOne: {
          filter: { _id: id },
          update: {
            $min: { "sources.board:all:notional.first": "2026-11-10" },
            $max: { "sources.board:all:notional.last": "2026-11-10" },
          },
          upsert: true,
        },
      })),
    );
  });
});

describe("the rule book", () => {
  it("stores a value only when it differs from the latest stored one, also after a restart", async () => {
    const first = Store.open(URI, NAME, log);
    first.noteRule("fees", "schedule", { a: 1, b: [1, 2] }, 1_000);
    first.noteRule("fees", "schedule", { b: [1, 2], a: 1 }, 2_000);
    first.noteRule("fees", "schedule", { a: 2, b: [1, 2] }, 3_000, {
      age: "5",
    });
    first.noteRule("splits", "events", [], 3_500, { sequence: 1 });
    await first.close();
    const second = Store.open(URI, NAME, log);
    second.noteRule("fees", "schedule", { b: [1, 2], a: 2 }, 4_000);
    second.noteRule("fees", "schedule", { a: 1, b: [1, 2] }, 5_000);
    second.noteRule("splits", "events", [], 5_500, { sequence: 2 });
    second.noteEvent("connection_drop", "book-1", { code: 1012 }, 6_000);
    second.noteEvent("connection_drop", "book-1", { code: 1012 }, 7_000);
    await second.close();
    expect(second.counts.failed).toBe(0);
    const rules = await db()
      .collection("rulebook")
      .find({}, { projection: { _id: 0 } })
      .sort({ at: 1 })
      .toArray();
    expect(rules).toEqual([
      { kind: "fees", key: "schedule", at: 1_000, value: { a: 1, b: [1, 2] } },
      {
        age: "5",
        kind: "fees",
        key: "schedule",
        at: 3_000,
        value: { a: 2, b: [1, 2] },
      },
      { sequence: 1, kind: "splits", key: "events", at: 3_500, value: [] },
      { kind: "fees", key: "schedule", at: 5_000, value: { a: 1, b: [1, 2] } },
      {
        kind: "connection_drop",
        key: "book-1",
        at: 6_000,
        value: { code: 1012 },
      },
      {
        kind: "connection_drop",
        key: "book-1",
        at: 7_000,
        value: { code: 1012 },
      },
    ]);
  });

  it("compares values whatever their key order", () => {
    expect(canonical({ b: { d: 1, c: [2, { f: 1, e: 0 }] }, a: null })).toBe(
      canonical({ a: null, b: { c: [2, { e: 0, f: 1 }], d: 1 } }),
    );
    expect(canonical([1, 2])).not.toBe(canonical([2, 1]));
  });
});

describe("the boards", () => {
  it("keep the first document of a board and pass date, and say which boards a date holds", async () => {
    const stamp = Date.parse("2026-11-10T23:50:00Z");
    const doc = boardSnapshot(
      "2026-11-10",
      { window: "day", sort: "pnl" },
      [
        {
          offset: 0,
          readAt: stamp,
          data: boardPage("day", "pnl", 0, stamp, 40, 40),
        },
      ],
      true,
      null,
    );
    const store = Store.open(URI, NAME, log);
    store.saveBoard(doc);
    store.saveBoard({ ...doc, complete: false });
    await store.close();
    expect(store.counts).toEqual({
      done: 2,
      failed: 0,
      waiting: 0,
      refused: 0,
    });
    const stored = await db()
      .collection("board_snapshots")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    expect(stored.map((d) => BoardSnapshot.parse(d))).toEqual([doc]);

    const reader = Store.open(URI, NAME, log);
    expect(await reader.boardsStored("2026-11-10")).toEqual(
      new Set(["day:pnl"]),
    );
    expect(await reader.boardsStored("2026-11-11")).toEqual(new Set());
    await reader.close();
  });

  it("counts a write that fails, and goes on with the next", async () => {
    const store = Store.open(URI, NAME, log);
    // Over BSON's 16 MiB a document: refused before it is sent.
    store.noteEvent("test", "big", "x".repeat(17 * 1_048_576), 1);
    store.noteEvent("test", "small", "x", 2);
    await store.close();
    expect(store.counts).toEqual({
      done: 1,
      failed: 1,
      waiting: 0,
      refused: 0,
    });
    expect(
      await db().collection("rulebook").countDocuments({ kind: "test" }),
    ).toBe(1);
  });
});

describe("a pause of the database writes (the disk check)", () => {
  it("refuses and counts every write while paused, and writes again after", async () => {
    await db().collection("rulebook").deleteMany({ kind: "pause-test" });
    const store = Store.open(URI, NAME, log);
    store.pauseWrites(true);
    store.noteRule("pause-test", "a", { v: 1 }, 1);
    store.noteEvent("pause-test", "b", { v: 2 }, 2);
    store.pauseWrites(false);
    store.noteRule("pause-test", "a", { v: 1 }, 3);
    await store.close();
    expect(store.counts).toEqual({
      done: 1,
      failed: 0,
      waiting: 0,
      refused: 2,
    });
    const docs = await db()
      .collection("rulebook")
      .find({ kind: "pause-test" })
      .toArray();
    expect(docs.map((d) => `${String(d.key)} ${String(d.at)}`)).toEqual([
      "a 3",
    ]);
    await db().collection("rulebook").deleteMany({ kind: "pause-test" });
  });
});

describe("boardTop", () => {
  it("gives a stored board's first rows, and null for a date or board it does not hold", async () => {
    await db()
      .collection("board_snapshots")
      .deleteMany({ passDate: "2026-11-01" });
    const stamp = Date.parse("2026-11-01T23:50:00Z");
    const doc = boardSnapshot(
      "2026-11-01",
      { window: "week", sort: "roi" },
      [0, 100].map((offset) => ({
        offset,
        readAt: stamp,
        data: boardPage("week", "roi", offset, stamp, 200),
      })),
      true,
      null,
    );
    const store = Store.open(URI, NAME, log);
    store.saveBoard(doc);
    await store.close();
    const reader = Store.open(URI, NAME, log);
    expect(
      await reader.boardTop("2026-11-01", { window: "week", sort: "roi" }, 100),
    ).toEqual(doc.rows.slice(0, 100));
    expect(
      await reader.boardTop("2026-10-31", { window: "week", sort: "roi" }, 100),
    ).toBeNull();
    expect(
      await reader.boardTop("2026-11-01", { window: "week", sort: "pnl" }, 100),
    ).toBeNull();
    await reader.close();
    await db()
      .collection("board_snapshots")
      .deleteMany({ passDate: "2026-11-01" });
  });
});

describe("the backup's round trip (tools/backup.cjs, tools/restore.cjs)", () => {
  type Counts = Record<string, number>;
  const load = createRequire(import.meta.url);
  const backup = load("../../../tools/backup.cjs") as {
    dump: (
      m: typeof mongodb,
      db: Db,
      file: string,
      cutAt: Date,
    ) => Promise<Counts>;
    fileHash: (file: string) => Promise<{ bytes: number; sha256: string }>;
    verifyDump: (
      file: string,
      manifest: { bytes: number; sha256: string; counts: Counts },
    ) => Promise<void>;
    datesToDelete: (dates: string[]) => string[];
  };
  const restore = load("../../../tools/restore.cjs") as {
    restore: (
      m: typeof mongodb,
      client: MongoClient,
      file: string,
      name: string,
    ) => Promise<{ ok: boolean; counts: Counts; problems: string[] }>;
  };
  const RESTORED = "polymarket_follow_restore_2000-01-01";

  it("dumps every collection, restores it with the same counts and _id sets, and refuses any other name", async () => {
    await db().dropDatabase();
    await admin.db(RESTORED).dropDatabase();
    const stamp = Date.parse("2026-11-01T23:50:00Z");
    const store = Store.open(URI, NAME, log);
    store.saveBoard(
      boardSnapshot(
        "2026-11-02",
        { window: "day", sort: "pnl" },
        [
          {
            offset: 0,
            readAt: stamp,
            data: boardPage("day", "pnl", 0, stamp, 40, 40),
          },
        ],
        true,
        null,
      ),
    );
    store.noteRule("fees", "schedule", { taker: "0.0005" }, stamp);
    store.noteSeen(
      [address(1).toLowerCase(), address(2).toLowerCase()],
      "board:day:pnl",
      "2026-11-02",
    );
    await store.close();
    const file = path.join(
      mkdtempSync(path.join(tmpdir(), "poller-backup-")),
      "dump.jsonl.gz",
    );
    const counts = await backup.dump(
      mongodb,
      db(),
      file,
      new Date(Date.now() + 60_000),
    );
    expect(counts).toEqual({
      board_snapshots: 1,
      competition_snapshots: 0,
      rulebook: 1,
      universe: 2,
    });
    const manifest = { ...(await backup.fileHash(file)), counts };
    await backup.verifyDump(file, manifest);
    await expect(
      backup.verifyDump(file, {
        ...manifest,
        counts: { ...counts, rulebook: 2 },
      }),
    ).rejects.toThrow(/rulebook has 1 lines, the manifest 2/);

    expect(await restore.restore(mongodb, admin, file, RESTORED)).toEqual({
      ok: true,
      counts,
      problems: [],
    });
    expect(await admin.db(RESTORED).collection("rulebook").findOne({})).toEqual(
      await db().collection("rulebook").findOne({}),
    );
    await expect(
      restore.restore(mongodb, admin, file, RESTORED),
    ).rejects.toThrow(/exists: refused/);
    for (const name of [
      "polymarket_follow",
      "polymarket_follow_test",
      "polymarket_follow_restore_x",
    ]) {
      await expect(restore.restore(mongodb, admin, file, name)).rejects.toThrow(
        /only polymarket_follow_restore_<date>/,
      );
    }
    await admin.db(RESTORED).dropDatabase();

    // The cut: what the append-only collections got after it stays out; the universe is taken whole.
    const cutFile = `${file}.cut`;
    const cut = await backup.dump(
      mongodb,
      db(),
      cutFile,
      new Date(Date.now() - 3_600_000),
    );
    expect(cut).toEqual({
      board_snapshots: 0,
      competition_snapshots: 0,
      rulebook: 0,
      universe: 2,
    });
    // One byte more fails the check.
    writeFileSync(file, Buffer.concat([readFileSync(file), Buffer.from("x")]));
    await expect(backup.verifyDump(file, manifest)).rejects.toThrow(
      /hash differs/,
    );
  });

  it("keeps the 14 newest dumps and the newest of each of the 8 weeks before them", () => {
    const day = (n: number) =>
      new Date(Date.UTC(2026, 10, 30) - n * 86_400_000)
        .toISOString()
        .slice(0, 10);
    const dates = Array.from({ length: 100 }, (_, n) => day(n));
    const kept = new Set(
      dates.filter(
        (d) => !backup.datesToDelete([...dates, "notes"]).includes(d),
      ),
    );
    expect(kept.size).toBe(14 + 8);
    for (let n = 0; n < 14; n++) expect(kept.has(day(n))).toBe(true);
    // Weeks run Monday to Sunday: 2026-11-16 is the only one left of its week, then Sundays.
    expect([...kept].sort().reverse().slice(14)).toEqual([
      "2026-11-16",
      "2026-11-15",
      "2026-11-08",
      "2026-11-01",
      "2026-10-25",
      "2026-10-18",
      "2026-10-11",
      "2026-10-04",
    ]);
    expect(backup.datesToDelete(["2026-11-01", "notes"])).toEqual([]);
  });
});
