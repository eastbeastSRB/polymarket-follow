/**
 * Who, and how an account's rows are read (src/copyh/accounts.ts; rules.md
 * C2, C3): a bucket's accounts in address order, lower-cased, each row's
 * every field as the archive wrote it (ids above 2^53 by their digits, the
 * trade's market reading on both records, a backstop's leg none, an own
 * liquidation, each dir's kind); the window [from, to) at its two edges,
 * rows asked outside the window read refused; an account's rows across a
 * month and across two stores in time order; the
 * vault accounts of a reading, an account whose one "Net Child Vaults"
 * record lies in the later store in the first reading's population and out
 * of the second's; a partition at or after the seal's end never opened; and
 * the reader's refusals of a store that is not as written.
 */
import { describe, expect, it } from "vitest";
import {
  digitsOf,
  readBucket,
  vaultsOf,
  type AccountRow,
  type FillsSource,
} from "../src/copyh/accounts.js";
import { END_E } from "../src/copyh/design.js";
import { SEALED, SealedError } from "../src/copyh/seal.js";
import type { Manifest, Partition } from "../src/copyh/store.js";
import { StoreError } from "../src/copyh/run.js";
import type { Values } from "../src/polish/tables.js";
import { HOUR_MS } from "../src/schedule.js";
import { addr, byBlock, keyOf, record } from "./copyh-world.js";
import { KINDS, storeOf } from "./copyh-engine-world.js";

/** Two hours either side of a month's end, after the switch hour. */
const H1 = Date.parse("2025-07-31T23:00:00Z");
const H2 = Date.parse("2025-08-01T00:00:00Z");
const SOL = 2;
const BTC = 0;
/** An account of bucket 01 written in mixed case, and the same lower-cased. */
const MIXED = `0x${"AB".repeat(19)}01`;
const LOWER = MIXED.toLowerCase();
const A = addr(0x001);
const B = addr(0x101);
const C = addr(0x201);
const V = addr(0x301);
const W = addr(0x401);
const X = addr(0x501);

const FILE_1 = [
  // A market trade: A takes, B makes; the tid above 2^53, A's oid at 2^64 − 1.
  record(A, {
    coin: "SOL",
    px: "150.25",
    sz: "2.5",
    side: "B",
    time: H1 + 1_000,
    startPosition: "0.0",
    oid: "18446744073709551615",
    tid: "9007199254740993",
    crossed: true,
  }),
  record(B, {
    coin: "SOL",
    px: "150.25",
    sz: "2.5",
    side: "A",
    time: H1 + 1_000,
    startPosition: "-1.5",
    dir: "Open Short",
    oid: 21,
    tid: "9007199254740993",
    crossed: false,
  }),
  // The mixed-case account's own liquidation, taking from addr(2) (bucket 02).
  record(MIXED, {
    coin: "BTC",
    px: "64000.5",
    sz: "0.01",
    side: "A",
    time: H1 + 2_000,
    startPosition: "0.01",
    dir: "Liquidated Cross Long",
    oid: 31,
    tid: 1002,
    crossed: true,
    liquidation: { liquidatedUser: MIXED, markPx: "64000", method: "market" },
  }),
  record(addr(2), {
    coin: "BTC",
    px: "64000.5",
    sz: "0.01",
    side: "B",
    time: H1 + 2_000,
    oid: 41,
    tid: 1002,
    crossed: false,
  }),
  // A backstop's takeover: its taker C, its maker the liquidated addr(9): no market trade.
  record(C, {
    coin: "SOL",
    px: "149",
    sz: "4",
    side: "B",
    time: H1 + 3_000,
    oid: 51,
    tid: 1003,
    crossed: true,
    liquidation: {
      liquidatedUser: addr(9),
      markPx: "149.5",
      method: "backstop",
    },
  }),
  record(addr(9), {
    coin: "SOL",
    px: "149",
    sz: "4",
    side: "A",
    time: H1 + 3_000,
    startPosition: "4.0",
    dir: "Liquidated Cross Long",
    oid: 61,
    tid: 1003,
    crossed: false,
    liquidation: {
      liquidatedUser: addr(9),
      markPx: "149.5",
      method: "backstop",
    },
  }),
  // The protocol vault's netting: V and W, kind vault.
  record(V, {
    coin: "SOL",
    sz: "1",
    side: "B",
    time: H1 + 4_000,
    dir: "Net Child Vaults",
    oid: 71,
    tid: 1004,
    crossed: true,
  }),
  record(W, {
    coin: "SOL",
    sz: "1",
    side: "A",
    time: H1 + 4_000,
    dir: "Net Child Vaults",
    oid: 81,
    tid: 1004,
    crossed: false,
  }),
  // X trades normally in the first hour.
  record(X, {
    coin: "SOL",
    sz: "3",
    side: "B",
    time: H1 + 5_000,
    oid: 91,
    tid: 1005,
    crossed: true,
  }),
  record(addr(3), {
    coin: "SOL",
    sz: "3",
    side: "A",
    time: H1 + 5_000,
    oid: 92,
    tid: 1005,
    crossed: false,
  }),
];
const FILE_2 = [
  // A closes to B in the next month.
  record(A, {
    coin: "SOL",
    px: "151",
    sz: "2.5",
    side: "A",
    time: H2 + 5_000,
    startPosition: "2.5",
    dir: "Close Long",
    oid: 12,
    tid: 2001,
    crossed: true,
  }),
  record(B, {
    coin: "SOL",
    px: "151",
    sz: "2.5",
    side: "B",
    time: H2 + 5_000,
    startPosition: "-4.0",
    dir: "Close Short",
    oid: 22,
    tid: 2001,
    crossed: false,
  }),
  // X's one "Net Child Vaults" record, in the later file.
  record(X, {
    coin: "SOL",
    sz: "1",
    side: "A",
    time: H2 + 6_000,
    startPosition: "3.0",
    dir: "Net Child Vaults",
    oid: 93,
    tid: 2002,
    crossed: true,
  }),
  record(W, {
    coin: "SOL",
    sz: "1",
    side: "B",
    time: H2 + 6_000,
    startPosition: "-1.0",
    dir: "Net Child Vaults",
    oid: 82,
    tid: 2002,
    crossed: false,
  }),
];
const text = (records: readonly string[]) => `${byBlock(1, records)}\n`;
const KEY_1 = keyOf(H1, "node_fills_by_block");
const KEY_2 = keyOf(H2, "node_fills_by_block");

