import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createLog } from "../src/log.js";

describe("createLog", () => {
  it("writes a line at once and can be closed straight after it opens", () => {
    const stateDir = mkdtempSync(path.join(tmpdir(), "poller-log-"));
    const { log, close } = createLog(stateDir);
    log.warn({ holderPid: 1 }, "another poller holds the lock; exiting");
    expect(() => close()).not.toThrow();
    const [file] = readdirSync(path.join(stateDir, "logs"));
    expect(file).toMatch(/^poller-\d{4}-\d{2}-\d{2}\.log$/);
    const line = JSON.parse(
      readFileSync(path.join(stateDir, "logs", file!), "utf8").trim(),
    ) as { msg: string; level: number; hostname?: string };
    expect(line).toMatchObject({
      msg: "another poller holds the lock; exiting",
      level: 40,
    });
    expect(line.hostname).toBeUndefined();
  });
});
