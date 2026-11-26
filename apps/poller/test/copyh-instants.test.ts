/**
 * COPY-H's instants and ranges (src/copyh/design.ts, range.ts; rules.md
 * C1, C3): every instant; E's files are exactly WAVE-H's frozen list's fill
 * files, S's FRESH's, the burn-in's 850 lie before M₀; the switch hour holds
 * both formats, `node_fills` first; each range's sample days; the months a
 * window touches.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ARCHIVE_START,
  END_E,
  END_F2,
  END_S,
  M0,
  SAMPLE_DAYS,
  SWITCH_HOUR,
} from "../src/copyh/design.js";
import {
  RANGES,
  RANGE_NAMES,
  hourKeys,
  monthsOf,
  sampleDaysOf,
} from "../src/copyh/range.js";
import { dayOfKey } from "../src/copyh/reread.js";
import { PACKAGE_ROOT } from "../src/copyh/run.js";
import { FRESH_RANGE } from "../src/polish/range.js";
import { FRESH_END } from "../src/polish/seal.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { DATA_END, SIZING_START } from "../src/waveh/instants.js";
import { fillKeys, keyDate } from "../src/waveh/keys.js";
import { readDataList } from "../src/waveh/store.js";

const fillKeysOf = (file: string) =>
  [...readDataList(readFileSync(path.join(PACKAGE_ROOT, file), "utf8")).keys()]
    .filter((k) => k.startsWith("node_fills"))
    .sort();

describe("the instants", { timeout: 60_000 }, () => {
  it("are the archive's, WAVE-H's, FRESH's and FRESH-2's", () => {
    for (const [t, iso] of [
      [ARCHIVE_START, "2025-05-25T14:00:00.000Z"],
      [M0, "2025-06-30T00:00:00.000Z"],
      [END_E, "2026-05-29T02:00:00.000Z"],
      [END_S, "2026-11-16T00:00:00.000Z"],
      [END_F2, "2027-05-17T00:00:00.000Z"],
      [SWITCH_HOUR, "2025-07-27T08:00:00.000Z"],
    ] as const)
      expect(new Date(t).toISOString()).toBe(iso);
    expect(ARCHIVE_START).toBe(SIZING_START);
    expect(END_E).toBe(DATA_END + HOUR_MS);
    expect(END_S).toBe(FRESH_END);
    expect(END_F2 - END_S).toBe(26 * 7 * DAY_MS);
  });

  it("put M₀ on the first Monday with 30 days of the archive before it", () => {
    expect(new Date(M0).getUTCDay()).toBe(1);
    expect(M0 % DAY_MS).toBe(0);
    expect(M0 - 30 * DAY_MS).toBeGreaterThanOrEqual(ARCHIVE_START);
    expect(M0 - 7 * DAY_MS - 30 * DAY_MS).toBeLessThan(ARCHIVE_START);
  });
});

describe("the ranges", { timeout: 60_000 }, () => {
  it("hold E as WAVE-H's 8,845 fill files, in WAVE-H's own order, as its frozen list names them", () => {
    const e = RANGES.E;
    expect(e.fill).toEqual(fillKeys(SIZING_START, DATA_END + HOUR_MS));
    expect(e.fill).toHaveLength(8_845);
    expect([...e.fill].sort()).toEqual(fillKeysOf("waveh/data.sha256"));
    expect([e.start, e.end]).toEqual([ARCHIVE_START, END_E]);
    expect(e.months).toHaveLength(13);
    expect([e.months[0], e.months.at(-1)]).toEqual(["2025-05", "2026-05"]);
  });

  it("hold S as FRESH's 4,102 fill files, as the analyzer and FRESH's frozen list name them", () => {
    const s = RANGES.S;
    expect(s.fill).toEqual(FRESH_RANGE.fill);
    expect(s.fill).toHaveLength(4_102);
    expect([...s.fill].sort()).toEqual(fillKeysOf("polish/fresh.sha256"));
    expect(keyDate(s.fill[0]!)).toBe(END_E);
    expect([s.start, s.end]).toEqual([END_E, END_S]);
    expect(s.months).toEqual([
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
    ]);
  });

  it("hold the burn-in as WAVE-H's first 850 files, every one dated before M₀", () => {
    const b = RANGES.burnin;
    expect(b.fill).toHaveLength(850);
    expect(b.fill).toEqual(RANGES.E.fill.slice(0, 850));
    expect(b.fill[0]).toBe("node_fills/hourly/20250525/14.lz4");
    expect(b.fill.at(-1)).toBe("node_fills/hourly/20250629/23.lz4");
    for (const k of b.fill) expect(keyDate(k)!, k).toBeLessThan(M0);
    expect(keyDate(RANGES.E.fill[850]!)).toBe(M0);
    expect([b.start, b.end, b.months]).toEqual([
      ARCHIVE_START,
      M0,
      ["2025-05", "2025-06"],
    ]);
  });

  it("read both formats in the switch hour, node_fills first, and one format either side", () => {
    expect(hourKeys(SWITCH_HOUR - HOUR_MS, SWITCH_HOUR + 2 * HOUR_MS)).toEqual([
      "node_fills/hourly/20250727/7.lz4",
      "node_fills/hourly/20250727/8.lz4",
      "node_fills_by_block/hourly/20250727/8.lz4",
      "node_fills_by_block/hourly/20250727/9.lz4",
    ]);
    expect(hourKeys(SWITCH_HOUR, SWITCH_HOUR)).toEqual([]);
  });

  it("give each range its sample days: S's for S, E's for E and the burn-in, which re-reads those its files hold", () => {
    expect(sampleDaysOf("S")).toEqual(SAMPLE_DAYS.S);
    expect(sampleDaysOf("E")).toEqual(SAMPLE_DAYS.E);
    expect(sampleDaysOf("burnin")).toEqual(SAMPLE_DAYS.E);
    const reread = (r: (typeof RANGE_NAMES)[number]) =>
      sampleDaysOf(r).filter((d) =>
        RANGES[r].fill.some((k) => dayOfKey(k) === d),
      );
    expect(reread("S")).toEqual(SAMPLE_DAYS.S);
    expect(reread("E")).toEqual(SAMPLE_DAYS.E);
    expect(reread("burnin")).toEqual([
      "2025-05-31",
      "2025-06-01",
      "2025-06-15",
    ]);
  });

  it("count the months a window touches, a month's end exclusive", () => {
    const t = Date.parse("2025-06-30T00:00:00Z");
    expect(monthsOf(t, t + 1)).toEqual(["2025-06"]);
    expect(monthsOf(t, Date.parse("2025-07-01T00:00:00Z"))).toEqual([
      "2025-06",
    ]);
    expect(monthsOf(t, Date.parse("2025-07-01T00:00:00.001Z"))).toEqual([
      "2025-06",
      "2025-07",
    ]);
    expect(monthsOf(t, t)).toEqual([]);
  });
});
