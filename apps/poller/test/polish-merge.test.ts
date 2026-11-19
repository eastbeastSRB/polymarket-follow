/**
 * The merge and the store (src/polish/merge.ts, store.ts): parts of a
 * synthetic store across a month's end and the hour both formats share,
 * merged and read back — H8's order with its ties, a record in both formats
 * kept once (the first file's), two users' records of one `tid` kept and
 * counted (the two HYPE trades of June 2025 among them), one user's `tid`
 * twice refused, rows in their months, the minute bars and contexts, funding,
 * the dictionaries' order, the same files from the parts in another order,
 * and a file that differs refused.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { digitsOf } from "../src/polish/counted.js";
import {
  addDay,
  newContexts,
  type Contexts,
  type Funding,
  type Grid,
} from "../src/polish/ctxs.js";
import {
  merge,
  monthsOf,
  type MergeInput,
  type Meta,
} from "../src/polish/merge.js";
import { runPass, type FileTask } from "../src/polish/pass.js";
import { SealedError } from "../src/polish/seal.js";
import {
  FILES_FILE,
  Store,
  openStore,
  partitionDir,
} from "../src/polish/store.js";
import { BACKSTOP, LIQUIDATION, fortyOf } from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import { DATA_END } from "../src/waveh/instants.js";
import { StoreError, manifestList } from "../src/waveh/store.js";
import { addr, byBlock, record, trade } from "./polish-world.js";
import {
  CTXS_HEAD,
  cleanScratch,
  fillKey,
  makeStore,
  scratch,
} from "./waveh-world.js";

afterAll(cleanScratch, 120_000);

const coins = loadCoins();
const FORTY = [...fortyOf(coins)];
const SMALL = coins.list.map((c) => c.name);
const MIN = 60_000;
const H0 = Date.parse("2025-06-30T23:00:00Z");
const H1 = Date.parse("2025-07-01T00:00:00Z");
const H2 = Date.parse("2025-07-27T08:00:00Z");
const GRID = { start: Date.parse("2025-06-30T00:00:00Z"), minutes: 28 * 1440 };

const liqOf = (user: string, method = "market") => ({
  liquidatedUser: user,
  markPx: "150",
  method,
});
/** A SOL liquidation: the account's own taker leg (a forced sell) and its maker. */
const soldOut = (who: string, t: number, tid: number) => [
  record(who, {
    coin: "SOL",
    side: "A",
    time: t,
    px: "140",
    sz: "3",
    startPosition: "3.0",
    dir: "Close Long",
    crossed: true,
    tid,
    liquidation: liqOf(who),
  }),
  record(addr(70), {
    coin: "SOL",
    side: "B",
    time: t,
    px: "140",
    sz: "3",
    crossed: false,
    tid,
    liquidation: liqOf(who),
  }),
];

