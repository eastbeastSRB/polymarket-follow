/**
 * A synthetic analyzer store for the exploration's tests, written directly
 * (no raw archive, no `extract`): the manifest, the dictionaries, the input
 * files' lines and the partitions, each file with its size and SHA-256, so
 * `openStore` and every reader of the store read it as `extract` writes one.
 * A coin's minute columns cover the whole grid; a column not given is NaN
 * (a notional or a count 0).
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MINUTE_MS } from "../src/schedule.js";
import { monthsOf } from "../src/polish/merge.js";
import {
  partitionDir,
  type Manifest,
  type Partition,
  type StoredFile,
  type Table,
} from "../src/polish/store.js";
import { bytesOf, type ColumnType } from "../src/polish/tables.js";
import { NONE } from "../src/polish/writers.js";

export const sha = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");

export type LiqRow = {
  time: number;
  coin: string;
  user: string;
  /** Null when the liquidation object names no account. */
  liqUser: string | null;
  side: 1 | -1;
  crossed: boolean;
  method: string;
  px: number;
  sz: number;
  markPx: number;
  startPosition: number;
  tid: bigint;
  /** The input file's index in `files`. */
  file: number;
};

export type TapeRow = {
  time: number;
  px: number;
  sz: number;
  side: 1 | -1;
  backstop?: boolean;
  user: string;
  tid: bigint;
};

export type StoreSpec = {
  minuteStart: number;
  end: number;
  /** The input fill files' keys, in the range's order. */
  files: readonly string[];
  liq?: readonly LiqRow[];
  /** By coin: its minute columns over the whole grid. */
  minute?: ReadonlyMap<string, Readonly<Record<string, Float64Array>>>;
  /** By coin: its settled funding rows [stamp, rate]. */
  funding?: ReadonlyMap<string, readonly (readonly [number, number])[]>;
  /** By coin: its takers in H8's order. */
  tape?: ReadonlyMap<string, readonly TapeRow[]>;
};

/** The minute table's columns, and the value of a cell not given. */
const MINUTE: readonly (readonly [string, ColumnType, number])[] = [
  ...[
    "mark",
    "oracle",
    "mid",
    "impactBid",
    "impactAsk",
    "openInterest",
    "funding",
    "premium",
    "dayNtlVlm",
    "prevDayPx",
  ].map((n) => [n, "f64", NaN] as const),
  ["trades", "u32", 0],
  ["buyNtl", "f64", 0],
  ["sellNtl", "f64", 0],
  ["backstopNtl", "f64", 0],
  ["last", "f64", NaN],
  ["high", "f64", NaN],
  ["low", "f64", NaN],
  ["liqBuyNtl", "f64", 0],
  ["liqSellNtl", "f64", 0],
];

const monthStart = (month: string) => Date.parse(`${month}-01T00:00:00Z`);
const nextMonth = (month: string) => {
  const d = new Date(monthStart(month));
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
};
const monthOfT = (t: number) => new Date(t).toISOString().slice(0, 7);
const u64 = (v: bigint) => [Number(v & 0xffffffffn), Number(v >> 32n)];

