/**
 * FRESH's range and its extraction under the seal (src/polish/range.ts,
 * extract.ts, pass.ts, ctxs.ts, store.ts, counted.ts, tries/forced.ts;
 * polish/rules.md P1, P2; THE PLAN D2, D3, D11, D13): the download's 4,102
 * fill files, 170 days and 9 funding windows a coin, key for key with
 * tools/waveh-fetch.cjs's plan; FRESH's keys and folders refused while the
 * seal is closed and read once it is open, in this thread and through the
 * pass's worker; the counted and forced fills bounded by the store's own
 * end; an `asset_ctxs` day failing WAVE-H's 1% rule, or whose header lacks
 * a column, read as absent in FRESH's range and still stopping WAVE-H's.
 * Run in `pnpm verify`'s order: the worker is the build's.
 */
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { countedFrom } from "../src/polish/counted.js";
import { CtxsHeaderError, readContexts } from "../src/polish/ctxs.js";
import { extract } from "../src/polish/extract.js";
import {
  FRESH_RANGE,
  WAVEH_RANGE,
  blockFillKeys,
  type Range,
} from "../src/polish/range.js";
import {
  FRESH_END,
  SealedError,
  checkKey,
  type Seal,
} from "../src/polish/seal.js";
import { openStore, partitionDir } from "../src/polish/store.js";
import { forcedFrom } from "../src/polish/tries/forced.js";
import { fortyOf } from "../src/polish/writers.js";
import { HOUR_MS } from "../src/schedule.js";
import { loadCoins } from "../src/waveh/coins.js";
import { DATA_END } from "../src/waveh/instants.js";
import { ctxsKey, fundingKey, keyDate } from "../src/waveh/keys.js";
import { StoreError, manifestList } from "../src/waveh/store.js";
import { addr, byBlock, trade } from "./polish-world.js";
import { CTXS_HEAD, cleanScratch, makeStore, scratch } from "./waveh-world.js";

afterAll(cleanScratch, 120_000);

const OPEN: Seal = { examFrozen: true };
const coins = loadCoins();
const FORTY = [...fortyOf(coins)];
const SMALL = coins.list.map((c) => c.name);
const DAY = 86_400_000;
const MIN = 60_000;
const tmp = (name: string) => {
  const d = mkdtempSync(path.join(tmpdir(), `polish-${name}-`));
  scratch.push(d);
  return d;
};
const stamp = (t: number) => new Date(t).toISOString().replace(".000Z", "Z");
/** An `asset_ctxs` row of the full header, the mark given. */
const ctxsRow = (coin: string, t: number, mark: string) =>
  `${stamp(t)},${coin},0,1,1,1,0,1,${mark},1,1,1`;

const tool = createRequire(import.meta.url)(
  "../../../tools/waveh-fetch.cjs",
) as {
  DATA_END: number;
  FRESH_END: number;
  FRESH: {
    hours: [number, number];
    days: [number, number];
    windows: { start: number; end: number }[];
  };
};