function world(extra: string[] = []) {
  const files = new Map<string, string>([
    [
      fillKey(H0),
      [
        ...trade(addr(4), addr(60), {
          coin: "SOL",
          side: "B",
          time: H0 + 10 * MIN,
          px: "150",
          sz: "2",
          tid: 1,
        }),
        ...trade(addr(4), addr(60), {
          coin: "SOL",
          side: "A",
          time: H0 + 10 * MIN + 5000,
          px: "149",
          sz: "1",
          tid: 2,
        }),
        ...trade(addr(4), addr(61), {
          coin: "BTC",
          side: "B",
          time: H0 + 10 * MIN,
          px: "60000",
          sz: "0.5",
          tid: 3,
        }),
        // A backstop liquidation in kPEPE: the account's own leg is a maker's, the vault's a taker's.
        record(addr(8), {
          coin: "kPEPE",
          side: "A",
          time: H0 + 15 * MIN,
          px: "0.02",
          sz: "1000",
          startPosition: "1000.0",
          crossed: false,
          tid: 4,
          liquidation: liqOf(addr(8), "backstop"),
        }),
        record(addr(99), {
          coin: "kPEPE",
          side: "B",
          time: H0 + 15 * MIN,
          px: "0.02",
          sz: "1000",
          startPosition: "-500.0",
          crossed: true,
          tid: 4,
          liquidation: liqOf(addr(8), "backstop"),
        }),
        ...soldOut(addr(3), H0 + 20 * MIN, 5),
      ].join("\n") + "\n",
    ],
    [
      fillKey(H1),
      [
        // Written late: the hour before's last trade.
        ...trade(addr(4), addr(60), {
          coin: "SOL",
          side: "B",
          time: H1 - 100,
          px: "151",
          sz: "1",
          tid: 6,
        }),
        // One millisecond, two accounts: by address; one account, two trades: by tid.
        ...trade(addr(9), addr(60), {
          coin: "SOL",
          side: "B",
          time: H1 + 5 * MIN,
          tid: 7,
        }),
        ...trade(addr(2), addr(60), {
          coin: "SOL",
          side: "B",
          time: H1 + 5 * MIN,
          tid: 8,
        }),
        ...trade(addr(5), addr(60), {
          coin: "SOL",
          side: "B",
          time: H1 + 6 * MIN,
          tid: 50,
        }),
        ...trade(addr(5), addr(60), {
          coin: "SOL",
          side: "B",
          time: H1 + 6 * MIN,
          tid: 40,
        }),
        ...extra,
      ].join("\n") + "\n",
    ],
    // The hour both formats hold, a liquidation in both: kept once, the first file's.
    [fillKey(H2), `${soldOut(addr(3), H2 + 30 * MIN, 777).join("\n")}\n`],
    [
      fillKey(H2, "node_fills_by_block"),
      `${byBlock(5, soldOut(addr(3), H2 + 30 * MIN, 777))}\n`,
    ],
  ]);
  return storeOf(files);
}

/** A raw store of these files alone, and its fill files as the pass's tasks, in the map's order. */
function storeOf(files: Map<string, string>) {
  const { store } = makeStore(files, false);
  const list = manifestList(
    readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
  );
  const tasks: FileTask[] = [...files.keys()].map((key, index) => ({
    index,
    key,
    sha256: list.get(key)!,
  }));
  return { store, tasks };
}

/**
 * The two HYPE trades of June 2025 that share one `tid`, each its maker's and
 * its taker's record as the archive wrote them (read 2026-11-19 from WAVE-H's
 * raw store, each file held to `waveh/data.sha256`): the extraction's first
 * run stopped on them (decisions 2026-11-19).
 */
const SHARED_TID = "899064266001530";
const HYPE_TRADES = new Map([
  [
    "node_fills/hourly/20250618/16.lz4",
    [
      '["0xe94bf59e6beeb153c8a6dc28d8683865339c9958",{"coin":"HYPE","px":"38.747","sz":"0.57","side":"B","time":1750264851943,"startPosition":"3936.55","dir":"Open Long","closedPnl":"0.0","hash":"0xcdbdf83aa1601c7c8c890425c369b80201c700be3af1b1f9731d2b74ce963a3f","oid":103775832468,"crossed":false,"fee":"0.000883","tid":899064266001530,"feeToken":"USDC"}]',
      '["0xc5ed4501500fcbfb2b88fb7f0aa52f834ed44346",{"coin":"HYPE","px":"38.747","sz":"0.57","side":"A","time":1750264851943,"startPosition":"-1340.45","dir":"Open Short","closedPnl":"0.0","hash":"0xcdbdf83aa1601c7c8c890425c369b80201c700be3af1b1f9731d2b74ce963a3f","oid":103775962486,"crossed":true,"fee":"0.004328","tid":899064266001530,"cloid":"0x00000000d4ec000432924bb6936a172e","feeToken":"USDC"}]',
    ],
  ],
  [
    "node_fills/hourly/20250630/1.lz4",
    [
      '["0x7632bc759ac904181b6d6f3d885afba8891f0798",{"coin":"HYPE","px":"40.135","sz":"28.61","side":"B","time":1751247542640,"startPosition":"-2631.59","dir":"Close Short","closedPnl":"-3.161405","hash":"0xab3de3451f193966fb550426834fa2020931004d16946c9fb86484a4450d00fa","oid":107515091144,"crossed":false,"fee":"-0.034447","tid":899064266001530,"cloid":"0x20250630000000000000000000117782","feeToken":"USDC"}]',
      '["0x0284bbd3646b59740a167ef78a306028343f3806",{"coin":"HYPE","px":"40.135","sz":"28.61","side":"A","time":1751247542640,"startPosition":"-10228.5","dir":"Open Short","closedPnl":"0.0","hash":"0xab3de3451f193966fb550426834fa2020931004d16946c9fb86484a4450d00fa","oid":107515091459,"crossed":true,"fee":"0.367443","tid":899064266001530,"feeToken":"USDC"}]',
    ],
  ],
]);
/** Their takers, in time order. */
const HYPE_TAKERS = [
  "0xc5ed4501500fcbfb2b88fb7f0aa52f834ed44346",
  "0x0284bbd3646b59740a167ef78a306028343f3806",
] as const;
/** The minutes from the first trade's hour, 2025-06-18 16h, to the second's end, 06-30 02:00Z: 11 days and 10 hours. */
const HYPE_GRID: Grid = {
  start: Date.parse("2025-06-18T16:00:00Z"),
  minutes: (11 * 24 + 10) * 60,
};

