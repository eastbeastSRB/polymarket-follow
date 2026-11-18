/**
 * The record scanner and its two writers (src/polish/scan.ts, writers.ts):
 * one hand-made file with every case the text can hold, a generated file
 * across many LZ4 blocks against a naive parse of every line (JSON.parse and
 * WAVE-H's schema), and WAVE-H's own pass on the same synthetic store.
 */
import { createRequire } from "node:module";
import { afterAll, describe, expect, it } from "vitest";
import { scanFill, type Scan } from "../src/polish/scan.js";
import {
  BACKSTOP,
  LIQUIDATION,
  LiqWriter,
  NONE,
  Names,
  TakerWriter,
  fortyOf,
  u64Of,
  type TakerRows,
} from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import { parseRecord, type Format } from "../src/waveh/fills.js";
import { CLOSED } from "../src/waveh/gate.js";
import { newPass, passFile } from "../src/waveh/pass.js";
import { manifestList } from "../src/waveh/store.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { addr, byBlock, frameOf, record, trade } from "./polish-world.js";
import { cleanScratch, fillKey, makeStore } from "./waveh-world.js";

afterAll(cleanScratch);

const lz4js = createRequire(import.meta.url)("lz4js") as {
  compress: (src: Uint8Array) => Uint8Array;
};
const coins = loadCoins();
const FORTY = fortyOf(coins);
const SMALL = new Set(coins.list.map((c) => c.name));

function run(text: string, format: Format, end: number, frame = false) {
  const users = new Names();
  const taker = new TakerWriter(FORTY, SMALL);
  const liq = new LiqWriter();
  const bytes = frame
    ? frameOf(Buffer.from(text))
    : Buffer.from(lz4js.compress(Buffer.from(text)));
  const scan = scanFill(bytes, format, end, FORTY, [taker, liq], users);
  return { scan, taker, liq, users };
}

const T = Date.parse("2025-09-15T10:00:00Z");
const H = 3_600_000;

