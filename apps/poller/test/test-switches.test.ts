import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pino } from "pino";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CoverageEvent } from "../src/health/coverage.js";
import { watchTestSwitches } from "../src/health/test-switches.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("watchTestSwitches", () => {
  it("uses a switch file once: deletes it, marks it in coverage and acts", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const dir = mkdtempSync(path.join(tmpdir(), "poller-switch-"));
    const used: string[] = [];
    const coverage: CoverageEvent[] = [];
    const stop = watchTestSwitches(
      dir,
      {
        "test-silence-streams": () => used.push("silence"),
        "test-stop-heartbeat": () => used.push("heartbeat"),
      },
      { coverage: (e) => coverage.push(e) },
      pino({ level: "silent" }),
    );
    writeFileSync(path.join(dir, "test-stop-heartbeat"), "");
    await vi.advanceTimersByTimeAsync(5_000);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(used).toEqual(["heartbeat"]);
    expect(existsSync(path.join(dir, "test-stop-heartbeat"))).toBe(false);
    expect(coverage).toEqual([
      { event: "test_switch", name: "test-stop-heartbeat" },
    ]);
    stop();
  });
});
