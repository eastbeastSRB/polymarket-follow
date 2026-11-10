import { describe, expect, it } from "vitest";
import { nextBackoffMs, restPaused } from "../src/api/rest-client.js";
import {
  DAY_MS,
  MINUTE_MS,
  SECOND_MS,
  hourStart,
  inNightlyPause,
  nextNightlyEdge,
  nextRun,
  utcDate,
  utcHour,
} from "../src/schedule.js";

const at = (iso: string) => Date.parse(iso);

describe("nextRun", () => {
  it("gives the next slot strictly after the time asked", () => {
    const tickers = { everyMs: MINUTE_MS, offsetMs: 5 * SECOND_MS };
    expect(nextRun(tickers, at("2026-11-10T14:00:04.999Z"))).toBe(
      at("2026-11-10T14:00:05Z"),
    );
    expect(nextRun(tickers, at("2026-11-10T14:00:05Z"))).toBe(
      at("2026-11-10T14:01:05Z"),
    );
  });

  it("aligns longer periods on UTC and serves a daily HH:MM", () => {
    const tenMinutes = { everyMs: 10 * MINUTE_MS, offsetMs: 155 * SECOND_MS };
    expect(nextRun(tenMinutes, at("2026-11-10T14:03:00Z"))).toBe(
      at("2026-11-10T14:12:35Z"),
    );
    const daily = { everyMs: DAY_MS, offsetMs: (23 * 60 + 38) * MINUTE_MS };
    expect(nextRun(daily, at("2026-11-10T23:38:00Z"))).toBe(
      at("2026-11-11T23:38:00Z"),
    );
    expect(nextRun(daily, at("2026-11-10T12:00:00Z"))).toBe(
      at("2026-11-10T23:38:00Z"),
    );
  });
});

describe("the nightly window, 02:35–03:50Z", () => {
  it("holds from 02:35 to just before 03:50", () => {
    expect(inNightlyPause(at("2026-11-10T02:34:59.999Z"))).toBe(false);
    expect(inNightlyPause(at("2026-11-10T02:35:00Z"))).toBe(true);
    expect(inNightlyPause(at("2026-11-10T03:49:59.999Z"))).toBe(true);
    expect(inNightlyPause(at("2026-11-10T03:50:00Z"))).toBe(false);
  });

  it("stops REST sends 15 s early, so no request is in flight inside it", () => {
    expect(restPaused(at("2026-11-10T02:34:44.999Z"))).toBe(false);
    expect(restPaused(at("2026-11-10T02:34:45Z"))).toBe(true);
    expect(restPaused(at("2026-11-10T03:49:59.999Z"))).toBe(true);
    expect(restPaused(at("2026-11-10T03:50:00Z"))).toBe(false);
  });

  it("names its next edge", () => {
    expect(nextNightlyEdge(at("2026-11-10T14:00:00Z"))).toEqual({
      at: at("2026-11-11T02:35:00Z"),
      starts: true,
    });
    expect(nextNightlyEdge(at("2026-11-11T02:35:00Z"))).toEqual({
      at: at("2026-11-11T03:50:00Z"),
      starts: false,
    });
  });
});

describe("nextBackoffMs", () => {
  it("doubles from 2 s after a 429 and from 1 s after other failures, to 60 s", () => {
    const after429: number[] = [];
    let ms = 0;
    for (let i = 0; i < 7; i += 1)
      after429.push((ms = nextBackoffMs(ms, true)));
    expect(after429).toEqual([
      2_000, 4_000, 8_000, 16_000, 32_000, 60_000, 60_000,
    ]);

    const afterError: number[] = [];
    ms = 0;
    for (let i = 0; i < 3; i += 1)
      afterError.push((ms = nextBackoffMs(ms, false)));
    expect(afterError).toEqual([1_000, 2_000, 4_000]);
    expect(nextBackoffMs(1_000, true)).toBe(2_000);
  });
});

describe("UTC names", () => {
  it("names the day and hour of a time in UTC", () => {
    const t = at("2026-11-10T23:59:59.999Z");
    expect(utcDate(t)).toBe("2026-11-10");
    expect(utcHour(t)).toBe("23");
    expect(hourStart(t)).toBe(at("2026-11-10T23:00:00Z"));
  });
});
