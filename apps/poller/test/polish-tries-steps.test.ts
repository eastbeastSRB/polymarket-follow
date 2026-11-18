/**
 * The exploration's steps through the built program (`dist/polish.js
 * explore --step <name>`): the options and settings refused (exit 2) and a
 * store that is not there (exit 5), each before anything is read or waited
 * for. The steps themselves run on the gates world (polish-gates.test.ts)
 * and on worlds in memory.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PACKAGE_ROOT } from "../src/waveh/gate.js";

const program = path.join(PACKAGE_ROOT, "dist", "polish.js");
const tmp = (name: string) =>
  mkdtempSync(path.join(tmpdir(), `polish-${name}-`));
const run = (args: string[], env: Record<string, string>) =>
  spawnSync(process.execPath, [program, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      WAVEH_STORE: "",
      ANALYZER_ROOT: "",
      WAVEH_ROOT: "",
      ...env,
    },
    timeout: 50_000,
  });

describe("explore --step through the built program", () => {
  it(
    "refuses a step it does not know, a second step and a step without WAVEH_ROOT (exit 2); a root without a store is not ready (exit 5)",
    { timeout: 60_000 },
    () => {
      const ok = {
        WAVEH_STORE: "F:\\x\\WAVE-H\\store",
        ANALYZER_ROOT: tmp("root"),
        WAVEH_ROOT: tmp("waveh"),
      };
      for (const [args, env, why] of [
        [["explore", "--step", "bogus"], ok, 'the option "--step bogus"'],
        [
          ["explore", "--step", "features", "--step", "features"],
          ok,
          'the option "--step features"',
        ],
        [
          ["explore", "--step", "features"],
          { ...ok, WAVEH_ROOT: "" },
          "WAVEH_ROOT",
        ],
        [
          ["explore", "--day", "2025-10-10"],
          ok,
          'the option "--day 2025-10-10"',
        ],
      ] as const) {
        const r = run([...args], { ...env });
        expect(r.status, r.stderr).toBe(2);
        expect(r.stderr).toContain(why);
      }
      expect(readdirSync(ok.ANALYZER_ROOT)).toEqual([]);
      const r = run(["explore", "--step", "features"], ok);
      expect(r.status, r.stderr).toBe(5);
      expect(readdirSync(ok.ANALYZER_ROOT)).toEqual(["logs"]);
    },
  );
});