describe("FRESH's range (rules.md P1)", () => {
  it("holds the 4,102 fill files, 170 days and 9 funding windows a coin, before FRESH_END, its grid and months", () => {
    const r = FRESH_RANGE;
    expect(r.fill.length).toBe(4102);
    expect(r.fill.every((k) => k.startsWith("node_fills_by_block/"))).toBe(
      true,
    );
    expect(r.fill[0]).toBe("node_fills_by_block/hourly/20260529/2.lz4");
    expect(r.fill.at(-1)).toBe("node_fills_by_block/hourly/20261115/23.lz4");
    expect(r.days.length).toBe(170);
    expect(r.days[0]).toBe(Date.parse("2026-05-29T00:00:00Z"));
    expect(r.days.at(-1)).toBe(Date.parse("2026-11-15T00:00:00Z"));
    expect(r.days).not.toContain(Date.parse("2026-07-08T00:00:00Z"));
    expect(r.days).toContain(Date.parse("2026-07-07T00:00:00Z"));
    expect(r.days).toContain(Date.parse("2026-07-09T00:00:00Z"));
    expect(r.fundingStarts.length * SMALL.length).toBe(342);
    expect(r.fundingStarts[0]).toBe(DATA_END);
    expect(r.fundingStarts.at(-1)).toBe(DATA_END + 160 * DAY);
    expect(r.grid).toEqual({
      start: Date.parse("2026-05-29T00:00:00Z"),
      minutes: 246_240,
    });
    expect(r.months).toEqual([
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
    ]);
    expect(r).toMatchObject({
      name: "FRESH",
      partial: null,
      end: FRESH_END,
      failingCtxsDayAbsent: true,
    });
    expect(WAVEH_RANGE.failingCtxsDayAbsent).toBeUndefined();
  });

  it("is the download tool's FRESH plan, key for key", () => {
    expect(tool.FRESH_END).toBe(FRESH_END);
    expect(tool.DATA_END).toBe(DATA_END);
    expect(FRESH_RANGE.fill).toEqual(blockFillKeys(...tool.FRESH.hours));
    const toolDays: number[] = [];
    for (let d = tool.FRESH.days[0]; d < tool.FRESH.days[1]; d += DAY)
      toolDays.push(d);
    expect(toolDays.length).toBe(171);
    expect(FRESH_RANGE.days).toEqual(
      toolDays.filter((d) => d !== Date.parse("2026-07-08T00:00:00Z")),
    );
    expect(FRESH_RANGE.fundingStarts).toEqual(
      tool.FRESH.windows.map((w) => w.start),
    );
    expect(tool.FRESH.windows.at(-1)!.end).toBe(FRESH_END);
    // Each key names its own hour: the archive's form, no zero padding.
    for (const k of FRESH_RANGE.fill) {
      const t = keyDate(k)!;
      expect(blockFillKeys(t, t + HOUR_MS), k).toEqual([k]);
    }
  });

  it("is sealed key by key while the seal is closed, and every key passes once it is open", () => {
    const keys = [
      ...FRESH_RANGE.fill,
      ...FRESH_RANGE.days.map(ctxsKey),
      ...SMALL.flatMap((c) =>
        FRESH_RANGE.fundingStarts.map((s) => fundingKey(c, s)),
      ),
    ];
    expect(keys.length).toBe(4614);
    expect(keys.filter((k) => keyDate(k)! <= DATA_END)).toEqual([
      "asset_ctxs/20260529.csv.lz4",
      ...SMALL.map((c) => fundingKey(c, DATA_END)),
    ]);
    for (const k of keys) {
      expect(() => checkKey(k, OPEN), k).not.toThrow();
      const t = keyDate(k)!;
      expect(t, k).toBeLessThan(FRESH_END);
      // FRESH's first ctxs day and funding window are dated at or before DATA END: its folder seals them.
      if (t > DATA_END) expect(() => checkKey(k), k).toThrow(SealedError);
    }
  });
});

const H0 = Date.parse("2026-06-01T10:00:00Z");
const D0 = Date.parse("2026-06-01T00:00:00Z");
const T = H0 + 30_000;

/** A raw store of two FRESH hours: a forced sell of SOL (a counted fill, tid 7) and a HYPE trade; one `asset_ctxs` day; the first funding window of the 38 coins. */
function world(ctxs = `${CTXS_HEAD}\n${ctxsRow("SOL", T, "150")}\n`) {
  const [fill1, fill2] = blockFillKeys(H0, H0 + 2 * HOUR_MS) as [
    string,
    string,
  ];
  const liq = { liquidatedUser: addr(1), markPx: "100", method: "market" };
  const files = new Map<string, string>([
    [
      fill1,
      `${byBlock(1, trade(addr(1), addr(2), { coin: "SOL", side: "A", time: T, tid: 7, startPosition: "1.0", liquidation: liq }))}\n`,
    ],
    [
      fill2,
      `${byBlock(2, trade(addr(3), addr(4), { coin: "HYPE", side: "B", time: H0 + HOUR_MS + 5_000, tid: 8 }))}\n`,
    ],
    [ctxsKey(D0), ctxs],
    ...SMALL.map((c) => [fundingKey(c, DATA_END), "[]"] as [string, string]),
  ]);
  const { store } = makeStore(files, false);
  const list = manifestList(
    readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
  );
  const range: Range = {
    name: "FRESH",
    partial: null,
    fill: [fill1, fill2],
    days: [D0],
    fundingStarts: [DATA_END],
    end: FRESH_END,
    grid: { start: D0, minutes: 1440 },
    months: ["2026-06"],
    failingCtxsDayAbsent: true,
  };
  return { store, list, range };
}
const run = (
  w: ReturnType<typeof world>,
  root: string,
  seal: Seal | undefined,
  workers = 0,
) =>
  extract({
    store: w.store,
    root,
    list: w.list,
    listName: "polish/fresh.sha256",
    listSha256: "3".repeat(64),
    range: w.range,
    workers,
    code: "4".repeat(64),
    wavehFrozen: "5".repeat(64),
    forty: FORTY,
    small: SMALL,
    pace: () => Promise.resolve(),
    log: () => {},
    seal,
  });

