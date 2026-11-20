/**
 * FRESH's positions on the exam's days (src/polish/exam/fresh.ts;
 * polish/rules.md P1, P4, P5, P8; THE PLAN D4, D15, D29, D30, D53b): the
 * exam's entries from 2026-05-30 closing before FRESH_END; each segment at
 * its edges, the discovery window, option B's cut on a leg's day without
 * books; the holes as the union of every file's records, each window of a
 * position at its edge; the safety net at 20 days and 10 coins; `place`
 * on a test of the instant equal to its part.
 */
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import { loadResearch, type Research } from "../src/paper/research.js";
import {
  EXAM_DESIGN,
  K,
  NO_BOOK_DAYS,
  SAFETY_NET,
  SEGMENTS,
} from "../src/polish/exam/design.js";
import {
  holesOf,
  inExam,
  leftOutOf,
  safetyNet,
  whereOf,
} from "../src/polish/exam/fresh.js";
import {
  keyOf,
  onDeciding,
  touches,
  type LookPosition,
} from "../src/polish/exam/look.js";
import { FRESH_END } from "../src/polish/seal.js";
import { E, inPart } from "../src/polish/tries/parts.js";
import { B0, place } from "../src/polish/tries/rules.js";
import { CUTS_FILE } from "../src/polish/tries/steps.js";
import { CutsFile } from "../src/polish/tries/trylog.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { makeWorld } from "./polish-tries-world.js";

let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const at = (iso: string) => Date.parse(iso);
const HOLD = 2 * MINUTE_MS + DAY_MS;
const pos = (t: number) => ({ t, xIn: t + 2 * MINUTE_MS, xOut: t + HOLD });

describe("the exam's days (D4, option B)", () => {
  it("takes entries from 2026-05-30 that close before FRESH_END, by x_out, not the parts' 50-hour stop", () => {
    expect(inExam(at("2026-05-30T00:00:00Z"))).toBe(true);
    expect(inExam(at("2026-05-30T00:00:00Z") - 1)).toBe(false);
    expect(inExam(FRESH_END - HOLD - 1)).toBe(true);
    expect(inExam(FRESH_END - HOLD)).toBe(false);
  });

  it("places a position in its segment when t is on or after its start and x_out before its end; every other in the discovery window", () => {
    expect(whereOf(pos(SEGMENTS[0].from), false)).toBe("segment 1");
    expect(whereOf(pos(SEGMENTS[0].to - HOLD - 1), false)).toBe("segment 1");
    expect(whereOf(pos(SEGMENTS[0].to - HOLD), false)).toBe("discovery");
    expect(whereOf(pos(at("2026-09-15T12:00:00Z")), false)).toBe("discovery");
    expect(whereOf(pos(SEGMENTS[1].from - 1), false)).toBe("discovery");
    expect(whereOf(pos(SEGMENTS[1].from), false)).toBe("segment 2");
    expect(whereOf(pos(FRESH_END - HOLD - 1), false)).toBe("segment 2");
  });

  it("cuts, under option B, a deciding position with a leg on a day without books, and only then", () => {
    expect(NO_BOOK_DAYS).toEqual([
      "2026-07-08",
      "2026-07-12",
      "2026-07-13",
      "2026-07-14",
      "2026-07-15",
      "2026-07-16",
      "2026-07-17",
    ]);
    const cut = "cut: a day without books";
    // The entry on 2026-07-08; the exit on 07-12 (entered 07-11); either leg exactly at a day's first instant.
    expect(whereOf(pos(at("2026-07-08T10:00:00Z")), true)).toBe(cut);
    expect(whereOf(pos(at("2026-07-11T10:00:00Z")), true)).toBe(cut);
    // x_out at 07-12 00:00:00 exactly is cut; 1 ms earlier, on 07-11, kept. The same before 07-08.
    expect(whereOf(pos(at("2026-07-10T23:58:00Z") - 1), true)).toBe(
      "segment 1",
    );
    expect(whereOf(pos(at("2026-07-10T23:58:00Z")), true)).toBe(cut);
    expect(whereOf(pos(at("2026-07-06T23:58:00Z") - 1), true)).toBe(
      "segment 1",
    );
    expect(whereOf(pos(at("2026-07-06T23:58:00Z")), true)).toBe(cut);
    // The last day without books: x_in on 07-17 is cut; x_in at 07-18 00:00:00, kept.
    expect(whereOf(pos(at("2026-07-17T23:57:59Z")), true)).toBe(cut);
    expect(whereOf(pos(at("2026-07-17T23:58:00Z")), true)).toBe("segment 1");
    // Option A keeps them.
    expect(whereOf(pos(at("2026-07-08T10:00:00Z")), false)).toBe("segment 1");
    // The discovery window and segment 2 have no day without books.
    expect(whereOf(pos(at("2026-09-15T12:00:00Z")), true)).toBe("discovery");
    expect(whereOf(pos(SEGMENTS[1].from), true)).toBe("segment 2");
  });
});

