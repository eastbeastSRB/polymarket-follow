/**
 * COPY-H's list tool (tools/copyh-freeze.cjs; rules.md C3, C9): a call it
 * does not know refused; --data's list, every file of E's and S's ranges in
 * their order, each line its frozen source list's, the sources named by
 * SHA-256; its refusals, nothing written; the program reading the committed
 * list (range.ts), a file it lacks or names twice a stop; --funding's list,
 * the meta reply and every window of every coin, each held to the store's
 * list and manifest and read by the program's reader (funding.ts), and its
 * refusals. A test never writes the package's `copyh/` files.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as reader from "../src/copyh/funding.js";
import {
  RANGES,
  filesOf,
  readDataList as readCopyhList,
} from "../src/copyh/range.js";
import { PACKAGE_ROOT, StoreError, sha256 } from "../src/copyh/run.js";
import { readDataList } from "../src/waveh/store.js";

type Source = { name: string; text: string };
type RangeKeys = { name: string; fill: readonly string[] };
const TOOL = path.join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "tools",
  "copyh-freeze.cjs",
);
const tool = createRequire(import.meta.url)(TOOL) as {
  dataList: (sources: Source[], ranges: RangeKeys[]) => string;
  listOf: (text: string, name: string) => Map<string, string>;
  manifestOf: (text: string) => Map<string, { key: string; sha256: string }>;
  fundingList: (o: {
    list: Map<string, string>;
    listText: string;
    manifest: Map<string, { key: string; sha256: string }>;
    coins: { meta: { sha256: string }; coins: { name: string }[] };
    windows: { start: number; end: number }[];
    read: (key: string) => Buffer;
    reader: typeof reader;
  }) => string;
};
const hash = (n: number) => n.toString(16).padStart(64, "0");
const listText = (keys: readonly string[], from = 0) =>
  `${keys.map((k, i) => `${hash(from + i)} *${k}`).join("\n")}\n`;

describe("--data", { timeout: 60_000 }, () => {
  it("refuses a call it does not know (exit 1, its usage)", () => {
    for (const args of [["--bogus"], ["--data", "--funding"]]) {
      const r = spawnSync(process.execPath, [TOOL, ...args], {
        encoding: "utf8",
        timeout: 50_000,
      });
      expect(r.status, args.join(" ")).toBe(1);
      expect(r.stderr, args.join(" ")).toContain(
        "usage: copyh-freeze.cjs --data",
      );
    }
  });

  it("lists each range's files in its order with its source's hash, the sources named by SHA-256", () => {
    const e = { name: "E", fill: ["b", "a"] };
    const s = { name: "S", fill: ["c"] };
    const we = listText(["a", "b", "x"]);
    const fs = `# a comment\n${listText(["c"], 9)}`;
    const text = tool.dataList(
      [
        { name: "waveh/data.sha256", text: we },
        { name: "polish/fresh.sha256", text: fs },
      ],
      [e, s],
    );
    expect(text.split("\n")).toEqual([
      "# COPY-H's raw fill files (copyh/rules.md C3): written by tools/copyh-freeze.cjs --data",
      "# from the frozen lists' names and hashes alone, no data file opened:",
      `# E: 2 files from waveh/data.sha256 (${sha256(we)})`,
      `# S: 1 files from polish/fresh.sha256 (${sha256(fs)})`,
      `${hash(1)} *b`,
      `${hash(0)} *a`,
      `${hash(9)} *c`,
      "",
    ]);
    expect([...readDataList(text)]).toEqual([
      ["b", hash(1)],
      ["a", hash(0)],
      ["c", hash(9)],
    ]);
  });

  it("refuses a range file missing from its list, a file in two ranges, and a list naming a file twice", () => {
    const src = (text: string) => [
      { name: "one", text },
      { name: "two", text: listText(["c"]) },
    ];
    expect(() =>
      tool.dataList(src(listText(["a"])), [
        { name: "E", fill: ["a", "b"] },
        { name: "S", fill: ["c"] },
      ]),
    ).toThrow("1 files of E are not in one, the first b: nothing written");
    expect(() =>
      tool.dataList(src(listText(["c"])), [
        { name: "E", fill: ["c"] },
        { name: "S", fill: ["c"] },
      ]),
    ).toThrow("c is in two ranges: nothing written");
    expect(() => tool.listOf(listText(["a", "a"]), "one")).toThrow(
      "one line 2 is not a new file's line",
    );
    expect(() => tool.listOf("not a line\n", "one")).toThrow(
      "one line 1 is not a new file's line",
    );
  });

  it("gives, from the frozen lists, E's 8,845 and S's 4,102 files, each line its source's", () => {
    const read = (rel: string) =>
      readFileSync(path.join(PACKAGE_ROOT, rel), "utf8");
    const waveh = read("waveh/data.sha256");
    const fresh = read("polish/fresh.sha256");
    const text = tool.dataList(
      [
        { name: "waveh/data.sha256", text: waveh },
        { name: "polish/fresh.sha256", text: fresh },
      ],
      [RANGES.E, RANGES.S],
    );
    const list = readDataList(text);
    expect(list.size).toBe(8_845 + 4_102);
    expect([...list.keys()]).toEqual([...RANGES.E.fill, ...RANGES.S.fill]);
    const w = readDataList(waveh);
    const f = readDataList(fresh);
    for (const k of RANGES.E.fill) expect(list.get(k), k).toBe(w.get(k));
    for (const k of RANGES.S.fill) expect(list.get(k), k).toBe(f.get(k));
  });
});

describe(
  "the program reads the committed data list",
  { timeout: 60_000 },
  () => {
    it("skips its header lines and gives each range's files in order: the burn-in's 850", () => {
      const list = readCopyhList(
        readFileSync(path.join(PACKAGE_ROOT, "copyh", "data.sha256"), "utf8"),
      );
      expect(list.size).toBe(8_845 + 4_102);
      const burnin = filesOf(RANGES.burnin, list);
      expect(burnin).toHaveLength(850);
      expect(burnin[0]).toEqual({
        index: 0,
        key: RANGES.burnin.fill[0],
        sha256: list.get(RANGES.burnin.fill[0]!),
      });
      expect(filesOf(RANGES.E, list).map((f) => f.key)).toEqual(RANGES.E.fill);
      expect(() => readCopyhList("# a header\nnot a line\n")).toThrow(
        "data.sha256: line 2 is not a list line",
      );
    });

    it("stops on a range's file the data list lacks (exit 5), and on a data list naming a file twice", () => {
      const list = readCopyhList(
        readFileSync(path.join(PACKAGE_ROOT, "copyh", "data.sha256"), "utf8"),
      );
      const first = RANGES.E.fill[0]!;
      list.delete(first);
      expect(() => filesOf(RANGES.E, list)).toThrow(StoreError);
      expect(() => filesOf(RANGES.E, list)).toThrow(
        `${first}: not in copyh/data.sha256`,
      );
      expect(() => readCopyhList(`${hash(1)} *a\n${hash(2)} *a\n`)).toThrow(
        "data.sha256: a twice",
      );
    });
  },
);

describe("--funding", { timeout: 60_000 }, () => {
  const W = [
    { start: Date.UTC(2025, 5, 30), end: Date.UTC(2025, 6, 20) },
    { start: Date.UTC(2025, 6, 20), end: Date.UTC(2025, 7, 9) },
  ];
  const rows = (t: number, coin: string) =>
    Buffer.from(
      JSON.stringify([
        { coin, fundingRate: "0.00001", premium: "0.0", time: t + 887_645 },
        { coin, fundingRate: "0.00001", premium: "0.0", time: t + 3_600_017 },
      ]),
    );
  function store() {
    const files = new Map<string, Buffer>([
      ["info/meta.json", Buffer.from('{"universe":[]}')],
    ]);
    for (const coin of ["BTC", "ETH"])
      for (const w of W)
        files.set(reader.fundingKey(coin, w.start), rows(w.start, coin));
    const listText = [...files.keys()]
      .sort()
      .map((k) => `${sha256(files.get(k)!)} *${k}\n`)
      .join("");
    const manifestText = [...files]
      .map(
        ([key, b]) =>
          `${JSON.stringify({ key, bytes: b.length, sha256: sha256(b), fetchedAt: "x" })}\n`,
      )
      .join("");
    return { files, listText, manifestText };
  }
  const run = (
    st: ReturnType<typeof store>,
    over: Partial<Parameters<typeof tool.fundingList>[0]> = {},
  ) =>
    tool.fundingList({
      list: tool.listOf(st.listText, "funding.sha256"),
      listText: st.listText,
      manifest: tool.manifestOf(`${st.manifestText}{"key":"torn`),
      coins: {
        meta: { sha256: sha256(st.files.get("info/meta.json")!) },
        coins: [{ name: "BTC" }, { name: "ETH" }],
      },
      windows: W,
      read: (key) => st.files.get(key)!,
      reader,
      ...over,
    });

  it("lists the meta reply and every window of every coin, sorted, each read by the program's reader", () => {
    const st = store();
    const text = run(st);
    const lines = text.split("\n");
    expect(lines.slice(0, 3)).toEqual([
      "# COPY-H's funding (copyh/rules.md C9): written by tools/copyh-freeze.cjs --data --funding",
      `# from the funding store's funding.sha256 (${sha256(st.listText)}), each line held to its manifest.jsonl,`,
      "# every window of the 2 coins of coins.json read by dist/copyh/funding.js:",
    ]);
    expect(lines.slice(3, -1)).toEqual(st.listText.split("\n").slice(0, -1));
  });

  it("refuses a window missing, a line differing from the manifest, bytes differing, a reply the reader refuses, and coins of another meta", () => {
    const st = store();
    const missing = store();
    missing.listText = missing.listText
      .split("\n")
      .filter((l) => !l.includes("ETH"))
      .join("\n");
    expect(() => run(missing)).toThrow(
      "2 files are not in the funding store's list, the first info/fundingHistory/ETH/",
    );
    const other = store();
    other.manifestText = other.manifestText.replace(
      sha256(other.files.get("info/meta.json")!),
      "0".repeat(64),
    );
    expect(() => run(other)).toThrow(
      "info/meta.json: its line differs from the store's manifest",
    );
    const k = reader.fundingKey("BTC", W[1]!.start);
    expect(() =>
      run(st, {
        read: (key) => (key === k ? Buffer.from("[]") : st.files.get(key)!),
      }),
    ).toThrow(`${k}: its bytes differ from its line`);
    const twice = store();
    const bad = Buffer.from(
      JSON.stringify([
        { coin: "BTC", fundingRate: "0.0", premium: "0.0", time: W[1]!.start },
        {
          coin: "BTC",
          fundingRate: "0.0",
          premium: "0.0",
          time: W[1]!.start + 1_000,
        },
      ]),
    );
    twice.files.set(k, bad);
    twice.listText = twice.listText.replace(
      sha256(rows(W[1]!.start, "BTC")),
      sha256(bad),
    );
    twice.manifestText = twice.manifestText.replace(
      sha256(rows(W[1]!.start, "BTC")),
      sha256(bad),
    );
    expect(() => run(twice)).toThrow(`${k}: BTC's hour`);
    expect(() =>
      run(st, {
        coins: { meta: { sha256: "1".repeat(64) }, coins: [{ name: "BTC" }] },
      }),
    ).toThrow("coins.json was made from another meta reply");
    // A listed window the store's manifest does not hold at all.
    const manifest = tool.manifestOf(
      st.manifestText
        .split("\n")
        .filter((l) => !l.includes(k))
        .join("\n"),
    );
    expect(() => run(st, { manifest })).toThrow(
      `${k}: its line differs from the store's manifest`,
    );
    expect(() => tool.manifestOf('{"key":"a"}\n{"key":"a"}\n')).toThrow(
      "manifest.jsonl: a twice",
    );
  });
});