describe("FRESH's extraction under the seal (rules.md P2)", () => {
  it("refuses FRESH's raw store by its name and FRESH's keys while the seal is closed, writing no store", async () => {
    const w = world();
    const at = tmp("fresh");
    mkdirSync(path.join(at, "FRESH"));
    const named = path.join(at, "FRESH", "store");
    symlinkSync(w.store, named, "junction");
    try {
      const root = tmp("root");
      await expect(
        run({ ...w, store: named }, root, undefined),
      ).rejects.toThrow("FRESH is sealed until the polishing's exam is frozen");
      // Refused before anything is made: the root stays empty.
      expect(readdirSync(root)).toEqual([]);
      await expect(run(w, root, undefined)).rejects.toThrow(
        "dated after DATA END",
      );
      await expect(run(w, root, undefined, 1)).rejects.toThrow(SealedError);
      expect(() => openStore(path.join(root, "store"))).toThrow(StoreError);
      const m = await run({ ...w, store: named }, tmp("root"), OPEN);
      expect(m.range).toBe("FRESH");
    } finally {
      // The junction alone, never what it points at.
      rmdirSync(named);
    }
  }, 60_000);

  it("extracts FRESH's hours with the seal open, in this thread and through the worker alike; its counted and forced fills are bounded by its own end", async () => {
    const w = world();
    const one = tmp("root");
    const two = tmp("root");
    const m = await run(w, one, OPEN);
    const viaWorker = await run(w, two, OPEN, 1);
    expect(m).toMatchObject({
      range: "FRESH",
      end: FRESH_END,
      minuteStart: D0,
      inputs: { fill: 2, ctxs: 1, funding: 38 },
    });
    expect(viaWorker.partitions).toEqual(m.partitions);
    const store = openStore(path.join(one, "store"));
    expect(
      store.column(store.partition("minute", "SOL", "2026-06"), "mark")[600],
    ).toBe(150);
    const { counted, sizing, early } = countedFrom(store, coins);
    const sol = coins.byName.get("SOL")!.assetId;
    expect(counted).toEqual([
      { t: T, iid: sol, addr: addr(1), side: -1, tid: "7", method: "market" },
    ]);
    expect(sizing).toEqual([]);
    expect(early).toBe(0);
    const forced = forcedFrom(store, coins, counted);
    expect([...forced.t]).toEqual([T]);
    expect([...forced.px]).toEqual([100.5]);
  }, 60_000);

  it("opens a store in the analyzer's FRESH folder only under the open seal", async () => {
    const root = path.join(tmp("analyzer"), "ANALYZER", "FRESH");
    await expect(run(world(), root, undefined)).rejects.toThrow(
      "FRESH is sealed",
    );
    await run(world(), root, OPEN);
    const dir = path.join(root, "store");
    expect(() => openStore(dir)).toThrow(SealedError);
    const s = openStore(dir, OPEN);
    expect(s.seal).toEqual(OPEN);
    expect(s.files().map((f) => f.key)).toEqual(world().range.fill);
    // A store outside FRESH whose minute table is a junction into it: each file it reads is sealed by its real path.
    const view = path.join(tmp("view"), "store");
    mkdirSync(view);
    writeFileSync(
      path.join(view, "manifest.json"),
      readFileSync(path.join(dir, "manifest.json")),
    );
    const junction = path.join(view, "minute");
    symlinkSync(path.join(dir, "minute"), junction, "junction");
    try {
      const p = s.manifest.partitions.find((x) => x.table === "minute")!;
      const [name, want] = Object.entries(p.files)[0]!;
      const rel = `${partitionDir(p.table, p.coin, p.month)}/${name}`;
      expect(() => openStore(view).bytes(rel, want)).toThrow(SealedError);
      expect(openStore(view, OPEN).bytes(rel, want).length).toBe(want.bytes);
    } finally {
      // The junction alone, never what it points at.
      rmdirSync(junction);
    }
  }, 60_000);
});