describe("the scanner, on every case a file's text can hold", () => {
  const [A, B, C, D, E, G] = [1, 2, 3, 4, 5, 6].map(addr) as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  const F = `0x${"AB".repeat(20)}`;
  const liqOf = (user: string, method = "market") => ({
    liquidatedUser: user,
    markPx: "150",
    method,
  });
  const reordered = `["${A}",{"px":"151","coin":"SOL","sz":"1.0","side":"B","time":${T + 300_000},"startPosition":"0.0","dir":"Open Long","closedPnl":"0.0","hash":"0x00","oid":7,"crossed":true,"fee":"0.0068","tid":8,"feeToken":"USDC"}]`;
  const lines = [
    byBlock(100, [
      ...trade(A, B, { coin: "SOL", side: "A", time: T - 100, tid: 0 }),
      ...trade(A, B, {
        coin: "SOL",
        side: "B",
        time: T,
        px: "150.5",
        sz: "2",
        tid: 1,
      }),
    ]),
    byBlock(101, [
      record(C, {
        coin: "SOL",
        side: "A",
        time: T + 1000,
        startPosition: "3.0",
        dir: "Close Long",
        crossed: true,
        tid: 2,
        liquidation: liqOf(C),
      }),
      record(D, {
        coin: "SOL",
        side: "B",
        time: T + 1000,
        crossed: false,
        tid: 2,
        liquidation: liqOf(C),
      }),
    ]),
    byBlock(103, [
      ...trade(E, B, { coin: "xyz:SOL", side: "B", time: T + 2000, tid: 3 }),
      ...trade(E, B, { coin: "@1", side: "B", time: T + 2000, tid: 4 }),
      ...trade(F, B, {
        coin: "BTC",
        side: "A",
        time: T + 2000,
        px: "60000",
        sz: "0.01",
        tid: 5,
      }),
    ]),
    byBlock(104, [
      record(C, {
        coin: "TRUMP",
        side: "B",
        time: T + 3000,
        startPosition: "-1.0",
        dir: "Close Short",
        crossed: true,
        tid: 6,
        liquidation: { liquidatedUser: C, markPx: "5", method: "market" },
      }),
      record(D, {
        coin: "TRUMP",
        side: "A",
        time: T + 3000,
        crossed: false,
        tid: 6,
        liquidation: { liquidatedUser: C, markPx: "5", method: "market" },
      }),
      ...trade(A, B, {
        coin: "SOL",
        side: "B",
        time: T + 3000,
        tid: "18446744073709551615",
      }),
      ...trade(A, B, {
        coin: "SOL",
        side: "B",
        time: T + 3000,
        tid: "18446744073709551616",
      }),
    ]),
    byBlock(105, [
      reordered,
      record(B, {
        coin: "SOL",
        side: "A",
        time: T + 300_000,
        crossed: false,
        tid: 8,
      }),
      ...trade(G, B, {
        coin: "SOL",
        side: "B",
        time: T + 300_000,
        tid: 9,
        cloid: 'q"}],["0x1',
      }),
    ]),
    byBlock(106, [
      ...trade(A, B, { coin: "SOL", side: "B", time: T + 2_400_000, tid: 10 }),
    ]),
    "",
    `{"local_time":"x","block_time":"y","block_number":107,"events":[["0x`,
    byBlock(108, [
      `["0x${"z".repeat(40)}",{"coin":"SOL"}]`,
      record(B, {
        coin: "SOL",
        side: "A",
        time: T + 600_000,
        crossed: false,
        tid: 11,
      }),
    ]),
    byBlock(109, []),
  ];
  const { scan, taker, liq, users } = run(
    `${lines.join("\n")}\n`,
    "node_fills_by_block",
    T + 30 * 60_000,
  );

  it("counts records, failures, the slow path, the late and the refused", () => {
    expect(scan).toMatchObject({
      lines: 10,
      records: 25,
      failed: 3,
      slowLines: 2,
      slowRecords: 1,
      misread: 0,
      late: 2,
      refused: 1,
    } satisfies Partial<Scan>);
    expect([...scan.byHour]).toEqual([
      [T - H, 2],
      [T, 23],
    ]);
    expect([...scan.pairs].sort()).toEqual([
      ["BTC", [1, 1, T + 2000]],
      ["SOL", [8, 9, T - 100]],
    ]);
    expect(scan.runs).toEqual([
      [100, 101],
      [103, 106],
      [108, 109],
    ]);
    expect(scan.times).toEqual({
      first: T - 100,
      max: T + 2_400_000,
      holes: [
        [T + 3000, T + 300_000],
        [T + 300_000, T + 2_400_000],
      ],
    });
  });

  it("hands the 40 coins' takers to `taker`, every coin's liquidations to `liq`, with the file's addresses", () => {
    expect(users.list).toEqual([A, C, D, F.toLowerCase(), G]);
    expect([...taker.coins.keys()]).toEqual(["SOL", "BTC"]);
    expect(taker.coins.get("SOL")).toEqual({
      time: [T - 100, T, T + 1000, T + 3000, T + 300_000, T + 300_000],
      px: [100.5, 150.5, 100.5, 100.5, 151, 100.5],
      sz: [2, 2, 2, 2, 1, 2],
      side: [-1, 1, -1, 1, 1, 1],
      flags: [0, 0, LIQUIDATION, 0, 0, 0],
      user: [0, 0, 1, 0, 0, 4],
      tid: [0, 0, 1, 0, 2, 0, 0xffffffff, 0xffffffff, 8, 0, 9, 0],
    } satisfies TakerRows);
    expect(taker.coins.get("BTC")).toMatchObject({
      time: [T + 2000],
      px: [60000],
      sz: [0.01],
      side: [-1],
      user: [3],
      tid: [5, 0],
    });
    expect(liq.coins.list).toEqual(["SOL", "TRUMP"]);
    expect(liq.methods.list).toEqual(["market"]);
    expect(liq.dirs.list).toEqual(["Close Long", "Open Long", "Close Short"]);
    expect(liq.rows).toEqual({
      time: [T + 1000, T + 1000, T + 3000, T + 3000],
      block: [101, 101, 104, 104],
      coin: [0, 0, 1, 1],
      user: [1, 2, 1, 2],
      liqUser: [1, 1, 1, 1],
      side: [-1, 1, 1, -1],
      crossed: [1, 0, 1, 0],
      method: [0, 0, 0, 0],
      dir: [0, 1, 2, 1],
      px: [100.5, 100.5, 100.5, 100.5],
      sz: [2, 2, 2, 2],
      markPx: [150, 150, 5, 5],
      startPosition: [3, 0, -1, 0],
      fee: [0.009, 0.009, 0.009, 0.009],
      closedPnl: [0, 0, 0, 0],
      tid: [2, 0, 2, 0, 6, 0, 6, 0],
      oid: [7, 0, 7, 0, 7, 0, 7, 0],
    });
  });

  it("keeps H14's highest taker rate a month over the 38 coins only", () => {
    // 0.0068 USDC on 151 × 1 (the reordered record) beats 0.009 on 100.5 × 2; BTC is not one of the 38.
    expect([...taker.topTaker]).toEqual([["2025-09", 0.0068 / (151 * 1)]]);
  });

  it("reads a `node_fills` file, one record a line, and flags the backstop's taker leg", () => {
    const nf = run(
      `${[
        ...trade(A, B, { coin: "SOL", side: "B", time: T, tid: 1 }),
        // A backstop liquidation: the account's own leg is not a taker's, the vault's is.
        record(C, {
          coin: "kPEPE",
          side: "A",
          time: T + 1,
          startPosition: "9.0",
          crossed: false,
          tid: 2,
          liquidation: liqOf(C, "backstop"),
        }),
        record(E, {
          coin: "kPEPE",
          side: "B",
          time: T + 1,
          crossed: true,
          tid: 2,
          liquidation: liqOf(C, "backstop"),
        }),
        "not json",
      ].join("\n")}\n`,
      "node_fills",
      T + H,
    );
    expect(nf.scan).toMatchObject({
      records: 4,
      failed: 1,
      slowLines: 1,
      runs: [],
    });
    expect(nf.taker.coins.get("SOL")?.user).toEqual([0]);
    expect(nf.taker.coins.get("kPEPE")?.flags).toEqual([
      BACKSTOP | LIQUIDATION,
    ]);
    expect(nf.liq.rows.crossed).toEqual([0, 1]);
    expect(nf.liq.rows.liqUser).toEqual([1, 1]);
    expect(nf.liq.methods.list).toEqual(["backstop"]);
    expect(nf.liq.rows.block).toEqual([NaN, NaN]);
  });
});

