/**
 * The exam's freeze tool (tools/polish-freeze.cjs; polish/rules.md P0, P2;
 * THE PLAN D7, D12, T3): --data's checks, exactly FRESH's range's files each
 * once, and F7's thin days against WAVE-H's median; fresh.sha256's form;
 * --final's refusals. --data runs whole only on its refusals, so a test never
 * writes the package's fresh.sha256. Run in `pnpm verify`'s order: the tool
 * reads the build.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { THIN_CTXS_DAYS } from "../src/polish/exam/design.js";
import { FRESH_LIST_FILE } from "../src/polish/exam/fresh.js";
import { FRESH_RANGE } from "../src/polish/range.js";
import { loadCoins } from "../src/waveh/coins.js";
import { ctxsKey, fundingKey } from "../src/waveh/keys.js";
import { readDataList } from "../src/waveh/store.js";
import { cleanScratch, scratch, sha } from "./waveh-world.js";

afterAll(cleanScratch, 120_000);

type Line = { key: string; bytes: number; sha256: string };
const TOOL = path.join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "tools",
  "polish-freeze.cjs",
);
type Head = {
  tag: number | null;
  written: string;
  commit: string;
  dirty: boolean;
  versions: Record<string, string>;
  lock: string;
  absent: string[];
};
const tool = createRequire(import.meta.url)(TOOL) as {
  LOOK2_ALLOWED: string[];
  headOf: (o: Head) => string[];
  tagOf: (argv: readonly string[]) => number;
  closureProblems: (
    closure: readonly string[],
    lists: [string, Map<string, string>][],
    hashOf: (f: string) => string,
  ) => string[];
  outsideLook2: (
    before: Map<string, string>,
    after: Map<string, string>,
  ) => string[];
  checkKeys: (lines: readonly Line[], keys: readonly string[]) => void;
  finalRefusal: (
    status: string,
    present: (f: string) => boolean,
  ) => string | null;
  freshList: (lines: readonly Line[]) => string;
  thinDays: (
    fresh: readonly Line[],
    waveh: readonly Line[],
  ) => {
    reference: number;
    median: number;
    days: { day: string; bytes: number }[];
  };
};
const line = (key: string, bytes = 1_000, n = 0): Line => ({
  key,
  bytes,
  sha256: n.toString(16).padStart(64, "0"),
});
const day = (iso: string) => ctxsKey(Date.parse(`${iso}T00:00:00Z`));
/** FRESH's range's keys, as the tool builds them. */
const KEYS = [
  ...FRESH_RANGE.fill,
  ...FRESH_RANGE.days.map(ctxsKey),
  ...loadCoins().list.flatMap((c) =>
    FRESH_RANGE.fundingStarts.map((s) => fundingKey(c.name, s)),
  ),
];