describe("FRESH's asset_ctxs days (rules.md P2, D11)", () => {
  const day = (rows: readonly string[], head = CTXS_HEAD) =>
    `${head}\n${rows.join("\n")}\n`;
  const good = (n: number) =>
    Array.from({ length: n }, (_, i) => ctxsRow("HYPE", D0 + i * MIN, "10"));
  const bad = (n: number) =>
    Array.from({ length: n }, (_, i) => ctxsRow("SOL", D0 + i * MIN, "-1"));
  const read = (text: string, failingDayAbsent?: boolean) => {
    const { store } = makeStore(new Map([[ctxsKey(D0), text]]), false);
    return readContexts({
      store,
      list: manifestList(
        readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
      ),
      days: [D0],
      grid: { start: D0, minutes: 1440 },
      until: Infinity,
      forty: FORTY,
      small: new Set(SMALL),
      pace: () => Promise.resolve(),
      failingDayAbsent,
      seal: OPEN,
    });
  };

  it("reads a day above WAVE-H's 1% as absent, listed, its marks none, in FRESH's range; WAVE-H's range still stops", async () => {
    const text = day([...good(1000), ...bad(11)]);
    const c = await read(text, true);
    expect([...c.absent]).toEqual([
      [
        "2026-06-01",
        "11 of 1011 asset_ctxs rows of the small coins fail WAVE-H's schema",
      ],
    ]);
    expect(c.byDay.size).toBe(0);
    expect(c.byCoin.get("HYPE")!.get("mark")!.every(Number.isNaN)).toBe(true);
    expect(c.large).toEqual({
      rows: 0,
      failed: 0,
      offMinute: 0,
      late: 0,
      twice: 0,
    });
    await expect(read(text)).rejects.toThrow(
      new StoreError(
        "2026-06-01: 11 of 1011 asset_ctxs rows of the small coins fail WAVE-H's schema",
      ),
    );
  });

  it("reads a day at exactly 1%, or with fewer than 10 failing, as WAVE-H does, in both ranges", async () => {
    for (const [text, failed, rows] of [
      [day([...good(990), ...bad(10)]), 10, 1000],
      [day([...good(100), ...bad(9)]), 9, 109],
    ] as const)
      for (const absent of [true, undefined]) {
        const c = await read(text, absent);
        expect(c.absent.size).toBe(0);
        expect(c.byDay.get("2026-06-01")).toMatchObject({ failed, rows });
        // The row stamped D0 + 1 min is minute 0's end.
        expect(c.byCoin.get("HYPE")!.get("mark")![0]).toBe(10);
        expect(c.byCoin.get("HYPE")!.get("mark")![1439]).toBeNaN();
      }
  });

  it("reads a day whose header lacks a column as absent in FRESH's range; in WAVE-H's it still throws", async () => {
    const head = CTXS_HEAD.replace(",premium", "");
    const rows = good(5).map((r) => r.replace(/,0,1,10,/, ",1,10,"));
    const c = await read(day(rows, head), true);
    expect([...c.absent.keys()]).toEqual(["2026-06-01"]);
    expect(c.absent.get("2026-06-01")).toContain("asset_ctxs header");
    await expect(read(day(rows, head))).rejects.toThrow(CtxsHeaderError);
  });

  it("writes the absent days in the store's manifest, and no such field when there is none", async () => {
    const failing = await run(
      world(day([...good(1000), ...bad(11)])),
      tmp("root"),
      OPEN,
    );
    expect(failing.counts.ctxsAbsent).toEqual({
      "2026-06-01":
        "11 of 1011 asset_ctxs rows of the small coins fail WAVE-H's schema",
    });
    expect(failing.counts.ctxsByDay).toEqual({});
    const root = tmp("root");
    await run(world(), root, OPEN);
    const text = readFileSync(
      path.join(root, "store", "manifest.json"),
      "utf8",
    );
    expect(text).not.toContain("ctxsAbsent");
    expect(openStore(path.join(root, "store")).manifest.counts.ctxsAbsent).toBe(
      undefined,
    );
  }, 60_000);
});
