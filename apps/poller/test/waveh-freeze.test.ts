/**
 * WAVE-H's coupling to the frozen programs (R4): the compiled imports of
 * `dist/waveh.js` reach exactly the gate's closure and the shared files; each
 * closure file is in MARKET-1's or the paper experiment's freeze and equals
 * it; and once a WAVE-H list exists, its lines for their files carry their
 * hashes, so a MARKET-1 or paper fix fails here, in the session that makes
 * it. Run in `pnpm verify`'s order: the build first.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterAll, describe, expect, it } from "vitest";
import { CLOSURE, PACKAGE_ROOT } from "../src/waveh/gate.js";
import { fillKeys } from "../src/waveh/keys.js";

const SHARED = ["dist/log.js", "dist/schedule.js"];
const read = (rel: string) => readFileSync(path.join(PACKAGE_ROOT, rel));
const listOf = (rel: string) => {
  const want = new Map<string, string>();
  for (const line of read(rel).toString("utf8").split("\n")) {
    const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
    if (m) want.set(m[2]!, m[1]!);
  }
  return want;
};
const frozen = ["market1/FROZEN.sha256", "experiment/FROZEN.sha256"].map(
  (f) => [f, listOf(f)] as const,
);

/** The repository files a compiled module's relative imports reach, itself included. */
function closureOf(start: string): Set<string> {
  const seen = new Set<string>();
  const todo = [start];
  while (todo.length > 0) {
    const rel = todo.pop()!;
    if (seen.has(rel)) continue;
    seen.add(rel);
    const text = read(rel).toString("utf8");
    for (const m of text.matchAll(
      /(?:import|export)\s[^;]*?from\s*"(\.{1,2}\/[^"]+)"|import\s*\(\s*"(\.{1,2}\/[^"]+)"\s*\)/g,
    )) {
      const spec = m[1] ?? m[2]!;
      todo.push(path.posix.join(path.posix.dirname(rel), spec));
    }
  }
  return seen;
}

describe("WAVE-H's closure (R4)", () => {
  it("reaches exactly the gate's closure, the shared files and its own", () => {
    const reached = [...closureOf("dist/waveh.js")].sort();
    const own = reached.filter(
      (f) => f === "dist/waveh.js" || f.startsWith("dist/waveh/"),
    );
    expect(own.length).toBeGreaterThan(10);
    expect(reached.filter((f) => !own.includes(f))).toEqual(
      [...CLOSURE, ...SHARED].sort(),
    );
  });

  it("holds each closure file in MARKET-1's or the paper experiment's freeze, equal to it", () => {
    for (const f of CLOSURE) {
      const got = createHash("sha256").update(read(f)).digest("hex");
      const naming = frozen.filter(([, list]) => list.has(f));
      expect(naming.length, f).toBeGreaterThan(0);
      for (const [name, list] of naming)
        expect(list.get(f), `${f} in ${name}`).toBe(got);
    }
  });

  for (const name of ["waveh/FROZEN.sha256", "waveh/FROZEN.draft.sha256"])
    it.runIf(existsSync(path.join(PACKAGE_ROOT, name)))(
      `${name}: its lines of MARKET-1's and the paper experiment's files carry their freezes' hashes`,
      () => {
        const mine = listOf(name);
        for (const f of CLOSURE) expect(mine.has(f), f).toBe(true);
        for (const [f, hash] of mine)
          for (const [other, list] of frozen)
            if (list.has(f)) expect(hash, `${f} in ${other}`).toBe(list.get(f));
      },
    );
});

type Line = { key: string; bytes: number; sha256: string };
const freezeTool = createRequire(import.meta.url)(
  "../../../tools/waveh-freeze.cjs",
) as {
  DATA_COUNTS: Record<string, number>;
  checkCounts: (lines: Line[]) => void;
  finalRefusal: (
    status: string,
    present: (file: string) => boolean,
  ) => string | null;
  manifestLines: (text: string) => Line[];
  dataList: (lines: Line[]) => string;
  shortFiles: (
    lines: Line[],
  ) => { key: string; bytes: number; median: number }[];
};

