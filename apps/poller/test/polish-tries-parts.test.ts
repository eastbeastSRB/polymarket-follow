/**
 * The exploration's parts and positions (src/polish/tries/parts.ts): the
 * parts' bounds and the 50-hour stop; every slice's entries for any M,
 * held to WAVE-H's frozen `waveSpots` slice by slice; positions for any
 * delay and hold; the B1 episodes over every account, held to MARKET-1's
 * `episodes`.
 */
import { describe, expect, it } from "vitest";
import { byM4 } from "../src/market1/fills.js";
import { ENTRY_DELAY_MS, HOLD_MS } from "../src/market1/price.js";
import { episodes } from "../src/market1/waves.js";
import { HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import {
  C,
  E,
  STOP_MS,
  entriesOf,
  episodeIds,
  inPart,
  positionOf,
} from "../src/polish/tries/parts.js";
import type { Counted } from "../src/waveh/fills.js";
import { DATA_END } from "../src/waveh/instants.js";
import { waveSpots } from "../src/waveh/positions.js";
import { bySlice } from "../src/waveh/slices.js";
import { addr } from "./polish-world.js";

const T0 = Date.parse("2025-09-10T10:00:00Z");
const fill = (t: number, iid: number, a: number, tid: number): Counted => ({
  t,
  iid,
  addr: addr(a),
  side: -1,
  tid: String(tid),
  method: "market",
});
// Forced sells in coins 5 and 7. Under M = 2, the even addresses are slice 0 and the odd ones slice 1.
const F6 = T0 + MINUTE_MS + HOUR_MS + 1;
const counted = [
  fill(T0, 5, 2, 1),
  fill(T0 + 30_000, 7, 1, 2),
  fill(T0 + 60_000, 5, 4, 3),
  fill(T0 + 90_000, 7, 3, 4),
  fill(T0 + 120_000, 5, 2, 5),
  fill(F6, 5, 4, 6),
  fill(F6 + HOUR_MS + 1, 5, 2, 7),
  fill(F6 + 2 * HOUR_MS + 1, 5, 4, 8),
].sort(byM4);

describe("the parts", () => {
  it("E and C by the entry's instant, entries stopping 50 hours before each part's end", () => {
    expect(STOP_MS).toBe(50 * HOUR_MS);
    for (const [p, first, lastOut, end] of [
      [
        E,
        "2025-06-01T00:00:00Z",
        "2025-12-29T22:00:00Z",
        "2026-01-01T00:00:00Z",
      ],
      [
        C,
        "2026-01-01T00:00:00Z",
        "2026-05-26T23:00:00Z",
        "2026-05-29T01:00:00Z",
      ],
    ] as const) {
      expect(p.end).toBe(Date.parse(end));
      expect(inPart(p, Date.parse(first))).toBe(true);
      expect(inPart(p, Date.parse(first) - 1)).toBe(false);
      expect(inPart(p, Date.parse(lastOut) - 1)).toBe(true);
      expect(inPart(p, Date.parse(lastOut))).toBe(false);
      // The longest outcome a position reads, D60 held 24 h and its exit leg's minute, ends inside the part.
      expect(
        Date.parse(lastOut) - 1 + HOUR_MS + HOLD_MS + MINUTE_MS,
      ).toBeLessThan(p.end);
    }
    expect(C.end).toBe(DATA_END);
    expect(E.end).toBe(C.start);
  });
});

describe("every slice's entries and their positions", () => {
  it("are WAVE-H's waveSpots in each slice, for M = 1 and M = 2, the default delay and hold", () => {
    for (const M of [1, 2]) {
      const slices = bySlice(counted, M);
      const entries = entriesOf(slices);
      const spots = slices.flatMap((fills, s) =>
        waveSpots(s, fills, 0, Infinity),
      );
      expect(
        entries
          .map((e) => positionOf(e))
          .map((p) => [
            p.e.slice,
            p.e.fill.t,
            p.e.fill.iid,
            p.dir,
            p.xIn,
            p.xOut,
            p.e.accounts,
          ]),
      ).toEqual(
        spots.map((s) => [
          s.slice,
          s.t,
          s.iid,
          s.dir,
          s.xIn,
          s.xOut,
          s.accounts,
        ]),
      );
      expect(entries.every((e) => e.M === M)).toBe(true);
    }
    // By hand: M = 1 enters coin 7 at T0 + 30 s and coin 5 at T0 + 60 s; coin 7's second fill and coin 5's
    // third are blocked; coin 5 enters again 60 minutes and 1 ms after its last entry.
    expect(
      entriesOf(bySlice(counted, 1)).map((e) => [e.fill.tid, e.accounts]),
    ).toEqual([
      ["2", [addr(1), addr(2)]],
      ["3", [addr(1), addr(2), addr(4)]],
      ["6", [addr(2), addr(3), addr(4)]],
      ["8", [addr(2), addr(4)]],
    ]);
    // M = 2: slice 0 holds the even addresses, slice 1 the odd ones.
    expect(
      entriesOf(bySlice(counted, 2)).map((e) => [e.slice, e.fill.tid]),
    ).toEqual([
      [0, "3"],
      [0, "6"],
      [0, "8"],
      [1, "4"],
    ]);
  });

  it("a position takes any delay and hold, against the forced side", () => {
    const [e] = entriesOf(bySlice(counted, 1));
    expect(positionOf(e!)).toMatchObject({
      dir: 1,
      xIn: T0 + 30_000 + ENTRY_DELAY_MS,
      xOut: T0 + 30_000 + ENTRY_DELAY_MS + HOLD_MS,
    });
    expect(positionOf(e!, 10_000, 4 * HOUR_MS)).toMatchObject({
      dir: 1,
      xIn: T0 + 40_000,
      xOut: T0 + 40_000 + 4 * HOUR_MS,
    });
    const buy = { ...e!, fill: { ...e!.fill, side: 1 as const } };
    expect(positionOf(buy).dir).toBe(-1);
  });
});

describe("the episodes over every account", () => {
  it("start where MARKET-1's episodes start, and chain while a coin's gap is at most 60 minutes", () => {
    const ids = episodeIds(counted);
    const starts = counted.filter(
      (f, i) => counted.findIndex((g) => ids.get(g) === ids.get(f)) === i,
    );
    expect(starts).toEqual(episodes(counted).map((e) => e.fill));
    // Coin 5: tids 1, 3, 5 and 6 (59 minutes after 5) one episode; 7, 60 minutes and 1 ms after 6, a new one;
    // 8, exactly 60 minutes after 7, joins it. Coin 7: tids 2 and 4.
    expect(counted.map((f) => [f.tid, ids.get(f)])).toEqual([
      ["1", 0],
      ["2", 1],
      ["3", 0],
      ["4", 1],
      ["5", 0],
      ["6", 0],
      ["7", 2],
      ["8", 2],
    ]);
  });
});