const row = (r: Partial<AccountRow> & { time: number }): AccountRow => ({
  iid: SOL,
  px: 100.5,
  sz: 2,
  side: 1,
  startPosition: 0,
  oid: "7",
  tid: "0",
  crossed: true,
  ownLiquidation: false,
  dirKind: "trade",
  market: true,
  ...r,
});
const A_ROWS = [
  row({
    time: H1 + 1_000,
    px: 150.25,
    sz: 2.5,
    oid: "18446744073709551615",
    tid: "9007199254740993",
  }),
  row({
    time: H2 + 5_000,
    px: 151,
    sz: 2.5,
    side: -1,
    startPosition: 2.5,
    oid: "12",
    tid: "2001",
  }),
];

describe("a bucket's accounts", { timeout: 60_000 }, () => {
  it("come in address order, lower-cased, each row's every field as written", async () => {
    const store = await storeOf(
      new Map([
        [KEY_1, text(FILE_1)],
        [KEY_2, text(FILE_2)],
      ]),
      H1,
      H2 + HOUR_MS,
    );
    const accounts = readBucket(
      [store],
      1,
      { from: H1, to: H2 + HOUR_MS },
      KINDS,
    );
    expect(accounts.map((a) => a.addr)).toEqual([A, B, C, V, W, X, LOWER]);
    const rows = new Map(
      accounts.map((a) => [a.addr, a.rows(H1, H2 + HOUR_MS)]),
    );
    expect(rows.get(A)).toEqual(A_ROWS);
    expect(rows.get(B)).toEqual([
      row({
        time: H1 + 1_000,
        px: 150.25,
        sz: 2.5,
        side: -1,
        startPosition: -1.5,
        oid: "21",
        tid: "9007199254740993",
        crossed: false,
      }),
      row({
        time: H2 + 5_000,
        px: 151,
        sz: 2.5,
        startPosition: -4,
        oid: "22",
        tid: "2001",
        crossed: false,
      }),
    ]);
    expect(rows.get(LOWER)).toEqual([
      row({
        time: H1 + 2_000,
        iid: BTC,
        px: 64000.5,
        sz: 0.01,
        side: -1,
        startPosition: 0.01,
        oid: "31",
        tid: "1002",
        ownLiquidation: true,
        dirKind: "forced",
      }),
    ]);
    // The backstop's taker: no market trade, a counterparty's liquidation.
    expect(rows.get(C)).toEqual([
      row({
        time: H1 + 3_000,
        px: 149,
        sz: 4,
        oid: "51",
        tid: "1003",
        market: false,
      }),
    ]);
    expect(rows.get(V)).toEqual([
      row({
        time: H1 + 4_000,
        sz: 1,
        oid: "71",
        tid: "1004",
        dirKind: "vault",
        market: false,
      }),
    ]);
  });

  it("hold a window [from, to): a row at from in, a row at to out, counted as made", async () => {
    const store = await storeOf(
      new Map([
        [KEY_1, text(FILE_1)],
        [KEY_2, text(FILE_2)],
      ]),
      H1,
      H2 + HOUR_MS,
    );
    const a = readBucket([store], 1, { from: H1, to: H2 + HOUR_MS }, KINDS)[0]!;
    expect(a.rows(H1 + 1_000, H2 + 5_000)).toEqual([A_ROWS[0]]);
    expect(a.count(H1 + 1_000, H2 + 5_000)).toBe(1);
    expect(a.rows(H1 + 1_001, H2 + 5_001)).toEqual([A_ROWS[1]]);
    expect(a.count(H1 + 1_001, H2 + 5_001)).toBe(1);
    expect(a.count(H1, H2 + HOUR_MS)).toBe(2);
    expect(a.rows(H2 + 5_001, H2 + HOUR_MS)).toEqual([]);
    // A window of the reader opens only the months it touches, and refuses rows asked outside it (the engine review's L2).
    const late = readBucket([store], 1, { from: H2, to: H2 + HOUR_MS }, KINDS);
    expect(late.map((x) => x.addr)).toEqual([A, B, W, X]);
    expect(late[0]!.rows(H2, H2 + HOUR_MS)).toEqual([A_ROWS[1]]);
    expect(() => late[0]!.rows(H2 - 1, H2 + HOUR_MS)).toThrow(
      "outside the window read",
    );
    expect(() => late[0]!.count(H2, H2 + HOUR_MS + 1)).toThrow(
      "outside the window read",
    );
  });

  it("join an account's rows across two stores in time order, and refuse stores out of it", async () => {
    const first = await storeOf(new Map([[KEY_1, text(FILE_1)]]), H1, H2);
    const second = await storeOf(
      new Map([[KEY_2, text(FILE_2)]]),
      H2,
      H2 + HOUR_MS,
    );
    const both = readBucket(
      [first, second],
      1,
      { from: H1, to: H2 + HOUR_MS },
      KINDS,
    );
    expect(both.map((a) => a.addr)).toEqual([A, B, C, V, W, X, LOWER]);
    expect(both[0]!.rows(H1, H2 + HOUR_MS)).toEqual(A_ROWS);
    expect(() =>
      readBucket([second, first], 1, { from: H1, to: H2 + HOUR_MS }, KINDS),
    ).toThrow(StoreError);
  });

  it("name the vault accounts of a reading: X in the first reading's population, out of the second's", async () => {
    const first = await storeOf(new Map([[KEY_1, text(FILE_1)]]), H1, H2);
    const second = await storeOf(
      new Map([[KEY_2, text(FILE_2)]]),
      H2,
      H2 + HOUR_MS,
    );
    expect([...vaultsOf([first])].sort()).toEqual([V, W]);
    expect([...vaultsOf([first, second])].sort()).toEqual([V, W, X]);
  });
});