describe("the store's list and R3 (i)'s short files (the freeze tool's --data)", () => {
  const h = (n: number) => n.toString(16).padStart(64, "0");
  const line = (key: string, bytes: number, n = 1) =>
    JSON.stringify({
      key,
      bytes,
      etag: "e",
      md5: "m",
      sha256: h(n),
      fetchedAt: "t",
    });

  it("reads the manifest whole, refusing a torn or foreign line, and lists every file by key", () => {
    const text = `${line("b/1.lz4", 5, 2)}\n${line("a/1.lz4", 7, 3)}\n`;
    const lines = freezeTool.manifestLines(text);
    expect(lines).toEqual([
      { key: "b/1.lz4", bytes: 5, sha256: h(2) },
      { key: "a/1.lz4", bytes: 7, sha256: h(3) },
    ]);
    expect(freezeTool.dataList(lines)).toBe(
      `${h(3)} *a/1.lz4\n${h(2)} *b/1.lz4\n`,
    );
    expect(() =>
      freezeTool.manifestLines(`${line("a", 1)}\n{"key":"b"`),
    ).toThrow("torn");
    expect(() => freezeTool.manifestLines('{"key":"b","bytes":1}\n')).toThrow(
      "line 1",
    );
    expect(() =>
      freezeTool.manifestLines(
        `${line("a", 1)}\n${line("b", 1)}\n${line("a", 2)}\n`,
      ),
    ).toThrow("line 3 repeats a");
  });

  it("writes nothing unless the files are, by prefix, the ones the program reads", () => {
    const fills = fillKeys(0, Infinity);
    expect(freezeTool.DATA_COUNTS).toEqual({
      "node_fills/hourly/": fills.filter((k) => k.startsWith("node_fills/"))
        .length,
      "node_fills_by_block/hourly/": fills.filter((k) =>
        k.startsWith("node_fills_by_block/"),
      ).length,
      "asset_ctxs/": 370,
      "info/fundingHistory/": 38 * 20,
    });
    const all: Line[] = Object.entries(freezeTool.DATA_COUNTS).flatMap(
      ([prefix, n]) =>
        Array.from({ length: n }, (_, i) => ({
          key: `${prefix}${i}`,
          bytes: 1,
          sha256: h(i),
        })),
    );
    expect(all).toHaveLength(9_975);
    expect(() => freezeTool.checkCounts(all)).not.toThrow();
    expect(() => freezeTool.checkCounts(all.slice(1))).toThrow(
      "1506 node_fills/hourly/ files, not 1507",
    );
    expect(() =>
      freezeTool.checkCounts([
        ...all,
        { key: "info/fundingHistory/x", bytes: 1, sha256: h(1) },
      ]),
    ).toThrow("761 info/fundingHistory/ files, not 760");
    expect(() =>
      freezeTool.checkCounts([
        ...all,
        { key: "market_data/x", bytes: 1, sha256: h(1) },
      ]),
    ).toThrow("market_data/x, under none of the prefixes");
  });

  it("lets --final write only from a clean tree holding sizing.json and data.sha256", () => {
    const all = () => true;
    expect(freezeTool.finalRefusal("", all)).toBeNull();
    expect(freezeTool.finalRefusal(" M apps/poller/waveh/rules.md", all)).toBe(
      "the tree is not clean: commit first, then freeze",
    );
    for (const missing of ["waveh/sizing.json", "waveh/data.sha256"])
      expect(freezeTool.finalRefusal("", (f) => f !== missing)).toBe(
        `${missing} is missing: nothing written`,
      );
  });

  it("names a fill file under 30% of its 24 nearest neighbours' median bytes, in each format", () => {
    const lines: Line[] = [];
    for (let i = 0; i < 30; i++) {
      const day = i < 24 ? "20250601" : "20250602";
      const key = `node_fills/hourly/${day}/${i % 24}.lz4`;
      lines.push({
        key,
        bytes: i === 12 ? 29 : i === 27 ? 30 : 100,
        sha256: h(i),
      });
    }
    lines.push({
      key: "node_fills_by_block/hourly/20250801/0.lz4",
      bytes: 10,
      sha256: h(99),
    });
    lines.push({
      key: "node_fills_by_block/hourly/20250801/1.lz4",
      bytes: 1_000,
      sha256: h(98),
    });
    lines.push({ key: "asset_ctxs/20250801.csv.lz4", bytes: 1, sha256: h(97) });
    expect(freezeTool.shortFiles(lines)).toEqual([
      { key: "node_fills/hourly/20250601/12.lz4", bytes: 29, median: 100 },
      {
        key: "node_fills_by_block/hourly/20250801/0.lz4",
        bytes: 10,
        median: 1_000,
      },
    ]);
  });
});

describe("the freeze tool's --data, run whole from a copy in a made-up tree", () => {
  // The tool writes beside its own file (`../apps/poller/waveh/`), so a copy
  // writes inside the made-up tree, never the repository's data.sha256.
  const made: string[] = [];
  afterAll(() => {
    for (const d of made) rmSync(d, { recursive: true, force: true });
  });
  const h = (n: number) => n.toString(16).padStart(64, "0");
  const manifest = (counts: Record<string, number>) =>
    `${Object.entries(counts)
      .flatMap(([prefix, n]) =>
        Array.from({ length: n }, (_, i) =>
          JSON.stringify({
            key: prefix.startsWith("node_fills")
              ? `${prefix}${20250101 + Math.floor(i / 24)}/${i % 24}.lz4`
              : `${prefix}${i}`,
            bytes: 1_000,
            sha256: h(i),
          }),
        ),
      )
      .join("\n")}\n`;

  it("writes nothing when a count is off, and every file's line when the counts are right", () => {
    const real = path.join(PACKAGE_ROOT, "waveh", "data.sha256");
    const before = readFileSync(real);
    const root = mkdtempSync(path.join(tmpdir(), "waveh-tool-"));
    made.push(root);
    mkdirSync(path.join(root, "tools"));
    mkdirSync(path.join(root, "apps", "poller", "waveh"), { recursive: true });
    const tool = path.join(root, "tools", "waveh-freeze.cjs");
    copyFileSync(
      path.join(PACKAGE_ROOT, "..", "..", "tools", "waveh-freeze.cjs"),
      tool,
    );
    const run = (file: string) =>
      spawnSync(process.execPath, [tool, "--data", file], {
        encoding: "utf8",
        timeout: 60_000,
      });
    const out = path.join(root, "apps", "poller", "waveh", "data.sha256");
    const wrong = path.join(root, "wrong.jsonl");
    writeFileSync(
      wrong,
      manifest({ ...freezeTool.DATA_COUNTS, "asset_ctxs/": 369 }),
    );
    const bad = run(wrong);
    expect(bad.status).toBe(1);
    expect(bad.stderr).toContain("369 asset_ctxs/ files, not 370");
    expect(existsSync(out)).toBe(false);
    const good = path.join(root, "good.jsonl");
    writeFileSync(good, manifest(freezeTool.DATA_COUNTS));
    const ok = run(good);
    expect(ok.status, ok.stderr).toBe(0);
    expect(ok.stdout).toContain("waveh/data.sha256: 9975 files");
    expect(readFileSync(out, "utf8").split("\n")).toHaveLength(9_975 + 1);
    expect(readFileSync(real).equals(before)).toBe(true);
  }, 120_000);
});