const tmp = (name: string) => {
  const d = mkdtempSync(path.join(tmpdir(), `polish-${name}-`));
  scratch.push(d);
  return d;
};
const META: Meta = {
  range: "TEST",
  partial: null,
  end: DATA_END,
  minuteStart: GRID.start,
  inputs: {
    list: "manifest.jsonl",
    listSha256: "0".repeat(64),
    fill: 4,
    ctxs: 0,
    funding: 0,
  },
  code: {
    fingerprint: "1".repeat(64),
    wavehFrozen: "2".repeat(64),
    node: process.version,
  },
  peaks: () => ({}),
  seconds: {},
};

const quiet = { pace: () => Promise.resolve(), log: () => {} };

async function build(
  extra: string[] = [],
  order: (t: FileTask[]) => FileTask[] = (t) => t,
  hooks: Pick<MergeInput, "pace" | "log"> = quiet,
) {
  const contexts = newContexts(GRID, FORTY);
  addDay(
    contexts,
    `${CTXS_HEAD}\n${new Date(H0 + 11 * MIN).toISOString().replace(".000Z", "Z")},SOL,0.00001,500,148,9000,0.0003,150.5,150.4,150.45,150.3,150.6\n`,
    DATA_END,
    new Set(SMALL),
  );
  const funding: Funding = {
    byCoin: new Map([
      [
        "SOL",
        [
          [H0, 0.0001, H0 + 31],
          [H1, -0.0002, H1 + 40],
        ],
      ],
    ]),
    counts: new Map([
      ["SOL", { windows: { "2025-06-14": 2 }, failed: 0, late: 0 }],
    ]),
  };
  return merged(world(extra), GRID, contexts, funding, order, hooks);
}

/** A raw store's files through the pass, then the merge of the grid's months. */
async function merged(
  { store, tasks }: { store: string; tasks: FileTask[] },
  grid: Grid,
  contexts: Contexts,
  funding: Funding,
  order: (t: FileTask[]) => FileTask[] = (t) => t,
  hooks: Pick<MergeInput, "pace" | "log"> = quiet,
) {
  const parts = tmp("parts");
  await runPass({
    store,
    parts,
    files: tasks,
    end: DATA_END,
    code: "c",
    forty: FORTY,
    small: SMALL,
    workers: 0,
    ...quiet,
  });
  const dir = tmp("store");
  const manifest = await merge(
    {
      parts,
      dir,
      files: order(tasks),
      code: "c",
      months: monthsOf(grid.start, grid.start + grid.minutes * MIN),
      grid,
      small: SMALL,
      forty: FORTY,
      contexts,
      funding,
      ...hooks,
    },
    {
      ...META,
      minuteStart: grid.start,
      inputs: { ...META.inputs, fill: tasks.length },
    },
  );
  return { dir, manifest };
}