describe("u64Of", () => {
  it("splits digits into a u64's halves, exact beyond 2^53, refusing 2^64", () => {
    expect(u64Of("0")).toEqual([0, 0]);
    expect(u64Of("4294967296")).toEqual([0, 1]);
    expect(u64Of("999999999999999")).toEqual([2764472319, 232830]);
    expect(u64Of("9007199254740993")).toEqual([1, 2097152]);
    expect(u64Of("18446744073709551615")).toEqual([0xffffffff, 0xffffffff]);
    expect(u64Of("18446744073709551616")).toBeNull();
  });
});

/** A generated file: lines of 1–12 records over the 40 coins and others, takers and makers, some liquidations, some ids above 2^53. */
function generated(format: Format, n: number, seed: number) {
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const pick = <X>(xs: readonly X[]) => xs[Math.floor(rnd() * xs.length)]!;
  const coinsAll = [
    "SOL",
    "HYPE",
    "kPEPE",
    "BTC",
    "ETH",
    "xyz:SOL",
    "@7",
    "TRUMP",
  ];
  const out: string[] = [];
  let tid = 1;
  let t = T;
  for (let line = 0; line < n; line++) {
    const recs: string[] = [];
    const k = format === "node_fills" ? 1 : 1 + Math.floor(rnd() * 6);
    for (let j = 0; j < k; j++) {
      t += Math.floor(rnd() * 900);
      const coin = pick(coinsAll);
      const id = rnd() < 0.05 ? `${9007199254740993n + BigInt(tid)}` : tid;
      tid += 1;
      const liq = rnd() < 0.1;
      const spec = {
        coin,
        side: pick(["A", "B"] as const),
        time: t,
        px: `${100 + Math.floor(rnd() * 1000) / 100}`,
        sz: `${1 + Math.floor(rnd() * 100) / 10}`,
        tid: id,
        startPosition: liq ? pick(["3.5", "-2.0"]) : "0.0",
        ...(liq
          ? {
              liquidation: {
                liquidatedUser: addr(1 + (tid % 9)),
                markPx: "101",
                method: pick(["market", "backstop"]),
              },
            }
          : {}),
      };
      if (format === "node_fills" && rnd() < 0.5)
        recs.push(
          record(addr(1 + (tid % 9)), { ...spec, crossed: rnd() < 0.5 }),
        );
      else recs.push(...trade(addr(1 + (tid % 9)), addr(20 + (tid % 5)), spec));
    }
    if (format === "node_fills") out.push(...recs);
    else out.push(byBlock(1000 + line, recs));
  }
  return `${out.join("\n")}\n`;
}

