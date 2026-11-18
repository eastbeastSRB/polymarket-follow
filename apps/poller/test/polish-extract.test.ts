/**
 * The program's extraction (src/polish/extract.ts, range.ts, run.ts and
 * the built `dist/polish.js`): WAVE-H's range and a day of it, the settings,
 * the exit codes, the code's fingerprint, `extract` end to end on a
 * synthetic store, and the built program's refusals.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { extract } from "../src/polish/extract.js";
import { WAVEH_RANGE, dayOf, type Range } from "../src/polish/range.js";
import {
  ExtractSettings,
  GateFailed,
  exitOf,
  fingerprintOf,
  writeUnflushed,
} from "../src/polish/run.js";
import { SealedError } from "../src/polish/seal.js";
import { openStore } from "../src/polish/store.js";
import { fortyOf } from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import { PACKAGE_ROOT } from "../src/waveh/gate.js";
import { DATA_END } from "../src/waveh/instants.js";
import { ctxsKey, fundingKey } from "../src/waveh/keys.js";
import { FrozenDiffer, RENAME_TRIES } from "../src/waveh/run.js";
import { StoreError, manifestList } from "../src/waveh/store.js";
import { addr, trade } from "./polish-world.js";
import {
  CTXS_HEAD,
  cleanScratch,
  fillKey,
  makeStore,
  scratch,
} from "./waveh-world.js";

afterAll(cleanScratch);

const coins = loadCoins();
const tmp = (name: string) => {
  const d = mkdtempSync(path.join(tmpdir(), `polish-${name}-`));
  scratch.push(d);
  return d;
};

describe("the ranges", () => {
  it("holds WAVE-H's 8,845 fill files, 370 days, 20 funding windows, 13 months before DATA END", () => {
    const r = WAVEH_RANGE;
    expect(r.fill.length).toBe(8845);
    expect(r.fill.filter((k) => k.startsWith("node_fills/")).length).toBe(1507);
    expect(r.fill[0]).toBe("node_fills/hourly/20250525/14.lz4");
    expect(r.fill.at(-1)).toBe("node_fills_by_block/hourly/20260529/1.lz4");
    expect(r.days.length).toBe(370);
    expect(r.fundingStarts.length).toBe(20);
    expect(r.months).toEqual([
      "2025-05",
      "2025-06",
      "2025-07",
      "2025-08",
      "2025-09",
      "2025-10",
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
    ]);
    expect(r.grid).toEqual({
      start: Date.parse("2025-05-25T00:00:00Z"),
      minutes: 531_420,
    });
    expect(r.end).toBe(DATA_END);
  });

  it("gives a day's files and contexts, its grid from the hour before; refuses a day outside", () => {
    const d = dayOf(WAVEH_RANGE, "2025-10-10");
    expect(d.fill.length).toBe(24);
    expect(d.fill[0]).toBe("node_fills_by_block/hourly/20251010/0.lz4");
    expect(d).toMatchObject({
      partial: "2025-10-10",
      days: [Date.parse("2025-10-10T00:00:00Z")],
      fundingStarts: [],
      grid: { start: Date.parse("2025-10-09T23:00:00Z"), minutes: 1500 },
      months: ["2025-10"],
    });
    expect(dayOf(WAVEH_RANGE, "2025-07-27").fill.length).toBe(25);
    expect(dayOf(WAVEH_RANGE, "2025-08-01").months).toEqual([
      "2025-07",
      "2025-08",
    ]);
    expect(() => dayOf(WAVEH_RANGE, "2026-06-01")).toThrow(
      "is not a day of WAVE-H",
    );
  });
});

describe("the settings, the exits, the fingerprint", () => {
  const store = "F:\\polymarket-follow-research\\WAVE-H\\store";
  it("takes WAVE-H's raw store and a folder outside it, nothing else", () => {
    expect(
      ExtractSettings.safeParse({
        WAVEH_STORE: store,
        ANALYZER_ROOT: "F:\\a\\ANALYZER\\WAVE-H",
      }).success,
    ).toBe(true);
    for (const bad of [
      { WAVEH_STORE: "F:\\x\\FRESH\\store", ANALYZER_ROOT: "F:\\a\\b" },
      { WAVEH_STORE: "relative\\WAVE-H\\store", ANALYZER_ROOT: "F:\\a\\b" },
      { WAVEH_STORE: store, ANALYZER_ROOT: `${store}\\analyzer` },
      { WAVEH_STORE: store, ANALYZER_ROOT: "F:\\polymarket-follow-research" },
      { WAVEH_STORE: store },
    ])
      expect(ExtractSettings.safeParse(bad).success, JSON.stringify(bad)).toBe(
        false,
      );
  });

  it("maps each error to its exit", () => {
    expect(exitOf(new FrozenDiffer("x")).code).toBe(4);
    expect(exitOf(new StoreError("x")).code).toBe(5);
    expect(exitOf(new SealedError("x")).code).toBe(5);
    expect(exitOf(new GateFailed("x")).code).toBe(6);
    expect(exitOf(new Error("x")).code).toBe(1);
  });

  it("writes a part or a column whole without its flush, tries a refused rename again, and gives up after its tries", () => {
    const at = tmp("write");
    const file = path.join(at, "parts", "7.part");
    writeUnflushed(file, Buffer.from("one"));
    writeUnflushed(file, Buffer.from("two"));
    expect(readFileSync(file, "utf8")).toBe("two");
    expect(readdirSync(path.dirname(file))).toEqual(["7.part"]);
    // A rename onto a folder is refused every time: 10 tries, 9 pauses between.
    const folder = path.join(at, "folder");
    mkdirSync(path.join(folder, "x"), { recursive: true });
    const t0 = Date.now();
    expect(() =>
      writeUnflushed(folder, Buffer.from("three"), RENAME_TRIES, 500),
    ).toThrow(/EPERM|EISDIR|ENOTEMPTY/);
    const waited = Date.now() - t0;
    expect(waited).toBeGreaterThanOrEqual(9 * 500);
    expect(waited).toBeLessThan(10 * 500);
    expect(() => writeUnflushed(folder, Buffer.from("four"), 1)).toThrow(
      /EPERM|EISDIR|ENOTEMPTY/,
    );
  }, 30_000);

  it("names the code by its compiled files, and changes when one does", () => {
    const root = tmp("pkg");
    mkdirSync(path.join(root, "dist", "polish"), { recursive: true });
    writeFileSync(path.join(root, "dist", "polish.js"), "a");
    writeFileSync(path.join(root, "dist", "polish", "x.js"), "b");
    const one = fingerprintOf(root);
    expect(fingerprintOf(root)).toBe(one);
    writeFileSync(path.join(root, "dist", "polish", "x.js"), "c");
    expect(fingerprintOf(root)).not.toBe(one);
  });
});

describe("extract, end to end", { timeout: 60_000 }, () => {
  const T = Date.parse("2025-06-10T10:00:00Z");
  const D = Date.parse("2025-06-10T00:00:00Z");
  function world() {
    const fills = [fillKey(T), fillKey(T + 3_600_000)];
    const files = new Map<string, string>([
      [
        fills[0]!,
        `${trade(addr(1), addr(2), { coin: "SOL", side: "B", time: T + 1000, tid: 1 }).join("\n")}\n`,
      ],
      [
        fills[1]!,
        `${trade(addr(3), addr(2), { coin: "HYPE", side: "A", time: T + 3_601_000, tid: 2 }).join("\n")}\n`,
      ],
      [
        ctxsKey(D),
        `${CTXS_HEAD}\n2025-06-10T10:01:00Z,SOL,0,1,1,1,0,1,150,1,1,1\n`,
      ],
      ...coins.list.map(
        (c) => [fundingKey(c.name, D), "[]"] as [string, string],
      ),
    ]);
    const { store } = makeStore(files, false);
    const list = manifestList(
      readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
    );
    const range: Range = {
      name: "TEST",
      partial: null,
      fill: fills,
      days: [D],
      fundingStarts: [D],
      end: DATA_END,
      grid: { start: D, minutes: 1440 },
      months: ["2025-06"],
    };
    return { store, list, range };
  }
  const run = (
    w: ReturnType<typeof world>,
    root: string,
    log: (event: string, fields: object) => void = () => {},
  ) =>
    extract({
      store: w.store,
      root,
      list: w.list,
      listName: "manifest.jsonl",
      listSha256: "3".repeat(64),
      range: w.range,
      workers: 0,
      code: "4".repeat(64),
      wavehFrozen: "5".repeat(64),
      forty: [...fortyOf(coins)],
      small: coins.list.map((c) => c.name),
      pace: () => Promise.resolve(),
      log,
    });

  it("writes the parts and the store, its manifest naming the inputs, the code and the peaks", async () => {
    const w = world();
    const root = tmp("root");
    const events: [string, object][] = [];
    const m = await run(w, root, (event, fields) =>
      events.push([event, fields]),
    );
    // The pass's end names the scan's counters.
    expect(events.find(([e]) => e === "pass done")?.[1]).toMatchObject({
      files: 2,
      counters: { refused: 0, misread: 0, slowLines: 0, slowRecords: 0 },
    });
    const s = openStore(path.join(root, "store"));
    expect(s.manifest).toEqual(m);
    expect(m).toMatchObject({
      range: "TEST",
      partial: null,
      inputs: { fill: 2, ctxs: 1, funding: 38 },
      code: { fingerprint: "4".repeat(64), wavehFrozen: "5".repeat(64) },
    });
    expect(Object.keys(m.seconds).sort()).toEqual([
      "contexts",
      "funding",
      "merge",
      "pass",
    ]);
    expect(m.peaks).toHaveProperty("main.rss");
    expect(s.partition("tape", "SOL", "2025-06").rows).toBe(1);
    expect(s.partition("tape", "HYPE", "2025-06").rows).toBe(1);
    expect(s.column(s.partition("minute", "SOL", "2025-06"), "mark")[600]).toBe(
      150,
    );
    expect(s.files().map((f) => f.key)).toEqual(w.range.fill);
  });

  it("refuses a sealed root or store before it writes or reads anything", async () => {
    const w = world();
    const at = tmp("sealed");
    const root = path.join(at, "ANALYZER", "FRESH");
    await expect(run(w, root)).rejects.toThrow(SealedError);
    expect(existsSync(root)).toBe(false);
    const fine = path.join(at, "ANALYZER", "WAVE-H");
    await expect(
      run({ ...w, store: path.join(w.store, "FRESH", "store") }, fine),
    ).rejects.toThrow(SealedError);
    expect(existsSync(fine)).toBe(false);
  });

  it("stops before reading anything when the list lacks a file the range needs", async () => {
    const w = world();
    const list = new Map(w.list);
    list.delete(fundingKey("SOL", D));
    await expect(run({ ...w, list }, tmp("root"))).rejects.toThrow(
      `1 files of TEST are not in the list, the first ${fundingKey("SOL", D)}`,
    );
  });
});

/** The repository files a compiled module's relative imports reach, itself included (as test/waveh-freeze.test.ts walks them). */
function closureOf(start: string): Set<string> {
  const seen = new Set<string>();
  const todo = [start];
  while (todo.length > 0) {
    const rel = todo.pop()!;
    if (seen.has(rel)) continue;
    seen.add(rel);
    const text = readFileSync(path.join(PACKAGE_ROOT, rel), "utf8");
    for (const m of text.matchAll(
      /(?:import|export)\s[^;]*?from\s*"(\.{1,2}\/[^"]+)"|import\s*\(\s*"(\.{1,2}\/[^"]+)"\s*\)/g,
    ))
      todo.push(path.posix.join(path.posix.dirname(rel), m[1] ?? m[2]!));
  }
  return seen;
}