describe("the seal", { timeout: 60_000 }, () => {
  it("never opens a partition at or after its end: S's rows under step 1's seal", async () => {
    const at = END_E + 1_000;
    const files = new Map([
      [
        keyOf(END_E, "node_fills_by_block"),
        text([
          record(A, {
            coin: "SOL",
            side: "B",
            time: at,
            tid: 1,
            crossed: true,
          }),
        ]),
      ],
    ]);
    const open = { sOpen: true, f2Open: false };
    const sealed = await storeOf(files, END_E, END_E + HOUR_MS, {
      build: open,
    });
    expect(() =>
      readBucket([sealed], 1, { from: END_E, to: END_E + HOUR_MS }, KINDS),
    ).toThrow(SealedError);
    const opened = await storeOf(files, END_E, END_E + HOUR_MS, {
      build: open,
      open,
    });
    const [a] = readBucket(
      [opened],
      1,
      { from: END_E, to: END_E + HOUR_MS },
      KINDS,
    );
    expect(a!.rows(END_E, END_E + HOUR_MS).map((r) => r.time)).toEqual([at]);
  });
});

/** A made-up source of one partition, its columns given, in bucket 01 of August 2025. */
function stub(
  cols: Partial<Record<string, Values>>,
  o: { users?: number; dirs?: string[] } = {},
): FillsSource {
  const n = (cols.time ?? new Float64Array(1)).length;
  const p: Partition = {
    table: "fills",
    key: "01",
    month: "2025-08",
    start: H2,
    rows: n,
    files: {},
  };
  const full: Record<string, Values> = {
    user: new Uint32Array(n),
    time: new Float64Array(n).fill(H2),
    iid: new Uint16Array(n),
    px: new Float64Array(n).fill(1),
    sz: new Float64Array(n).fill(1),
    side: new Int8Array(n).fill(1),
    startPosition: new Float64Array(n),
    oid: new Uint32Array(2 * n),
    tid: new Uint32Array(2 * n),
    flags: new Uint8Array(n),
    dir: new Uint8Array(n),
    ...cols,
  };
  const users = o.users ?? 2;
  const dict = Buffer.concat(
    Array.from({ length: users }, (_, i) =>
      Buffer.from(addr(0x101 * i + 1).slice(2), "hex"),
    ),
  );
  const manifest = {
    range: "stub",
    start: H1,
    end: H2 + 31 * 24 * HOUR_MS,
    partitions: [p],
    dict: {
      users: {
        count: users,
        file: { bytes: dict.length, sha256: "0".repeat(64) },
      },
      names: { bytes: 0, sha256: "0".repeat(64) },
    },
    counts: { vaults: [] },
  } as unknown as Manifest;
  return {
    manifest,
    seal: SEALED,
    column: (_p, name) => full[name]!,
    bytes: () => dict,
    names: () => ({ dirs: o.dirs ?? ["Open Long"], methods: [] }),
  };
}
const readStub = (s: FillsSource) =>
  readBucket([s], 1, { from: H1, to: H2 + 31 * 24 * HOUR_MS }, KINDS);

