/**
 * How COPY-H's program runs (src/copyh/run.ts; rules.md C15): the settings
 * refuse what is not COPY-H's; each error has its exit; the closed windows
 * are WAVE-H's; a run's time stops new work; the writes are whole; the
 * fingerprint is the program's, taken at the package's folder.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  AlreadyRun,
  BuildsDiffer,
  FreezeDiffers,
  GateFailed,
  NotFinished,
  PACKAGE_ROOT,
  RUN_MINUTES,
  Settings,
  StoreError,
  budgetOf,
  exitOf,
  fingerprintOf,
  sha256,
  windowEnd,
  writeUnflushed,
  writeWhole,
} from "../src/copyh/run.js";
import { SealedError } from "../src/copyh/seal.js";
import { MINUTE_MS } from "../src/schedule.js";
import { PACKAGE_ROOT as WAVEH_PACKAGE_ROOT } from "../src/waveh/gate.js";
import { windowEnd as wavehWindowEnd } from "../src/waveh/run.js";

const tmp = (name: string) => mkdtempSync(path.join(tmpdir(), `${name}-`));

describe("the settings", { timeout: 60_000 }, () => {
  const R = "F:\\polymarket-follow-research";
  const good = {
    COPYH_ROOT: `${R}\\COPY-H`,
    WAVEH_STORE: `${R}\\WAVE-H\\store`,
  };
  const issues = (s: object) => {
    const r = Settings.safeParse(s);
    return r.success
      ? []
      : r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  };
  const within =
    "COPYH_ROOT: COPYH_ROOT, WAVEH_STORE, COPYH_FUNDING and FRESH_STORE must lie outside each other, but the funding store in COPYH_ROOT";

  it("take COPY-H's folder and WAVE-H's raw store, the funding store in COPY-H's folder and FRESH's raw store when given", () => {
    expect(issues(good)).toEqual([]);
    expect(
      issues({
        ...good,
        COPYH_FUNDING: `${R}\\COPY-H\\funding`,
        FRESH_STORE: `${R}\\FRESH\\store`,
      }),
    ).toEqual([]);
    expect(issues({ ...good, COPYH_ROOT: "f:/x/copy-h/" })).toEqual([]);
  });

  it("refuse a path that is not absolute, or not the folder it names", () => {
    expect(issues({ ...good, COPYH_ROOT: "COPY-H" })).toEqual([
      "COPYH_ROOT: not an absolute path",
    ]);
    expect(issues({ COPYH_ROOT: good.COPYH_ROOT })).toHaveLength(1);
    expect(issues({ ...good, COPYH_ROOT: "F:\\x\\COPY-H2" })).toEqual([
      "COPYH_ROOT: is not COPY-H's folder (…\\COPY-H)",
    ]);
    expect(issues({ ...good, WAVEH_STORE: "F:\\x\\FRESH\\store" })).toEqual([
      "WAVEH_STORE: is not WAVE-H's raw store (…\\WAVE-H\\store)",
    ]);
    expect(issues({ ...good, COPYH_FUNDING: `${R}\\COPY-H\\fund` })).toEqual([
      "COPYH_FUNDING: is not COPYH-FUNDING's store (…\\COPY-H\\funding)",
    ]);
    expect(issues({ ...good, FRESH_STORE: "F:\\x\\WAVE-H\\store" })).toEqual([
      "FRESH_STORE: is not FRESH's raw store (…\\FRESH\\store)",
    ]);
  });

  it("refuse one inside another, but the funding store inside COPY-H's folder", () => {
    for (const s of [
      { ...good, COPYH_ROOT: `${R}\\WAVE-H\\store\\COPY-H` },
      { ...good, WAVEH_STORE: `${R}\\COPY-H\\WAVE-H\\store` },
      { ...good, FRESH_STORE: `${R}\\COPY-H\\FRESH\\store` },
      { ...good, COPYH_FUNDING: `${R}\\WAVE-H\\store\\COPY-H\\funding` },
      {
        ...good,
        COPYH_FUNDING: `${R}\\COPY-H\\funding`,
        FRESH_STORE: `${R}\\COPY-H\\funding\\FRESH\\store`,
      },
    ])
      expect(issues(s), JSON.stringify(s)).toEqual([within]);
  });
});

describe("the exit codes", { timeout: 60_000 }, () => {
  it("name each error's", () => {
    for (const [err, code, event] of [
      [new NotFinished("x"), 3, "not finished"],
      [new FreezeDiffers("x"), 4, "frozen files differ"],
      [new StoreError("x"), 5, "not ready"],
      [new SealedError("x"), 5, "not ready"],
      [new AlreadyRun("x"), 5, "already run"],
      [new GateFailed("x"), 6, "a gate failed"],
      [new BuildsDiffer("x"), 7, "the two builds differ"],
      [new Error("x"), 1, "crash"],
      ["a string", 1, "crash"],
    ] as const)
      expect(exitOf(err), String(err)).toEqual({ code, event });
  });
});

describe("a run's time", { timeout: 60_000 }, () => {
  it("keeps WAVE-H's closed windows, minute for minute", () => {
    const day = Date.parse("2026-11-26T00:00:00Z");
    for (let m = 0; m < 24 * 60; m++)
      for (const s of [0, 59_999])
        expect(windowEnd(day + m * MINUTE_MS + s), String(m)).toBe(
          wavehWindowEnd(day + m * MINUTE_MS + s),
        );
    expect(windowEnd(day + 150 * MINUTE_MS)).toBe(day + 360 * MINUTE_MS);
    expect(windowEnd(day + 149 * MINUTE_MS + 59_999)).toBeNull();
  });

  it("runs 14 minutes when none are given, a minute inside a part's 15", () => {
    expect(RUN_MINUTES).toBe(14);
  });

  it("stops new work once its minutes are spent, or when a closed window begins", () => {
    let now = Date.parse("2026-11-26T12:00:00Z");
    const b = budgetOf(14, () => now);
    expect(b.stop()).toBeNull();
    now += 14 * MINUTE_MS - 1;
    expect(b.stop()).toBeNull();
    now += 1;
    expect(b.stop()).toBe("its 14 minutes are spent");
    let t = Date.parse("2026-11-26T10:20:00Z");
    const w = budgetOf(60, () => t);
    expect(w.stop()).toBeNull();
    t = Date.parse("2026-11-26T10:25:00Z");
    expect(w.stop()).toBe("a closed window, until 2026-11-26T11:15:00.000Z");
  });
});

describe("the writes", { timeout: 60_000 }, () => {
  it("write whole, renamed over the file, no .tmp left", () => {
    const d = tmp("copyh-write");
    for (const write of [writeWhole, writeUnflushed]) {
      const f = path.join(d, "a", write.name, "x.bin");
      write(f, Buffer.from("one"));
      write(f, Buffer.from("two"));
      expect(readFileSync(f, "utf8")).toBe("two");
      expect(readdirSync(path.dirname(f))).toEqual(["x.bin"]);
    }
  });

  it("throw after the tries when the rename is refused (a non-empty folder in the file's place)", () => {
    const d = tmp("copyh-write");
    const f = path.join(d, "x");
    mkdirSync(path.join(f, "inside"), { recursive: true });
    for (const write of [writeWhole, writeUnflushed])
      expect(() => write(f, Buffer.from("a"), 2, 1), write.name).toThrow();
    expect(existsSync(path.join(f, "inside"))).toBe(true);
  });
});

describe("the fingerprint", { timeout: 60_000 }, () => {
  it("hashes dist/copyh.js and dist/copyh/ alone, so any change to them changes it", () => {
    const root = tmp("copyh-print");
    mkdirSync(path.join(root, "dist", "copyh", "deep"), { recursive: true });
    writeFileSync(path.join(root, "dist", "copyh.js"), "launcher\n");
    writeFileSync(path.join(root, "dist", "copyh", "a.js"), "a\n");
    const lines = (files: [string, string][]) =>
      files.map(([f, t]) => `${sha256(t)} *${f}\n`).join("");
    const first = fingerprintOf(root);
    expect(first).toBe(
      sha256(
        lines([
          ["dist/copyh.js", "launcher\n"],
          ["dist/copyh/a.js", "a\n"],
        ]),
      ),
    );
    writeFileSync(path.join(root, "dist", "polish.js"), "other\n");
    expect(fingerprintOf(root)).toBe(first);
    writeFileSync(path.join(root, "dist", "copyh", "deep", "b.js"), "b\n");
    const second = fingerprintOf(root);
    expect(second).not.toBe(first);
    writeFileSync(path.join(root, "dist", "copyh", "a.js"), "A\n");
    expect(fingerprintOf(root)).not.toBe(second);
  });

  it("is taken at the package's folder, from the sources and the build alike", () => {
    expect(path.resolve(PACKAGE_ROOT)).toBe(path.resolve(WAVEH_PACKAGE_ROOT));
  });
});