/** What a naive parse of every line gives: JSON.parse with ids kept as digits, then WAVE-H's schema, record by record. */
function naive(text: string, format: Format, end: number) {
  const takers = new Map<
    string,
    { t: number; px: number; sz: number; tid: string; user: string }[]
  >();
  const liqs: { t: number; coin: string; user: string; tid: string }[] = [];
  const pairs = new Map<string, [number, number, number]>();
  let records = 0;
  let late = 0;
  for (const line of text.split("\n").slice(0, -1)) {
    const parsed = JSON.parse(
      line,
      (key: string, value: unknown, ctx?: { source?: string }): unknown =>
        (key === "tid" || key === "oid") && typeof value === "number"
          ? ctx!.source
          : value,
    ) as unknown;
    const list =
      format === "node_fills"
        ? [parsed]
        : (parsed as { events: unknown[] }).events;
    for (const r of list) {
      const rec = parseRecord(r)!;
      records += 1;
      const f = rec.fill;
      if (FORTY.has(f.coin)) {
        const p = pairs.get(f.coin) ?? [0, 0, f.time];
        p[f.crossed ? 0 : 1] += 1;
        p[2] = Math.min(p[2], f.time);
        pairs.set(f.coin, p);
      }
      if (f.time >= end) {
        late += 1;
        continue;
      }
      if (f.crossed && FORTY.has(f.coin)) {
        const list2 = takers.get(f.coin) ?? [];
        list2.push({
          t: f.time,
          px: Number(f.px),
          sz: Number(f.sz),
          tid: f.tid,
          user: rec.user,
        });
        takers.set(f.coin, list2);
      }
      if (f.liquidation !== undefined)
        liqs.push({ t: f.time, coin: f.coin, user: rec.user, tid: f.tid });
    }
  }
  return { takers, liqs, pairs, records, late };
}

const tidOf = (rows: readonly number[], i: number) =>
  ((BigInt(rows[2 * i + 1]!) << 32n) + BigInt(rows[2 * i]!)).toString();

