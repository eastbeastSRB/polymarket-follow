import { describe, expect, it } from "vitest";
import { BookSampler } from "../src/ws/book-sampler.js";

const T = Date.parse("2026-11-10T14:00:00Z");
/** A frame of market 1 at server time `ts`, received 100 ms later. */
const frame = (sampler: BookSampler, ts: number, levels: string, iid = 1) =>
  sampler.onFrame(iid, ts, ts + 100, `f@${ts}`, levels);

describe("BookSampler", () => {
  it("writes the last frame of each second, when the next second begins", () => {
    const s = new BookSampler();
    expect(frame(s, T + 0, "a")).toBeNull();
    expect(frame(s, T + 400, "b")).toBeNull();
    expect(frame(s, T + 900, "c")).toBeNull();
    expect(frame(s, T + 1_000, "d")).toEqual({
      iid: 1,
      recvMs: T + 1_000,
      text: `f@${T + 900}`,
    });
  });

  it("skips a second whose last frame repeats the last written levels", () => {
    const s = new BookSampler();
    frame(s, T + 900, "a");
    expect(frame(s, T + 1_900, "a")).not.toBeNull();
    expect(frame(s, T + 2_900, "a")).toBeNull();
    expect(frame(s, T + 3_900, "b")).toBeNull();
    expect(frame(s, T + 4_000, "b")?.text).toBe(`f@${T + 3_900}`);
  });

  it("writes each market's first sample of an hour even when unchanged, so the hour's file stands alone", () => {
    const s = new BookSampler();
    const end = T - 1_100;
    frame(s, end - 1_000, "a");
    expect(frame(s, end, "a")?.text).toBe(`f@${end - 1_000}`);
    expect(frame(s, T - 100, "a")).toBeNull();
    expect(frame(s, T + 900, "a")?.text).toBe(`f@${T - 100}`);
    // `T - 100` was received at T: the first sample of the new hour.
  });

  it("keeps markets apart", () => {
    const s = new BookSampler();
    frame(s, T + 900, "a", 1);
    frame(s, T + 900, "a", 2);
    expect(frame(s, T + 1_000, "x", 2)?.iid).toBe(2);
    expect(frame(s, T + 1_000, "x", 1)?.iid).toBe(1);
  });

  it("treats a frame stamped earlier than the held one as the same second", () => {
    const s = new BookSampler();
    frame(s, T + 1_500, "a");
    expect(frame(s, T + 800, "b")).toBeNull();
    expect(frame(s, T + 2_000, "c")?.text).toBe(`f@${T + 800}`);
  });

  it("gives up the held frames at a stop, and a forgotten market's", () => {
    const s = new BookSampler();
    frame(s, T + 100, "a", 1);
    frame(s, T + 100, "a", 2);
    expect(s.forget(2)?.iid).toBe(2);
    expect(s.flushAll().map((l) => l.iid)).toEqual([1]);
    expect(s.flushAll()).toEqual([]);
  });
});