/** Writes the store into `dir` and returns its manifest. */
export function writeStore(dir: string, spec: StoreSpec): Manifest {
  const partitions: Partition[] = [];
  const put = (rel: string, b: Buffer): StoredFile => {
    const file = path.join(dir, ...rel.split("/"));
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, b);
    return { bytes: b.length, sha256: sha(b) };
  };
  const partition = (
    table: Table,
    coin: string | null,
    month: string,
    start: number,
    rows: number,
    columns: readonly (readonly [string, ColumnType, ArrayLike<number>])[],
  ) => {
    const rel = partitionDir(table, coin, month);
    const files: Record<string, StoredFile> = {};
    for (const [name, type, values] of columns)
      files[`${name}.${type}`] = put(
        `${rel}/${name}.${type}`,
        bytesOf(type, values),
      );
    partitions.push({ table, coin, month, start, rows, files });
  };
  const liq = spec.liq ?? [];
  const tape = spec.tape ?? new Map<string, readonly TapeRow[]>();
  const addresses = [
    ...new Set([
      ...liq.flatMap((r) => [
        r.user,
        ...(r.liqUser === null ? [] : [r.liqUser]),
      ]),
      ...[...tape.values()].flatMap((rows) => rows.map((r) => r.user)),
    ]),
  ].sort();
  const userId = new Map(addresses.map((a, i) => [a, i]));
  const names = {
    coins: [...new Set(liq.map((r) => r.coin))].sort(),
    methods: [...new Set(liq.map((r) => r.method))].sort(),
    dirs: ["Close Long"],
  };
  const months = monthsOf(spec.minuteStart, spec.end);
  for (const month of months) {
    const rows = liq
      .filter((r) => monthOfT(r.time) === month)
      .sort((a, b) => a.time - b.time);
    const col = (pick: (r: LiqRow) => number) => rows.map(pick);
    partition("liq", null, month, monthStart(month), rows.length, [
      ["time", "f64", col((r) => r.time)],
      ["block", "f64", col(() => NaN)],
      ["coin", "u16", col((r) => names.coins.indexOf(r.coin))],
      ["user", "u32", col((r) => userId.get(r.user)!)],
      [
        "liqUser",
        "u32",
        col((r) => (r.liqUser === null ? NONE : userId.get(r.liqUser)!)),
      ],
      ["side", "i8", col((r) => r.side)],
      ["crossed", "u8", col((r) => (r.crossed ? 1 : 0))],
      ["method", "u8", col((r) => names.methods.indexOf(r.method))],
      ["dir", "u8", col(() => 0)],
      ["px", "f64", col((r) => r.px)],
      ["sz", "f64", col((r) => r.sz)],
      ["markPx", "f64", col((r) => r.markPx)],
      ["startPosition", "f64", col((r) => r.startPosition)],
      ["fee", "f64", col(() => 0)],
      ["closedPnl", "f64", col(() => 0)],
      ["tid", "u64", rows.flatMap((r) => u64(r.tid))],
      ["oid", "u64", rows.flatMap(() => [0, 0])],
      ["file", "u16", col((r) => r.file)],
    ]);
  }
  const minutes = (spec.end - spec.minuteStart) / MINUTE_MS;
  for (const [coin, cols] of spec.minute ?? [])
    for (const month of months) {
      const from = Math.max(monthStart(month), spec.minuteStart);
      const a = (from - spec.minuteStart) / MINUTE_MS;
      const b =
        (Math.min(nextMonth(month), spec.end) - spec.minuteStart) / MINUTE_MS;
      partition(
        "minute",
        coin,
        month,
        from,
        b - a,
        MINUTE.map(([name, type, empty]) => [
          name,
          type,
          (cols[name] ?? new Float64Array(minutes).fill(empty)).subarray(a, b),
        ]),
      );
    }
  for (const [coin, rows] of spec.funding ?? [])
    for (const month of months) {
      const r = rows.filter(([stamp]) => monthOfT(stamp) === month);
      partition("funding", coin, month, monthStart(month), r.length, [
        ["time", "f64", r.map(([stamp]) => stamp)],
        ["rate", "f64", r.map(([, rate]) => rate)],
      ]);
    }
  for (const [coin, rows] of tape)
    for (const month of months) {
      const r = rows.filter((x) => monthOfT(x.time) === month);
      partition("tape", coin, month, monthStart(month), r.length, [
        ["time", "f64", r.map((x) => x.time)],
        ["px", "f64", r.map((x) => x.px)],
        ["sz", "f64", r.map((x) => x.sz)],
        ["side", "i8", r.map((x) => x.side)],
        ["flags", "u8", r.map((x) => (x.backstop === true ? 1 : 0))],
        ["user", "u32", r.map((x) => userId.get(x.user)!)],
        ["tid", "u64", r.flatMap((x) => u64(x.tid))],
      ]);
    }
  const fileLine = (key: string, index: number) =>
    JSON.stringify({
      index,
      key,
      sha256: "0".repeat(64),
      compressed: 0,
      decoded: 0,
      lines: 0,
      records: 0,
      failed: 0,
      slowLines: 0,
      slowRecords: 0,
      misread: 0,
      late: 0,
      refused: 0,
      byHour: [],
      pairs: [],
      unpaired: [],
      runs: [],
      times: null,
      topTaker: [],
      takerRows: 0,
      liqRows: 0,
    });
  const count = { rows: 0, failed: 0, offMinute: 0, late: 0, twice: 0 };
  const manifest: Manifest = {
    version: 1,
    range: "WAVE-H",
    partial: null,
    end: spec.end,
    minuteStart: spec.minuteStart,
    inputs: {
      list: "manifest.jsonl",
      listSha256: "1".repeat(64),
      fill: spec.files.length,
      ctxs: 0,
      funding: 0,
    },
    code: {
      fingerprint: "4".repeat(64),
      wavehFrozen: "5".repeat(64),
      node: process.version,
    },
    dict: {
      users: {
        count: addresses.length,
        file: put(
          "dict/users.bin",
          Buffer.concat(addresses.map((a) => Buffer.from(a.slice(2), "hex"))),
        ),
      },
      names: put("dict/names.json", Buffer.from(JSON.stringify(names))),
    },
    files: put(
      "files.jsonl",
      Buffer.from(spec.files.map((k, i) => `${fileLine(k, i)}\n`).join("")),
    ),
    partitions,
    counts: {
      ctxsByDay: {},
      ctxsLarge: count,
      badCells: {},
      funding: {},
      merge: {},
      tids: { shared: {}, refused: 0 },
    },
    peaks: {},
    seconds: {},
    written: "2026-11-18T00:00:00.000Z",
  };
  writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest));
  return manifest;
}
