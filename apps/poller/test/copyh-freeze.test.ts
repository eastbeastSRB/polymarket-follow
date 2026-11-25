/**
 * COPY-H's list tool (tools/copyh-freeze.cjs; rules.md C3): --data's list,
 * every file of E's and S's ranges in their order, each line its frozen
 * source list's, the sources named by SHA-256; its refusals, nothing
 * written. A test never writes the package's `copyh/data.sha256`.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RANGES } from "../src/copyh/range.js";
import { PACKAGE_ROOT, sha256 } from "../src/copyh/run.js";
import { readDataList } from "../src/waveh/store.js";

type Source = { name: string; text: string };
type RangeKeys = { name: string; fill: readonly string[] };
const tool = createRequire(import.meta.url)(
  path.join(import.meta.dirname, "..", "..", "..", "tools", "copyh-freeze.cjs"),
) as {
  dataList: (sources: Source[], ranges: RangeKeys[]) => string;
  listOf: (text: string, name: string) => Map<string, string>;
};
const hash = (n: number) => n.toString(16).padStart(64, "0");
const listText = (keys: readonly string[], from = 0) =>
  `${keys.map((k, i) => `${hash(from + i)} *${k}`).join("\n")}\n`;

describe("--data", { timeout: 60_000 }, () => {
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