describe("the scanner against a naive parse of every line", () => {
  for (const format of ["node_fills_by_block", "node_fills"] as const)
    it(`${format}: a generated file across many LZ4 blocks`, () => {
      const text = generated(format, format === "node_fills" ? 3000 : 700, 7);
      expect(text.length).toBeGreaterThan(4 * 65_536);
      const end = T + 10 * 60_000;
      const want = naive(text, format, end);
      const got = run(text, format, end, true);
      expect(got.scan).toMatchObject({
        records: want.records,
        failed: 0,
        slowLines: 0,
        slowRecords: 0,
        misread: 0,
        refused: 0,
        late: want.late,
      });
      expect(want.late).toBeGreaterThan(0);
      expect(new Map([...got.scan.pairs].sort())).toEqual(
        new Map([...want.pairs].sort()),
      );
      for (const [coin, rows] of want.takers) {
        const mine = got.taker.coins.get(coin)!;
        expect(mine.time, coin).toEqual(rows.map((r) => r.t));
        expect(mine.px, coin).toEqual(rows.map((r) => r.px));
        expect(mine.sz, coin).toEqual(rows.map((r) => r.sz));
        expect(
          mine.user.map((u) => got.users.list[u]),
          coin,
        ).toEqual(rows.map((r) => r.user));
        expect(
          rows.map((_, i) => tidOf(mine.tid, i)),
          coin,
        ).toEqual(rows.map((r) => r.tid));
      }
      expect([...got.taker.coins.keys()].sort()).toEqual(
        [...want.takers.keys()].sort(),
      );
      expect(got.liq.rows.time).toEqual(want.liqs.map((l) => l.t));
      expect(got.liq.rows.coin.map((c) => got.liq.coins.list[c])).toEqual(
        want.liqs.map((l) => l.coin),
      );
      expect(got.liq.rows.user.map((u) => got.users.list[u])).toEqual(
        want.liqs.map((l) => l.user),
      );
      expect(want.liqs.map((_, i) => tidOf(got.liq.rows.tid, i))).toEqual(
        want.liqs.map((l) => l.tid),
      );
    });
});

describe("the scanner against WAVE-H's own pass", () => {
  it("counts each file's records and failures as WAVE-H does, and keeps the same counted fills", () => {
    const t0 = Date.parse("2025-06-10T10:00:00Z");
    const t1 = Date.parse("2025-07-27T12:00:00Z");
    // The generated times start at T: each file's are moved into its own hour.
    const shift = (text: string, to: number) =>
      text.replace(
        /"time":(\d+)/g,
        (_, v: string) => `"time":${Number(v) - T + to}`,
      );
    const files = new Map<string, string>([
      [fillKey(t0), shift(generated("node_fills", 400, 3), t0)],
      [
        fillKey(t1, "node_fills_by_block"),
        `${shift(generated("node_fills_by_block", 150, 5), t1)}not a line\n`,
      ],
    ]);
    const { store } = makeStore(files, false);
    const list = manifestList(
      readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
    );
    for (const [key, format, at] of [
      [fillKey(t0), "node_fills", t0],
      [fillKey(t1, "node_fills_by_block"), "node_fills_by_block", t1],
    ] as const) {
      const pass = newPass();
      passFile(pass, new Set(), CLOSED, store, list, key, coins, Infinity);
      const users = new Names();
      const taker = new TakerWriter(FORTY, SMALL);
      const liq = new LiqWriter();
      const scan = scanFill(
        readFileSync(path.join(store, ...key.split("/"))),
        format,
        Infinity,
        FORTY,
        [taker, liq],
        users,
      );
      expect({ records: scan.records, failed: scan.failed }, key).toEqual(
        pass.days.get(new Date(at).toISOString().slice(0, 10)),
      );
      // WAVE-H's counted fills (H4) among liq's rows: the own leg, reducing, a taker's or a backstop's, in the 38 coins.
      const r = liq.rows;
      const mine = r.time
        .map((t, i) => ({
          t,
          addr: users.list[r.user[i]!]!,
          coin: liq.coins.list[r.coin[i]!]!,
          side: r.side[i]!,
          tid: tidOf(r.tid, i),
          method: liq.methods.list[r.method[i]!]!,
          own: r.liqUser[i] !== NONE && r.liqUser[i] === r.user[i],
          reducing: Math.sign(r.startPosition[i]!) === -r.side[i]!,
          ok:
            r.crossed[i] === 1 || liq.methods.list[r.method[i]!] === "backstop",
        }))
        .filter((x) => x.own && x.reducing && x.ok && SMALL.has(x.coin))
        .map((x) => ({
          t: x.t,
          addr: x.addr,
          side: x.side,
          tid: x.tid,
          method: x.method,
        }));
      expect(mine.length, key).toBeGreaterThan(0);
      expect(mine, key).toEqual(
        pass.counted.map((c) => ({
          t: c.t,
          addr: c.addr,
          side: c.side,
          tid: c.tid,
          method: c.method,
        })),
      );
    }
  });
});
