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
import { cleanScratch, scratch } from "./waveh-world.js";

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
const tool = createRequire(import.meta.url)(TOOL) as {
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
    const before = existsSync(FRESH_LIST_FILE)
      ? readFileSync(FRESH_LIST_FILE)
      : null;
    const r = spawnSync(process.execPath, [TOOL, "--data", fresh, waveh], {
      encoding: "utf8",
      timeout: 60_000,
    });
    const after = existsSync(FRESH_LIST_FILE)
      ? readFileSync(FRESH_LIST_FILE)
      : null;
    expect(after).toEqual(before);
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
