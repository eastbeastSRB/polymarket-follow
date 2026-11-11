import { describe, expect, it } from "vitest";
import { ClockWatch } from "../src/health/clock-watch.js";

const MIN = Date.parse("2026-11-11T12:00:00Z");

describe("ClockWatch", () => {
  it("closes each minute with its smallest receive - ts, on the first frame of the next", () => {
    const w = new ClockWatch();
    expect(w.note(MIN + 1_000, MIN + 1_000 - 150)).toBeNull();
    expect(w.note(MIN + 20_000, MIN + 20_000 - 103)).toBeNull();
    // a late burst after a stall: large offsets leave the minute's smallest alone
    expect(w.note(MIN + 59_000, MIN + 40_000)).toBeNull();
    expect(w.last).toBeNull();
    expect(w.note(MIN + 60_000, MIN + 60_000 - 5_000)).toEqual({
      minuteStart: MIN,
      minOffsetMs: 103,
    });
    expect(w.last).toEqual({ minuteStart: MIN, minOffsetMs: 103 });
    // a minute with no frame is skipped; the next closes the one before it
    expect(w.note(MIN + 180_500, MIN + 180_500 - 2_500)).toEqual({
      minuteStart: MIN + 60_000,
      minOffsetMs: 5_000,
    });
  });

  it("counts a frame whose receive time steps back into the open minute", () => {
    const w = new ClockWatch();
    w.note(MIN + 70_000, MIN + 70_000 - 400);
    expect(w.note(MIN + 50_000, MIN + 50_000 - 120)).toBeNull();
    expect(w.note(MIN + 120_000, MIN + 120_000)).toEqual({
      minuteStart: MIN + 60_000,
      minOffsetMs: 120,
    });
  });
});