describe("the exam's freeze tool: --data's checks", () => {
  it("holds a manifest to FRESH's range's keys exactly, naming what is missing and what is not the range's", () => {
    expect(KEYS).toHaveLength(4_614);
    const all = KEYS.map((k, i) => line(k, 1_000, i));
    expect(() => tool.checkKeys(all, KEYS)).not.toThrow();
    expect(() => tool.checkKeys(all.slice(1), KEYS)).toThrow(
      `the manifest is not FRESH's range: 1 of its files missing (the first ${KEYS[0]}), 0 files not in it (the first none): nothing written`,
    );
    const extra = day("2026-07-08");
    expect(() => tool.checkKeys([...all, line(extra)], KEYS)).toThrow(
      `the manifest is not FRESH's range: 0 of its files missing (the first none), 1 files not in it (the first ${extra}): nothing written`,
    );
  });

  it("names F7's thin days: FRESH's asset_ctxs days under half the median bytes of WAVE-H's, in day order", () => {
    const waveh = [
      line(day("2025-06-01"), 900),
      line(day("2025-06-02"), 1_000),
      line(day("2025-06-03"), 1_200),
      line("node_fills/hourly/20250601/0.lz4", 1),
    ];
    const fresh = [
      line(day("2026-10-02"), 499),
      line(day("2026-09-30"), 1),
      line(day("2026-10-01"), 500),
      line("node_fills_by_block/hourly/20261001/0.lz4", 1),
    ];
    expect(tool.thinDays(fresh, waveh)).toEqual({
      reference: 3,
      median: 1_000,
      days: [
        { day: "2026-09-30", bytes: 1 },
        { day: "2026-10-02", bytes: 499 },
      ],
    });
    // An even reference's median is its two middle days' mean.
    expect(
      tool.thinDays(fresh, [...waveh, line(day("2025-06-04"), 1_400)]).median,
    ).toBe(1_100);
    expect(() => tool.thinDays(fresh, waveh.slice(3))).toThrow(
      "WAVE-H's manifest holds no asset_ctxs day",
    );
  });

  it("holds design.ts's thin days as the tool printed them from the two manifests on 2026-11-20: 59 of FRESH's asset_ctxs days, in order, each once", () => {
    expect(THIN_CTXS_DAYS).toHaveLength(59);
    expect([...THIN_CTXS_DAYS].sort()).toEqual(THIN_CTXS_DAYS);
    expect(new Set(THIN_CTXS_DAYS).size).toBe(59);
    const days = new Set(
      FRESH_RANGE.days.map((t) => new Date(t).toISOString().slice(0, 10)),
    );
    for (const d of THIN_CTXS_DAYS) expect(days.has(d), d).toBe(true);
    // The deciding days' thin ones: four of segment 1, and every day of segment 2.
    expect(
      THIN_CTXS_DAYS.filter((d) => d < "2026-08-31" || d >= "2026-11-07"),
    ).toEqual([
      "2026-05-30",
      "2026-08-08",
      "2026-08-27",
      "2026-08-30",
      "2026-11-07",
      "2026-11-08",
      "2026-11-09",
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
    ]);
  });

  it("writes fresh.sha256 in data.sha256's form, by key", () => {
    const text = tool.freshList([line("b", 1, 2), line("a", 1, 1)]);
    expect(text).toBe(
      `${"1".padStart(64, "0")} *a\n${"2".padStart(64, "0")} *b\n`,
    );
    expect([...readDataList(text)]).toEqual([
      ["a", "1".padStart(64, "0")],
      ["b", "2".padStart(64, "0")],
    ]);
  });

  it("lets --final write only from a clean tree holding rules.md, fresh.sha256 and fresh-unpaired.json", () => {
    const named = [
      "polish/rules.md",
      "polish/fresh.sha256",
      "polish/fresh-unpaired.json",
    ];
    expect(tool.finalRefusal(" M x", () => true)).toBe(
      "the tree is not clean: commit first, then freeze",
    );
    for (const f of named)
      expect(tool.finalRefusal("", (g) => g !== f)).toBe(
        `${f} is missing: nothing written`,
      );
    expect(tool.finalRefusal("", () => true)).toBeNull();
  });
});

