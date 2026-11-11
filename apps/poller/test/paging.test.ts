import { describe, expect, it } from "vitest";
import type { Failure, Outcome } from "../src/api/rest-client.js";
import type { Clock } from "../src/clock.js";
import { TRIES, pacer, readPages, withTries } from "../src/jobs/paging.js";
import { ok } from "./fixtures.js";

function fakeClock(startWall = 0) {
  let mono = 0;
  const clock: Clock = {
    wall: () => startWall + mono,
    monotonic: () => mono,
    sleep: (ms) => {
      mono += ms;
      return Promise.resolve();
    },
  };
  return { clock, advance: (ms: number) => (mono += ms) };
}

describe("pacer", () => {
  it("spaces each send by its weight times 1.35 s, and does not wait when the time has passed", async () => {
    const { clock, advance } = fakeClock();
    const pace = pacer(clock);
    const at: number[] = [];
    for (const weight of [5, 5, 1, 1]) {
      await pace(weight);
      at.push(clock.monotonic());
    }
    expect(at).toEqual([0, 6_750, 13_500, 14_850]);
    advance(10_000);
    await pace(1);
    expect(clock.monotonic()).toBe(24_850);
  });
});

describe("withTries", () => {
  const failing = (reasons: Failure[]) => {
    let calls = 0;
    const read = (): Promise<Outcome<number>> => {
      const reason = reasons[calls++];
      return Promise.resolve(
        reason === undefined ? ok(calls) : { ok: false, reason },
      );
    };
    return { read, calls: () => calls };
  };

  it("tries a transient failure up to three times in all", async () => {
    for (const reason of [
      "rate_limited",
      "http_error",
      "timeout",
      "network",
    ] as const) {
      const r = failing([reason, reason, reason, reason]);
      expect(await withTries(r.read)).toEqual({ ok: false, reason });
      expect(r.calls()).toBe(TRIES);
    }
    const recovers = failing(["timeout", "rate_limited"]);
    expect((await withTries(recovers.read)).ok).toBe(true);
    expect(recovers.calls()).toBe(3);
  });

  it("does not try again what would fail again", async () => {
    for (const reason of ["rejected", "budget", "paused"] as const) {
      const r = failing([reason]);
      expect(await withTries(r.read)).toEqual({ ok: false, reason });
      expect(r.calls()).toBe(1);
    }
  });
});

describe("readPages", () => {
  const page = (total: number, count: number) => ({
    total,
    entries: Array.from({ length: count }, (_, i) => i),
  });

  it("ends the pass at its deadline, at a dropped request and at a paused one, and the list at a lost page", async () => {
    const { clock } = fakeClock(1_000);
    const deadline = await readPages(
      () => Promise.resolve(ok(page(500, 100))),
      5,
      1_000,
      1_000 + 7_000,
      pacer(clock),
      clock,
    );
    expect(deadline.pages.map((p) => p.offset)).toEqual([0, 100]);
    expect([deadline.complete, deadline.cut]).toEqual([false, "deadline"]);

    const offsets: number[] = [];
    const dropped = await readPages(
      (offset) => {
        offsets.push(offset);
        return Promise.resolve(
          offset === 0 ? ok(page(500, 100)) : { ok: false, reason: "budget" },
        );
      },
      1,
      1_000,
      Infinity,
      pacer(clock),
      clock,
    );
    expect(offsets).toEqual([0, 100]);
    expect([dropped.pages.length, dropped.cut]).toEqual([1, "deadline"]);

    const paused = await readPages(
      () => Promise.resolve({ ok: false, reason: "paused" }),
      1,
      1_000,
      Infinity,
      pacer(clock),
      clock,
    );
    expect([paused.pages.length, paused.cut]).toEqual([0, "deadline"]);

    const lost = await readPages(
      () => Promise.resolve({ ok: false, reason: "http_error" }),
      1,
      1_000,
      Infinity,
      pacer(clock),
      clock,
    );
    expect([lost.pages.length, lost.complete, lost.cut]).toEqual([
      0,
      false,
      "lost",
    ]);
  });

  it("stops at maxRows when the list is longer", async () => {
    const { clock } = fakeClock();
    const capped = await readPages(
      () => Promise.resolve(ok(page(5_000, 100))),
      1,
      300,
      Infinity,
      pacer(clock),
      clock,
    );
    expect(capped.pages.map((p) => p.offset)).toEqual([0, 100, 200]);
    expect(capped.complete).toBe(true);
  });
});