describe("the holes and the positions they leave out (D29, D30)", () => {
  const S = 1_000;
  it("joins every file's records: a file's own hole another file covers is none; a gap of 60 s between files is one", () => {
    expect(
      holesOf([
        { times: { first: 0, max: 1_000 * S, holes: [[200 * S, 400 * S]] } },
        { times: { first: 300 * S, max: 2_000 * S, holes: [] } },
        { times: null },
        { times: { first: 2_059_999, max: 2_500 * S, holes: [] } },
        { times: { first: 3_000 * S, max: 3_100 * S, holes: [] } },
      ]),
    ).toEqual([
      [200 * S, 300 * S],
      [2_500 * S, 3_000 * S],
    ]);
    expect(
      holesOf([
        { times: { first: 0, max: 100 * S, holes: [] } },
        { times: { first: 160 * S - 1, max: 200 * S, holes: [] } },
      ]),
    ).toEqual([]);
    // 60 s exactly is a hole.
    expect(
      holesOf([
        { times: { first: 0, max: 100 * S, holes: [] } },
        { times: { first: 160 * S, max: 200 * S, holes: [] } },
      ]),
    ).toEqual([[100 * S, 160 * S]]);
    expect(holesOf([])).toEqual([]);
  });

  it("leaves out a position whose hour up to t, entry minute or exit minute meets a hole, each at its edge", () => {
    const h0 = at("2026-06-10T10:00:00Z");
    const h1 = h0 + 5 * MINUTE_MS;
    const holes: [number, number][] = [[h0, h1]];
    const p = (t: number, xIn = t + DAY_MS, xOut = t + 2 * DAY_MS) => ({
      t,
      xIn,
      xOut,
    });
    const hour = "a hole in the hour up to t";
    expect(leftOutOf(holes, p(h1 + HOUR_MS))).toBeNull();
    expect(leftOutOf(holes, p(h1 + HOUR_MS - 1))).toBe(hour);
    expect(leftOutOf(holes, p(h0))).toBe(hour);
    expect(leftOutOf(holes, p(h0 - 1))).toBeNull();
    const t = h0 - DAY_MS;
    const entry = "a hole in the entry's minute";
    expect(leftOutOf(holes, p(t, h1))).toBeNull();
    expect(leftOutOf(holes, p(t, h1 - 1))).toBe(entry);
    expect(leftOutOf(holes, p(t, h0 - MINUTE_MS))).toBeNull();
    expect(leftOutOf(holes, p(t, h0 - MINUTE_MS + 1))).toBe(entry);
    const exit = "a hole in the exit's minute";
    expect(leftOutOf(holes, p(t - DAY_MS, t, h0 + 1))).toBe(exit);
    expect(leftOutOf(holes, p(t - DAY_MS, t, h1 - 1))).toBe(exit);
    expect(leftOutOf(holes, p(t - DAY_MS, t, h1))).toBeNull();
    expect(leftOutOf(holes, p(t - DAY_MS, t, h0 - MINUTE_MS))).toBeNull();
    expect(leftOutOf(holes, p(t - DAY_MS, t, h0 - MINUTE_MS + 1))).toBe(exit);
  });
});

