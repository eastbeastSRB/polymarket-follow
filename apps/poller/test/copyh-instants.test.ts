/**
 * COPY-H's instants and ranges (src/copyh/design.ts, range.ts, instants.ts;
 * rules.md C1, C3): every instant; E's files are exactly WAVE-H's frozen
 * list's fill files, S's FRESH's, the burn-in's 850 lie before M₀; the switch
 * hour holds both formats, `node_fills` first; each range's sample days; the
 * months a window touches; each stage's window and Mondays, an entry's stage
 * and M 1 ms either side of each boundary, its UTC day, week and month.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ARCHIVE_START,
  END_E,
  END_F2,
  END_S,
  FRESH2_FILES,
  M0,
  SAMPLE_DAYS,
  SWITCH_HOUR,
} from "../src/copyh/design.js";
import {
  STAGES,
  STAGE_WINDOWS,
  dayOf,
  mondayOf,
  mondaysOf,
  monthOf,
  stageOf,
  weekOf,
} from "../src/copyh/instants.js";
import {
  RANGES,
  RANGE_NAMES,
  hourKeys,
  listNameOf,
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
    expect(sampleDaysOf("FRESH-2")).toEqual(SAMPLE_DAYS["FRESH-2"]);
    expect(reread("FRESH-2")).toEqual(SAMPLE_DAYS["FRESH-2"]);
  });

  it("hold FRESH-2's range: its 4,368 hours of node_fills_by_block, [END_S, END_F2), its own list", () => {
    const r = RANGES["FRESH-2"];
    expect(r.fill).toHaveLength(FRESH2_FILES);
    expect(r.fill.every((k) => k.startsWith("node_fills_by_block/"))).toBe(
      true,
    );
    expect([r.fill[0], r.fill.at(-1)]).toEqual([
      "node_fills_by_block/hourly/20261116/0.lz4",
      "node_fills_by_block/hourly/20270516/23.lz4",
    ]);
    expect([r.start, r.end]).toEqual([END_S, END_F2]);
    expect(r.months).toEqual([
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
      "2027-03",
      "2027-04",
      "2027-05",
    ]);
    expect(listNameOf("FRESH-2")).toBe("copyh/fresh2.sha256");
    for (const n of ["burnin", "E", "S"] as const)
      expect(listNameOf(n)).toBe("copyh/data.sha256");
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

describe("the stages", () => {
  const iso = (t: number) => new Date(t).toISOString();

  it("are C1's table, each window starting where the one before ends", () => {
    expect(STAGES.map((s) => STAGE_WINDOWS[s].map(iso))).toEqual([
      ["2025-05-25T14:00:00.000Z", "2025-06-30T00:00:00.000Z"],
      ["2025-06-30T00:00:00.000Z", "2026-05-29T02:00:00.000Z"],
      ["2026-05-29T02:00:00.000Z", "2026-11-16T00:00:00.000Z"],
      ["2026-11-16T00:00:00.000Z", "2027-05-17T00:00:00.000Z"],
    ]);
  });

  it("hold an entry 1 ms either side of each boundary in the stage its window gives", () => {
    for (const [b, before, from] of [
      [ARCHIVE_START, null, "burn-in"],
      [M0, "burn-in", "E"],
      [END_E, "E", "S"],
      [END_S, "S", "FRESH-2"],
      [END_F2, "FRESH-2", null],
    ] as const) {
      expect(stageOf(b - 1), iso(b)).toBe(before);
      expect(stageOf(b), iso(b)).toBe(from);
    }
  });

  it("give an entry's Monday M, 1 ms either side of each boundary, in the stage before its own where it falls", () => {
    expect(iso(mondayOf(ARCHIVE_START))).toBe("2025-05-19T00:00:00.000Z");
    expect(mondayOf(M0)).toBe(M0);
    expect(mondayOf(M0 - 1)).toBe(M0 - 7 * DAY_MS);
    expect(iso(mondayOf(END_E - 1))).toBe("2026-05-25T00:00:00.000Z");
    expect(iso(mondayOf(END_E))).toBe("2026-05-25T00:00:00.000Z");
    expect(iso(mondayOf(Date.parse("2026-05-29T03:00:00Z")))).toBe(
      "2026-05-25T00:00:00.000Z",
    );
    expect(mondayOf(END_S)).toBe(END_S);
    expect(mondayOf(END_S - 1)).toBe(END_S - 7 * DAY_MS);
    expect(iso(mondayOf(END_F2 - 1))).toBe("2027-05-10T00:00:00.000Z");
  });

  it("have their Mondays: none in the burn-in, 48 in E, 24 in S, 26 in FRESH-2", () => {
    expect(mondaysOf("burn-in")).toEqual([]);
    for (const [s, n, first, last] of [
      ["E", 48, "2025-06-30", "2026-05-25"],
      ["S", 24, "2026-06-01", "2026-11-09"],
      ["FRESH-2", 26, "2026-11-16", "2027-05-10"],
    ] as const) {
      const ms = mondaysOf(s);
      expect(ms.length, s).toBe(n);
      expect(iso(ms[0]!), s).toBe(`${first}T00:00:00.000Z`);
      expect(iso(ms.at(-1)!), s).toBe(`${last}T00:00:00.000Z`);
      ms.forEach((M, i) => {
        expect(new Date(M).getUTCDay()).toBe(1);
        expect(M % DAY_MS).toBe(0);
        if (i > 0) expect(M - ms[i - 1]!).toBe(7 * DAY_MS);
        expect(stageOf(M)).toBe(s);
      });
    }
  });

  it("give an instant's UTC day, week (its Monday) and month", () => {
    const t = Date.parse("2025-07-31T23:59:59.999Z");
    expect(iso(dayOf(t))).toBe("2025-07-31T00:00:00.000Z");
    expect(iso(weekOf(t))).toBe("2025-07-28T00:00:00.000Z");
    expect(iso(monthOf(t))).toBe("2025-07-01T00:00:00.000Z");
    expect(iso(monthOf(t + 1))).toBe("2025-08-01T00:00:00.000Z");
    expect(iso(dayOf(END_E))).toBe("2026-05-29T00:00:00.000Z");
    expect(weekOf(END_S)).toBe(END_S);
  });
});