/** The two HYPE trades alone, merged over their grid, the second trade's taker `taker2`. */
const hypeMerged = (taker2: string = HYPE_TAKERS[1]) =>
  merged(
    storeOf(
      new Map(
        [...HYPE_TRADES].map(([key, lines]) => [
          key,
          `${lines.join("\n")}\n`.replace(HYPE_TAKERS[1], taker2),
        ]),
      ),
    ),
    HYPE_GRID,
    newContexts(HYPE_GRID, FORTY),
    { byCoin: new Map(), counts: new Map() },
  );

describe("the merge", { timeout: 60_000 }, () => {
  it("writes each coin's tape in H8's order, rows in their months, a record in both formats once", async () => {
    const { dir, manifest } = await build();
    const s = openStore(dir);
    expect(s.manifest).toEqual(manifest);
    const users = s.users();
    expect(users).toEqual([...users].sort());
    const tape = (month: string) => {
      const p = s.partition("tape", "SOL", month);
      const tid = s.column(p, "tid") as Uint32Array;
      return {
        rows: p.rows,
        time: [...s.column(p, "time")],
        user: [...s.column(p, "user")].map((u) => users[u]),
        tid: Array.from({ length: p.rows }, (_, i) => tid[2 * i]),
        side: [...s.column(p, "side")],
        flags: [...s.column(p, "flags")],
      };
    };
    expect(tape("2025-06")).toEqual({
      rows: 4,
      time: [H0 + 10 * MIN, H0 + 10 * MIN + 5000, H0 + 20 * MIN, H1 - 100],
      user: [addr(4), addr(4), addr(3), addr(4)],
      tid: [1, 2, 5, 6],
      side: [1, -1, -1, 1],
      flags: [0, 0, LIQUIDATION, 0],
    });
    expect(tape("2025-07")).toEqual({
      rows: 5,
      time: [
        H1 + 5 * MIN,
        H1 + 5 * MIN,
        H1 + 6 * MIN,
        H1 + 6 * MIN,
        H2 + 30 * MIN,
      ],
      user: [addr(2), addr(9), addr(5), addr(5), addr(3)],
      tid: [8, 7, 40, 50, 777],
      side: [1, 1, 1, 1, -1],
      flags: [0, 0, 0, 0, LIQUIDATION],
    });
    expect(s.partition("tape", "kPEPE", "2025-06").rows).toBe(1);
    expect([
      ...s.column(s.partition("tape", "kPEPE", "2025-06"), "flags"),
    ]).toEqual([BACKSTOP | LIQUIDATION]);
    expect(s.partition("tape", "PONS", "2025-07").rows).toBe(0);
    expect(() => s.partition("tape", "BTC", "2025-06")).toThrow(StoreError);
    expect(manifest.counts.merge).toEqual({
      tape: { in: 11, out: 10, duplicates: 1 },
      bars: { in: 1, out: 1, duplicates: 0 },
      liq: { in: 8, out: 6, duplicates: 2 },
    });
    expect(manifest.counts.tids).toEqual({
      shared: {},
      sameUserApart: {},
      refused: 0,
    });
  });

  it("keeps liq's first file's record of the hour both formats hold, with every coin's names", async () => {
    const { dir } = await build();
    const s = openStore(dir);
    const names = s.names();
    expect(names).toEqual({
      coins: ["SOL", "kPEPE"],
      methods: ["backstop", "market"],
      dirs: ["Close Long", "Open Long"],
    });
    const p = s.partition("liq", null, "2025-07");
    expect(p.rows).toBe(2);
    expect([...s.column(p, "file")]).toEqual([2, 2]);
    expect([...s.column(p, "crossed")].sort()).toEqual([0, 1]);
    const june = s.partition("liq", null, "2025-06");
    expect(june.rows).toBe(4);
    expect([...s.column(june, "coin")].map((c) => names.coins[c])).toEqual([
      "kPEPE",
      "kPEPE",
      "SOL",
      "SOL",
    ]);
  });

  it("keeps the first file's record of one (time, user, tid) even where a later one differs, and counts in the liq bars only an account's own reducing leg", async () => {
    const { dir } = await build([
      // The H0 file's first trade again, another price: the first file's stands.
      record(addr(4), {
        coin: "SOL",
        side: "B",
        time: H0 + 10 * MIN,
        px: "999",
        sz: "2",
        crossed: true,
        tid: 1,
      }),
      // An own crossed leg from a flat position: not reducing, so not counted.
      record(addr(11), {
        coin: "SOL",
        side: "A",
        time: H0 + 30 * MIN,
        px: "140",
        sz: "3",
        startPosition: "0.0",
        crossed: true,
        tid: 31,
        liquidation: liqOf(addr(11)),
      }),
    ]);
    const s = openStore(dir);
    const tape = s.partition("tape", "SOL", "2025-06");
    expect([...s.column(tape, "px")]).not.toContain(999);
    expect(s.manifest.counts.merge.tape!.duplicates).toBe(2);
    const col = (coin: string, name: string) =>
      s.column(s.partition("minute", coin, "2025-06"), name);
    expect(col("SOL", "buyNtl")[23 * 60 + 10]).toBe(300);
    expect(col("SOL", "liqSellNtl")[23 * 60 + 30]).toBe(0);
    // The backstop: the account's own maker leg counts; the vault's reducing taker leg does not.
    expect(col("kPEPE", "liqSellNtl")[23 * 60 + 15]).toBe(20);
    expect(col("kPEPE", "liqBuyNtl")[23 * 60 + 15]).toBe(0);
  });

  it("makes the minute bars from the takers and the counted fills, and places the contexts and funding", async () => {
    const { dir } = await build();
    const s = openStore(dir);
    const june = s.partition("minute", "SOL", "2025-06");
    expect(june).toMatchObject({ start: GRID.start, rows: 1440 });
    const at = (name: string, k: number) => s.column(june, name)[k];
    const k = 23 * 60 + 10;
    expect([at("trades", k), at("buyNtl", k), at("sellNtl", k)]).toEqual([
      2, 300, 149,
    ]);
    expect([at("last", k), at("high", k), at("low", k)]).toEqual([
      149, 150, 149,
    ]);
    expect(at("liqSellNtl", 23 * 60 + 20)).toBe(420);
    expect(at("liqBuyNtl", 23 * 60 + 20)).toBe(0);
    expect(at("last", 0)).toBeNaN();
    // The context row stamped 23:11:00 is the mark at minute 23:10's end.
    expect([
      at("mark", k),
      at("oracle", k),
      at("dayNtlVlm", k),
      at("premium", k),
    ]).toEqual([150.4, 150.5, 9000, 0.0003]);
    const kpepe = s.partition("minute", "kPEPE", "2025-06");
    expect(s.column(kpepe, "backstopNtl")[23 * 60 + 15]).toBe(20);
    expect(s.column(kpepe, "trades")[23 * 60 + 15]).toBe(0);
    const btc = s.partition("minute", "BTC", "2025-06");
    expect(s.column(btc, "buyNtl")[k]).toBe(30000);
    const july = s.partition("minute", "SOL", "2025-07");
    expect(july).toMatchObject({
      start: Date.parse("2025-07-01T00:00:00Z"),
      rows: 27 * 1440,
    });
    expect(s.column(july, "trades")[5]).toBe(2);
    const f6 = s.partition("funding", "SOL", "2025-06");
    expect([...s.column(f6, "time")]).toEqual([H0 + 31]);
    expect([
      ...s.column(s.partition("funding", "SOL", "2025-07"), "rate"),
    ]).toEqual([-0.0002]);
    expect(s.files().map((f) => [f.index, f.records])).toEqual([
      [0, 10],
      [1, 10],
      [2, 2],
      [3, 2],
    ]);
  });

  it("opens and reads no store inside a sealed folder", async () => {
    const { dir, manifest } = await build();
    const sealed = path.join(tmp("sealed"), "ANALYZER", "FRESH", "store");
    expect(() => openStore(sealed)).toThrow(SealedError);
    const s = new Store(sealed, manifest, "0".repeat(64));
    expect(() => s.bytes(FILES_FILE, manifest.files)).toThrow(SealedError);
    expect(openStore(dir).files().length).toBe(4);
  });

  it("gives the same files from the parts in another order, and refuses a file that differs", async () => {
    const a = await build();
    const b = await build([], (t) => [...t].reverse());
    const same = (m: typeof a.manifest) => ({
      ...m,
      written: null,
      seconds: null,
    });
    expect(same(b.manifest)).toEqual(same(a.manifest));
    const s = openStore(a.dir);
    const p = s.partition("tape", "SOL", "2025-07");
    const file = path.join(
      a.dir,
      ...partitionDir("tape", "SOL", "2025-07").split("/"),
      "px.f64",
    );
    const bytes = readFileSync(file);
    bytes[0] = bytes[0]! ^ 1;
    writeFileSync(file, bytes);
    expect(() => s.column(p, "px")).toThrow("differs from the manifest");
  });

  it("keeps in files.jsonl each file's tids left unpaired, a trade split across two files in both", async () => {
    const { dir } = await build([
      // The maker of a SOL trade whose taker's record is not in this file.
      record(addr(5), {
        coin: "SOL",
        side: "A",
        time: H1 + 7 * MIN,
        crossed: false,
        tid: 60,
      }),
    ]);
    expect(
      openStore(dir)
        .files()
        .map((f) => f.unpaired),
    ).toEqual([[], [["SOL", "60", -1]], [], []]);
  });

  it("stops at one account's liquidation tid in two records of a month", async () => {
    const liq = (time: number) =>
      record(addr(8), {
        coin: "SOL",
        side: "B",
        time,
        crossed: false,
        tid: 90,
        liquidation: liqOf(addr(8)),
      });
    await expect(build([liq(H1 + MIN), liq(H1 + 2 * MIN)])).rejects.toThrow(
      "liq 2025-07: one account's tid is in two records",
    );
  });

  it("stops at a taker row of a month outside its minute grid", async () => {
    await expect(
      build(
        trade(addr(6), addr(60), {
          coin: "SOL",
          side: "B",
          time: Date.parse("2025-06-29T12:00:00Z"),
          tid: 91,
        }),
      ),
    ).rejects.toThrow("SOL 2025-06: a taker row outside the minute grid");
  });

  it("stops when liq's names outgrow their columns", async () => {
    const dirs = Array.from({ length: 256 }, (_, i) =>
      record(addr(8), {
        coin: "SOL",
        side: "B",
        time: H1 + i,
        dir: `d${i}`,
        crossed: false,
        tid: 1000 + i,
        liquidation: liqOf(addr(8)),
      }),
    );
    await expect(build(dirs)).rejects.toThrow(
      "liq's names outgrow their columns",
    );
    // 253 more names, 255 in all, still fit.
    await expect(build(dirs.slice(0, 253))).resolves.toBeDefined();
  });

  it("waits on its pace before each month, and finishes no month while it waits", async () => {
    let months = 0;
    const seen: [number, number][] = [];
    await build([], (t) => t, {
      pace: async () => {
        const before = months;
        await new Promise((r) => setTimeout(r, 30));
        seen.push([before, months]);
      },
      log: (event) => {
        if (event === "month") months += 1;
      },
    });
    expect(seen).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  it("keeps two users' records of one tid, at two instants or at one, in H8's order, each trade paired in its file; counts them in the manifest and the month's log line, beside the rows dropped", async () => {
    const lines: [string, Record<string, unknown>][] = [];
    const built = build(
      [
        // Another user's trade with the tid of addr(9)'s at H1 + 5 min: two trades.
        ...trade(addr(6), addr(63), {
          coin: "SOL",
          side: "B",
          time: H1 + 9 * MIN,
          tid: 7,
        }),
        // Two users' trades of one tid at one instant: by address.
        ...trade(addr(12), addr(64), {
          coin: "SOL",
          side: "A",
          time: H1 + 8 * MIN,
          tid: 70,
        }),
        ...trade(addr(1), addr(65), {
          coin: "SOL",
          side: "A",
          time: H1 + 8 * MIN,
          tid: 70,
        }),
        // BTC's alike: its bars count both.
        ...trade(addr(13), addr(67), {
          coin: "BTC",
          side: "B",
          time: H1 + 11 * MIN,
          px: "60000",
          sz: "0.1",
          tid: 80,
        }),
        ...trade(addr(14), addr(68), {
          coin: "BTC",
          side: "A",
          time: H1 + 12 * MIN,
          px: "60010",
          sz: "0.2",
          tid: 80,
        }),
      ],
      (t) => t,
      {
        pace: () => Promise.resolve(),
        log: (event, fields) =>
          lines.push([event, fields as Record<string, unknown>]),
      },
    );
    // Not refused: the merge resolves.
    await expect(built).resolves.toBeDefined();
    const { dir, manifest } = await built;
    const s = openStore(dir);
    const users = s.users();
    const p = s.partition("tape", "SOL", "2025-07");
    const tid = s.column(p, "tid") as Uint32Array;
    expect({
      time: [...s.column(p, "time")],
      user: [...s.column(p, "user")].map((u) => users[u]),
      tid: Array.from({ length: p.rows }, (_, i) => digitsOf(tid, i)),
      side: [...s.column(p, "side")],
    }).toEqual({
      time: [
        H1 + 5 * MIN,
        H1 + 5 * MIN,
        H1 + 6 * MIN,
        H1 + 6 * MIN,
        H1 + 8 * MIN,
        H1 + 8 * MIN,
        H1 + 9 * MIN,
        H2 + 30 * MIN,
      ],
      user: [
        addr(2),
        addr(9),
        addr(5),
        addr(5),
        addr(1),
        addr(12),
        addr(6),
        addr(3),
      ],
      tid: ["8", "7", "40", "50", "70", "70", "7", "777"],
      side: [1, 1, 1, 1, -1, -1, 1, -1],
    });
    const btc = s.partition("minute", "BTC", "2025-07");
    expect(
      ["trades", "buyNtl", "sellNtl"].map((c) => [
        ...s.column(btc, c).subarray(11, 13),
      ]),
    ).toEqual([
      [1, 1],
      [6000, 0],
      [0, 12002],
    ]);
    expect(manifest.counts.tids).toEqual({
      shared: { "SOL 2025-07": 2, "BTC 2025-07": 1 },
      sameUserApart: {},
      refused: 0,
    });
    expect(manifest.counts.merge).toMatchObject({
      tape: { in: 14, out: 13, duplicates: 1 },
      bars: { in: 3, out: 3, duplicates: 0 },
    });
    expect(s.files().map((f) => f.unpaired)).toEqual([[], [], [], []]);
    expect(
      lines
        .filter(([event]) => event === "month")
        .map(([, f]) => [f.month, f.duplicates, f.shared, f.sameUserApart]),
    ).toEqual([
      ["2025-06", 0, {}, {}],
      ["2025-07", 3, { SOL: 2, BTC: 1 }, {}],
    ]);
  });

  it("keeps one user's two records of one tid 60 s or more apart, two trades no tape window holds both of, and counts them; stops at two less than 60 s apart, held to the user's previous record, naming the user, the tid, both instants and how many in all", async () => {
    const again = (user: number, tid: number, time: number) =>
      trade(addr(user), addr(66), { coin: "SOL", side: "B", time, tid });
    const iso = (t: number) => new Date(t).toISOString();
    // addr(9)'s tid 7 at H1 + 5 min, again exactly 60 s later.
    const T = H1 + 5 * MIN;
    const lines: [string, Record<string, unknown>][] = [];
    const kept = build(again(9, 7, T + 60_000), (t) => t, {
      pace: () => Promise.resolve(),
      log: (event, fields) =>
        lines.push([event, fields as Record<string, unknown>]),
    });
    await expect(kept).resolves.toBeDefined();
    const { dir, manifest } = await kept;
    const s = openStore(dir);
    const users = s.users();
    const p = s.partition("tape", "SOL", "2025-07");
    const time = [...s.column(p, "time")];
    const user = [...s.column(p, "user")].map((u) => users[u]);
    const tid = s.column(p, "tid") as Uint32Array;
    expect(
      time.filter((_, i) => user[i] === addr(9) && digitsOf(tid, i) === "7"),
    ).toEqual([T, T + 60_000]);
    expect(manifest.counts.tids).toEqual({
      shared: {},
      sameUserApart: { "SOL 2025-07": 1 },
      refused: 0,
    });
    expect(
      lines
        .filter(([event]) => event === "month")
        .map(([, f]) => [f.month, f.shared, f.sameUserApart]),
    ).toEqual([
      ["2025-06", {}, {}],
      ["2025-07", {}, { SOL: 1 }],
    ]);
    // 59.999 s later: a window holds both.
    const first = `SOL 2025-07: the user ${addr(9)} has the tid 7 in two records less than 60 s apart, at ${iso(T)} and ${iso(T + 59_999)}`;
    const one = await build(again(9, 7, T + 59_999)).catch((e: unknown) => e);
    expect(one).toBeInstanceOf(StoreError);
    expect((one as Error).message).toBe(first);
    // 70 s after the first, then 30 s after that: refused against the previous record.
    const three = await build([
      ...again(9, 7, T + 70_000),
      ...again(9, 7, T + 100_000),
    ]).catch((e: unknown) => e);
    expect(three).toBeInstanceOf(StoreError);
    expect((three as Error).message).toBe(
      `SOL 2025-07: the user ${addr(9)} has the tid 7 in two records less than 60 s apart, at ${iso(T + 70_000)} and ${iso(T + 100_000)}`,
    );
    const two = await build([
      ...again(9, 7, T + 59_999),
      ...again(5, 40, H1 + 6 * MIN + 30_000),
    ]).catch((e: unknown) => e);
    expect(two).toBeInstanceOf(StoreError);
    expect((two as Error).message).toBe(`${first} (2 in all)`);
  });

  it("keeps the two HYPE trades of June 2025 that share a tid, the archive's records as they are, two users' or one user's 12 days apart, and counts them; a manifest naming a refusal does not open", async () => {
    const built = hypeMerged();
    await expect(built).resolves.toBeDefined();
    const { dir, manifest } = await built;
    const s = openStore(dir);
    const users = s.users();
    const p = s.partition("tape", "HYPE", "2025-06");
    const tid = s.column(p, "tid") as Uint32Array;
    expect({
      time: [...s.column(p, "time")],
      user: [...s.column(p, "user")].map((u) => users[u]),
      tid: Array.from({ length: p.rows }, (_, i) => digitsOf(tid, i)),
      px: [...s.column(p, "px")],
      sz: [...s.column(p, "sz")],
      side: [...s.column(p, "side")],
    }).toEqual({
      time: [1750264851943, 1751247542640],
      user: [...HYPE_TAKERS],
      tid: [SHARED_TID, SHARED_TID],
      px: [38.747, 40.135],
      sz: [0.57, 28.61],
      side: [-1, -1],
    });
    expect(manifest.counts.tids).toEqual({
      shared: { "HYPE 2025-06": 1 },
      sameUserApart: {},
      refused: 0,
    });
    expect(manifest.counts.merge.tape).toEqual({
      in: 2,
      out: 2,
      duplicates: 0,
    });
    expect(s.files().map((f) => [f.key, f.unpaired])).toEqual(
      [...HYPE_TRADES.keys()].map((key) => [key, []]),
    );
    // Both takers one user's: two trades 12 days apart, kept.
    const one = hypeMerged(HYPE_TAKERS[0]);
    await expect(one).resolves.toBeDefined();
    const same = openStore((await one).dir);
    const q = same.partition("tape", "HYPE", "2025-06");
    expect([...same.column(q, "time")]).toEqual([1750264851943, 1751247542640]);
    expect((await one).manifest.counts.tids).toEqual({
      shared: {},
      sameUserApart: { "HYPE 2025-06": 1 },
      refused: 0,
    });
    const file = path.join(dir, "manifest.json");
    const m = JSON.parse(readFileSync(file, "utf8")) as {
      counts: { tids: { refused: number } };
    };
    m.counts.tids.refused = 1;
    writeFileSync(file, JSON.stringify(m));
    expect(() => openStore(dir)).toThrow(/refused/);
  });
});