describe("the exam's freeze tool: the lists' heads, the closure, the tag and look 2's freeze", () => {
  it("writes the tag line in a final list alone, its number from --tag (1 when not given)", () => {
    const o = {
      written: "2026-11-20T00:00:00.000Z",
      commit: "c".repeat(40),
      dirty: false,
      versions: {
        node: "v24",
        typescript: "6",
        zod: "4",
        pino: "10",
        lz4js: "0.2.0",
      },
      lock: "l".repeat(64),
      absent: [],
    };
    const draft = tool.headOf({ ...o, tag: null });
    expect(draft[0]).toBe(
      "# DRAFT, not a freeze: the exam's files of what runs (polish/rules.md P0)",
    );
    expect(draft.some((l) => l.startsWith("# tag"))).toBe(false);
    const final = tool.headOf({ ...o, tag: 2, dirty: true, absent: ["x"] });
    expect(final[0]).toBe(
      "# FROZEN: the exam's files of what runs (polish/rules.md P0)",
    );
    expect(final[1]).toContain("(the tree was not clean)");
    expect(final.at(-2)).toBe("# not yet written, required by name: x");
    expect(final.at(-1)).toBe("# tag polish-freeze-2");
    expect(tool.tagOf(["--final"])).toBe(1);
    expect(tool.tagOf(["--final", "--tag", "3"])).toBe(3);
    for (const bad of [["--tag"], ["--tag", "0"], ["--tag", "2b"]])
      expect(() => tool.tagOf(bad)).toThrow("--tag needs a number from 1");
  });

  it("holds each closure file to the freezes naming it: in one of them, and equal to every one", () => {
    const lists: [string, Map<string, string>][] = [
      [
        "waveh/FROZEN.sha256",
        new Map([
          ["a", "1"],
          ["b", "2"],
        ]),
      ],
      [
        "market1/FROZEN.sha256",
        new Map([
          ["b", "2"],
          ["c", "3"],
        ]),
      ],
    ];
    const hashes: Record<string, string> = { a: "1", b: "2", c: "3", d: "4" };
    const hashOf = (f: string) => hashes[f]!;
    expect(tool.closureProblems(["a", "b", "c"], lists, hashOf)).toEqual([]);
    expect(tool.closureProblems(["d"], lists, hashOf)).toEqual([
      "d is in none of the three freezes",
    ]);
    expect(tool.closureProblems(["b"], lists, () => "9")).toEqual([
      "b differs from waveh/FROZEN.sha256",
      "b differs from market1/FROZEN.sha256",
    ]);
  });

  it("lets look 2's list differ from look 1's only in the allowed files, changed or added, never gone", () => {
    const before = new Map([
      ["dist/polish/seal.js", "1"],
      ["dist/polish/exam/verdict.js", "2"],
      ["polish/rules.md", "3"],
    ]);
    const same = new Map(before);
    expect(tool.outsideLook2(before, same)).toEqual([]);
    const allowed = new Map([
      ...before,
      ["dist/polish/seal.js", "9"],
      ["polish/fresh2.sha256", "8"],
      ["polish/look1.sha256", "7"],
    ]);
    expect(tool.outsideLook2(before, allowed)).toEqual([]);
    const other = new Map([
      ...before,
      ["dist/polish/exam/verdict.js", "9"],
      ["polish/rules.md", "9"],
      ["polish/new.json", "6"],
    ]);
    expect(tool.outsideLook2(before, other)).toEqual([
      "changed: dist/polish/exam/verdict.js",
      "changed: polish/rules.md",
      "added: polish/new.json",
    ]);
    const gone = new Map(before);
    gone.delete("dist/polish/seal.js");
    expect(tool.outsideLook2(before, gone)).toEqual([
      "gone: dist/polish/seal.js",
    ]);
  });
});

describe("the exam's freeze tool: --data run whole, refusing", () => {
  const tmp = (name: string) => {
    const d = mkdtempSync(path.join(tmpdir(), `polish-${name}-`));
    scratch.push(d);
    return d;
  };
  const manifest = (lines: readonly Line[]) => {
    const f = path.join(tmp("manifest"), "manifest.jsonl");
    writeFileSync(f, lines.map((l) => `${JSON.stringify(l)}\n`).join(""));
    return f;
  };
  const run = (fresh: string, waveh: string) => {
    // By SHA-256: a diff of two 300 KB buffers would hang the reporter.
    const before = existsSync(FRESH_LIST_FILE)
      ? sha(readFileSync(FRESH_LIST_FILE))
      : null;
    const r = spawnSync(process.execPath, [TOOL, "--data", fresh, waveh], {
      encoding: "utf8",
      timeout: 60_000,
    });
    const after = existsSync(FRESH_LIST_FILE)
      ? sha(readFileSync(FRESH_LIST_FILE))
      : null;
    expect(after).toBe(before);
    return r;
  };
  const waveh = manifest([line(day("2025-06-01"), 1_000)]);

  it("writes nothing when the manifest is not FRESH's range", () => {
    const r = run(manifest(KEYS.slice(1).map((k) => line(k))), waveh);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain(
      `the manifest is not FRESH's range: 1 of its files missing (the first ${KEYS[0]})`,
    );
  }, 60_000);

  it("writes nothing when the thin days are not design.ts's THIN_CTXS_DAYS, printing them", () => {
    // Every asset_ctxs day thin: never the design's list.
    const r = run(
      manifest(
        KEYS.map((k) => line(k, k.startsWith("asset_ctxs/") ? 1 : 1_000)),
      ),
      waveh,
    );
    expect(r.status).toBe(1);
    expect(r.stdout).toContain(
      "F7's thin asset_ctxs days, under half the median 1000 B of WAVE-H's 1:",
    );
    expect(r.stdout).toContain("  2026-05-29 1 B\n");
    expect(r.stderr).toContain(
      `design.ts's THIN_CTXS_DAYS is ${JSON.stringify(THIN_CTXS_DAYS)}, not these 170 days: nothing written`,
    );
  }, 60_000);
});