describe("the reader's refusals", () => {
  it("reads a well-formed source", () => {
    const [a, b] = readStub(
      stub({
        user: Uint32Array.from([0, 0, 1]),
        time: Float64Array.from([H2, H2 + 1, H2]),
      }),
    );
    expect([a!.addr, b!.addr]).toEqual([addr(1), addr(0x102)]);
    expect(a!.count(H2, H2 + 2)).toBe(2);
  });

  it("refuses rows not in account order", () => {
    expect(() =>
      readStub(
        stub({
          user: Uint32Array.from([1, 0]),
          time: Float64Array.from([H2, H2]),
        }),
      ),
    ).toThrow("rows not in account order");
  });

  it("refuses an account's rows out of time order", () => {
    expect(() =>
      readStub(
        stub({
          user: Uint32Array.from([0, 0]),
          time: Float64Array.from([H2 + 5, H2 + 3]),
        }),
      ),
    ).toThrow("an account's rows out of time order");
  });

  it("refuses a column of another kind or length", () => {
    expect(() =>
      readStub(stub({ px: new Float32Array(1) as unknown as Values })),
    ).toThrow("its px column is not of its kind or length");
    expect(() => readStub(stub({ oid: new Uint32Array(1) }))).toThrow(
      "its oid column is not of its kind or length",
    );
  });

  it("refuses a user index past the dictionary", () => {
    expect(() =>
      readStub(stub({ user: Uint32Array.from([5]) }, { users: 1 })),
    ).toThrow("a user index past its dictionary");
  });

  it("refuses a dir index past the store's names when the row is made (the engine review's L1)", () => {
    const [a] = readStub(stub({ dir: Uint8Array.from([1]) }));
    expect(() => a!.rows(H2, H2 + 1)).toThrow(
      "stub: a dir index past its store's names",
    );
    const [b] = readStub(stub({ dir: Uint8Array.from([0]) }));
    expect(b!.rows(H2, H2 + 1).map((r) => r.dirKind)).toEqual(["trade"]);
  });

  it("refuses a dir outside dirs.json", () => {
    expect(() => readStub(stub({}, { dirs: ["Mystery Dir"] }))).toThrow(
      "is not in dirs.json",
    );
  });
});

describe("a u64's digits", () => {
  it("are exact below 2^53, at it and to 2^64 − 1", () => {
    expect(digitsOf(0, 0)).toBe("0");
    expect(digitsOf(4_294_967_295, 2_097_151)).toBe("9007199254740991");
    expect(digitsOf(0, 2_097_152)).toBe("9007199254740992");
    expect(digitsOf(1, 2_097_152)).toBe("9007199254740993");
    expect(digitsOf(4_294_967_295, 4_294_967_295)).toBe("18446744073709551615");
  });
});