describe("the safety net (D53b)", () => {
  const net = (ps: Parameters<typeof safetyNet>[0]) =>
    safetyNet(ps, SAFETY_NET);
  // Each coin's position at its own minute of the day: days are counted by UTC day, not by instant.
  const grid = (days: number, coins: number, left: string | null = null) =>
    Array.from({ length: days * coins }, (_, k) => ({
      t:
        SEGMENTS[0].from +
        Math.floor(k / coins) * DAY_MS +
        HOUR_MS +
        (k % coins) * MINUTE_MS,
      iid: k % coins,
      left,
    }));
  it("counts only the positions not left out", () => {
    const hole = "a hole in the hour up to t";
    // A 20th day and a 10th coin seen only in left-out positions do not count.
    const out = [
      { t: SEGMENTS[0].from + 30 * DAY_MS, iid: 9, left: hole },
      ...grid(1, 1, hole),
    ];
    expect(net([...grid(19, 9), ...out])).toEqual({
      deciding: "N",
      why: "the 715 line spans 19 UTC days and 9 coins on the deciding days; 20 and 10 are needed",
      days: 19,
      coins: 9,
    });
    expect(net(grid(20, 10, hole)).deciding).toBe("N");
    expect(net([...grid(20, 10), ...out]).deciding).toBe("715");
  });

  it("keeps the 715 line at 20 UTC days and 10 coins, and hands the exam to N under either", () => {
    expect(net(grid(20, 10))).toEqual({
      deciding: "715",
      why: null,
      days: 20,
      coins: 10,
    });
    expect(net(grid(19, 10))).toEqual({
      deciding: "N",
      why: "the 715 line spans 19 UTC days and 10 coins on the deciding days; 20 and 10 are needed",
      days: 19,
      coins: 10,
    });
    expect(net(grid(20, 9)).deciding).toBe("N");
    expect(net([]).deciding).toBe("N");
  });

  it("reads its floors from the design it is given (the step passes EXAM_DESIGN's, SAFETY_NET's)", () => {
    expect(EXAM_DESIGN.safetyNet).toBe(SAFETY_NET);
    expect(SAFETY_NET).toEqual({ days: 20, coins: 10 });
    expect(safetyNet(grid(1, 1), { days: 1, coins: 1 })).toEqual({
      deciding: "715",
      why: null,
      days: 1,
      coins: 1,
    });
    expect(safetyNet(grid(1, 1), { days: 2, coins: 1 })).toEqual({
      deciding: "N",
      why: "the 715 line spans 1 UTC days and 1 coins on the deciding days; 2 and 1 are needed",
      days: 1,
      coins: 1,
    });
  });
});

describe("the deciding line's days (D16)", () => {
  it("holds slices 0 to K − 1 in a deciding segment, after option B's cut", () => {
    const p: LookPosition = {
      slice: K - 1,
      iid: 5,
      t: SEGMENTS[0].from,
      side: -1,
      dir: 1,
      xIn: SEGMENTS[0].from + 2 * MINUTE_MS,
      xOut: SEGMENTS[0].from + HOLD,
      method: "market",
      accounts: [],
      tid: "1",
      where: "segment 1",
      left: null,
    };
    expect(K).toBe(20);
    expect(onDeciding(p)).toBe(true);
    expect(onDeciding({ ...p, slice: 0, where: "segment 2" })).toBe(true);
    expect(onDeciding({ ...p, slice: K })).toBe(false);
    expect(onDeciding({ ...p, where: "cut: a day without books" })).toBe(false);
    expect(onDeciding({ ...p, where: "discovery" })).toBe(false);
    // Left out, it is still on the deciding days: the verdict counts it (D36).
    expect(onDeciding({ ...p, left: "a hole in the hour up to t" })).toBe(true);
  });
});

describe("the days of F7's list a position touches (D12)", () => {
  it("meets a UTC day when [x_in, x_out] reaches into it, both ends in", () => {
    const day = "2026-07-18";
    const d0 = at(`${day}T00:00:00Z`);
    expect(touches({ xIn: d0 - DAY_MS, xOut: d0 }, day)).toBe(true);
    expect(touches({ xIn: d0 - DAY_MS, xOut: d0 - 1 }, day)).toBe(false);
    expect(touches({ xIn: d0 + DAY_MS - 1, xOut: d0 + 2 * DAY_MS }, day)).toBe(
      true,
    );
    expect(touches({ xIn: d0 + DAY_MS, xOut: d0 + 2 * DAY_MS }, day)).toBe(
      false,
    );
  });
});

describe("a position's key in step 2's maps", () => {
  it("tells apart two slices entering one coin at one instant, and every instant and coin", () => {
    const p = { slice: 3, t: SEGMENTS[0].from, iid: 5 };
    const keys = [
      p,
      { ...p, slice: 4 },
      { ...p, t: p.t + 1 },
      { ...p, iid: 6 },
    ].map(keyOf);
    expect(new Set(keys).size).toBe(4);
    expect(keyOf({ ...p })).toBe(keys[0]);
  });
});

describe("place on a test of the instant (D15)", () => {
  it("places on E's test exactly as on E", () => {
    const d = makeWorld(kit, true);
    const cuts = CutsFile.parse(
      JSON.parse(readFileSync(CUTS_FILE, "utf8")),
    ).cuts;
    const onPart = place(d, B0, E, 2, cuts);
    expect(onPart.specs.length).toBeGreaterThan(0);
    expect(place(d, B0, (t) => inPart(E, t), 2, cuts)).toEqual(onPart);
    expect(place(d, B0, () => false, 2, cuts).specs).toEqual([]);
  });
});