describe("the built program", () => {
  const program = path.join(PACKAGE_ROOT, "dist", "polish.js");
  it("is reached by none of the three frozen programs' imports", () => {
    for (const entry of ["dist/paper.js", "dist/market1.js", "dist/waveh.js"]) {
      const reached = [...closureOf(entry)];
      expect(reached.length, entry).toBeGreaterThan(5);
      expect(
        reached.filter((f) => f.includes("polish")),
        entry,
      ).toEqual([]);
    }
    expect([...closureOf("dist/polish.js")]).toContain("dist/polish/pass.js");
  });
  const runIt = (args: string[], env: Record<string, string>) =>
    spawnSync(process.execPath, [program, ...args], {
      env: {
        ...process.env,
        WAVEH_STORE: "",
        ANALYZER_ROOT: "",
        WAVEH_ROOT: "",
        ...env,
      },
      encoding: "utf8",
      timeout: 60_000,
    });
  it("refuses an unknown command, an option it does not know, and settings that are not WAVE-H's store (exit 2)", () => {
    const ok = {
      WAVEH_STORE: "F:\\x\\WAVE-H\\store",
      ANALYZER_ROOT: tmp("root"),
    };
    for (const [args, env, why] of [
      [["look"], ok, 'the command "look"'],
      [["extract", "--workers", "40"], ok, 'the option "--workers 40"'],
      [["extract", "--day", "2026-06-01"], ok, "is not a day of WAVE-H"],
      [["gates"], ok, "WAVEH_ROOT"],
      [["explore", "--day", "2025-10-10"], ok, 'the option "--day 2025-10-10"'],
      [
        ["gates", "--workers", "2"],
        { ...ok, WAVEH_ROOT: tmp("waveh") },
        'the option "--workers 2"',
      ],
      [
        ["extract"],
        { ...ok, WAVEH_STORE: "F:\\x\\FRESH\\store" },
        "is not WAVE-H's raw store",
      ],
    ] as const) {
      const r = runIt([...args], env);
      expect(r.status, why).toBe(2);
      expect(r.stderr, why).toContain(why);
    }
  }, 60_000);

  it("refuses a sealed folder in its settings, by name or through a junction, before it opens or makes anything, its log's folder too (exit 5)", () => {
    const at = tmp("sealed");
    const fresh = path.join(at, "FRESH", "store");
    mkdirSync(fresh, { recursive: true });
    mkdirSync(path.join(at, "WAVE-H"));
    const junction = path.join(at, "WAVE-H", "store");
    symlinkSync(fresh, junction, "junction");
    try {
      for (const env of [
        {
          WAVEH_STORE: "F:\\x\\WAVE-H\\store",
          ANALYZER_ROOT: path.join(at, "ANALYZER", "FRESH"),
        },
        {
          WAVEH_STORE: junction,
          ANALYZER_ROOT: path.join(at, "ANALYZER", "WAVE-H"),
        },
      ]) {
        const r = runIt(["explore"], env);
        expect(r.status, r.stderr).toBe(5);
        expect(r.stderr).toContain("FRESH is sealed");
      }
      expect(existsSync(path.join(at, "ANALYZER"))).toBe(false);
    } finally {
      // The junction alone, never what it points at.
      rmdirSync(junction);
    }
  }, 60_000);
});
