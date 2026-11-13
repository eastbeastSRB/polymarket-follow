import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseEnv } from "node:util";
import { pino } from "pino";
import { afterEach, describe, expect, it } from "vitest";
import {
  CLOSED,
  FROZEN_FILE,
  PACKAGE_ROOT,
  PAPER_FILES,
  SealedError,
  checkDatum,
  checkSealed,
  frozenFiles,
  gateOf,
  verifyFreeze,
} from "../src/market1/gate.js";
import {
  PAPER_CHECK_EVERY_MS,
  PAPER_LOCK,
  PAPER_WAIT_MS,
  paperRunLive,
  parseMarket1Config,
  waitForPaper,
  writeWhole,
} from "../src/market1/run.js";
import { CUT } from "../src/paper/instants.js";
import { verifyFreeze as verifyPaperFreeze } from "../src/paper/gate.js";

const log = pino({ level: "silent" });
const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
const scratch: string[] = [];
const children: ChildProcess[] = [];
const tmp = (name: string) => {
  const dir = mkdtempSync(path.join(tmpdir(), `market1-${name}-`));
  scratch.push(dir);
  return dir;
};
afterEach(() => {
  for (const c of children.splice(0)) c.kill();
  for (const d of scratch.splice(0))
    rmSync(d, { recursive: true, force: true });
});

/** A package folder with one file in each part of the scope. */
function makePackage(): string {
  const pkg = tmp("pkg");
  const files = [
    "dist/market1.js",
    "dist/market1/daily.js",
    ...PAPER_FILES,
    "dist/paper/page.js",
    "research/kit/check.mjs",
    "market1/rules.md",
  ];
  for (const f of files) {
    mkdirSync(path.dirname(path.join(pkg, f)), { recursive: true });
    writeFileSync(path.join(pkg, f), `${f}\n`);
  }
  return pkg;
}

function freeze(pkg: string): string {
  const text = `${frozenFiles(pkg)
    .map((f) => `${sha256(readFileSync(path.join(pkg, f)))} *${f}`)
    .join("\n")}\n`;
  writeFileSync(path.join(pkg, FROZEN_FILE), text);
  return sha256(text);
}

describe("MARKET-1's freeze (M0)", () => {
  it("lists the program, the eleven paper files, research and market1, and no other paper file", () => {
    const pkg = makePackage();
    expect(frozenFiles(pkg)).toEqual([
      "dist/market1.js",
      "dist/market1/daily.js",
      ...PAPER_FILES,
      "research/kit/check.mjs",
      "market1/rules.md",
    ]);
    expect(PAPER_FILES).toHaveLength(11);
  });

  it("refuses without a list, with a changed, missing or unlisted file, and without the paper files", () => {
    const pkg = makePackage();
    expect(verifyFreeze(pkg)).toEqual({
      ok: false,
      problems: [`no ${FROZEN_FILE}`],
    });
    const hash = freeze(pkg);
    expect(verifyFreeze(pkg)).toEqual({ ok: true, sha256: hash, files: 15 });
    expect(gateOf(verifyFreeze(pkg))).toEqual({ open: true });

    writeFileSync(path.join(pkg, "market1/rules.md"), "changed\n");
    expect(verifyFreeze(pkg)).toEqual({
      ok: false,
      problems: ["changed: market1/rules.md"],
    });
    expect(gateOf(verifyFreeze(pkg))).toEqual({ open: false });
    freeze(pkg);

    writeFileSync(path.join(pkg, "dist/market1/extra.js"), "x\n");
    expect(verifyFreeze(pkg)).toEqual({
      ok: false,
      problems: ["not in the freeze: dist/market1/extra.js"],
    });
    rmSync(path.join(pkg, "dist/market1/extra.js"));

    rmSync(path.join(pkg, "dist/paper/loop.js"));
    expect(verifyFreeze(pkg)).toEqual({
      ok: false,
      problems: ["missing: dist/paper/loop.js"],
    });
    freeze(pkg);
    expect(verifyFreeze(pkg)).toEqual({
      ok: false,
      problems: ["not in the freeze: dist/paper/loop.js"],
    });
  });

  it("is not the paper experiment's: a paper file outside the eleven is not MARKET-1's", () => {
    const pkg = makePackage();
    freeze(pkg);
    writeFileSync(path.join(pkg, "dist/paper/page.js"), "a paper fix\n");
    expect(verifyFreeze(pkg).ok).toBe(true);
    writeFileSync(path.join(pkg, "dist/paper/store.js"), "a paper fix\n");
    expect(verifyFreeze(pkg)).toEqual({
      ok: false,
      problems: ["changed: dist/paper/store.js"],
    });
  });
});

describe("the sealed-data gate (M0)", () => {
  it("refuses a read through a window that reaches the cut, and a datum at or after it, while closed", () => {
    expect(() => checkSealed(CLOSED, CUT + 1, "recordings")).toThrow(
      SealedError,
    );
    expect(() => checkSealed(CLOSED, CUT, "recordings")).not.toThrow();
    expect(() => checkSealed({ open: true }, CUT + 1, "x")).not.toThrow();
    expect(() => checkDatum(CLOSED, CUT, "a fill")).toThrow(SealedError);
    expect(() => checkDatum(CLOSED, CUT - 1, "a fill")).not.toThrow();
    expect(() => checkDatum({ open: true }, CUT, "a fill")).not.toThrow();
  });
});

describe("the paper experiment's freeze, after this build (M0)", () => {
  it("still verifies: 61 files, d04d3cd8…f31c", () => {
    expect(verifyPaperFreeze(PACKAGE_ROOT)).toEqual({
      ok: true,
      sha256:
        "d04d3cd81945057aba59d3475190596090b8962626cec502b006d7430f2ef31c",
      files: 61,
    });
  });
});

/** A node process that sleeps, holding nothing; its pid is a live holder. */
function sleeper(): ChildProcess {
  const c = spawn(process.execPath, ["-e", "setTimeout(() => {}, 60000)"], {
    stdio: "ignore",
  });
  children.push(c);
  return c;
}

describe("the paper experiment's run, waited for (M2, F2)", () => {
  it("is live only with a living holder and a heartbeat under 2 minutes old", () => {
    const dir = tmp("state");
    const now = Date.now();
    expect(paperRunLive(dir, now)).toBe(false);
    const holder = sleeper();
    writeFileSync(path.join(dir, PAPER_LOCK.lock), `${holder.pid}\n`);
    expect(paperRunLive(dir, now)).toBe(false);
    writeFileSync(path.join(dir, PAPER_LOCK.heartbeat), "{}\n");
    expect(paperRunLive(dir, Date.now())).toBe(true);
    const old = new Date(Date.now() - 121_000);
    utimesSync(path.join(dir, PAPER_LOCK.heartbeat), old, old);
    expect(paperRunLive(dir, Date.now())).toBe(false);
    writeFileSync(path.join(dir, PAPER_LOCK.heartbeat), "{}\n");
    writeFileSync(path.join(dir, PAPER_LOCK.lock), `${process.pid}\n`);
    expect(paperRunLive(dir, Date.now())).toBe(false);
  });

  it("waits a minute at a time while it is live, and gives up after 6 hours", async () => {
    const dir = tmp("state");
    const holder = sleeper();
    writeFileSync(path.join(dir, PAPER_LOCK.lock), `${holder.pid}\n`);
    let t = Date.now();
    const slept: number[] = [];
    const clock = {
      now: () => t,
      sleep: (ms: number) => {
        slept.push(ms);
        t += ms;
        // The heartbeat stays fresh in the fake clock's time.
        const fresh = new Date(t);
        writeFileSync(path.join(dir, PAPER_LOCK.heartbeat), "{}\n");
        utimesSync(path.join(dir, PAPER_LOCK.heartbeat), fresh, fresh);
        return Promise.resolve();
      },
    };
    writeFileSync(path.join(dir, PAPER_LOCK.heartbeat), "{}\n");
    utimesSync(path.join(dir, PAPER_LOCK.heartbeat), new Date(t), new Date(t));
    expect(await waitForPaper(dir, log, clock)).toBe(false);
    expect(slept).toHaveLength(PAPER_WAIT_MS / PAPER_CHECK_EVERY_MS);
    expect(new Set(slept)).toEqual(new Set([PAPER_CHECK_EVERY_MS]));

    slept.length = 0;
    let checks = 0;
    const ending = {
      now: () => t,
      sleep: (ms: number) => {
        slept.push(ms);
        t += ms;
        checks += 1;
        if (checks === 2) rmSync(path.join(dir, PAPER_LOCK.lock));
        return Promise.resolve();
      },
    };
    utimesSync(path.join(dir, PAPER_LOCK.heartbeat), new Date(t), new Date(t));
    expect(await waitForPaper(dir, log, ending)).toBe(true);
    expect(slept).toEqual([PAPER_CHECK_EVERY_MS, PAPER_CHECK_EVERY_MS]);
  });
});

describe("MARKET-1's settings (M0, M15)", () => {
  const settings = parseEnv(
    readFileSync(new URL("../../../tools/poller.env", import.meta.url), "utf8"),
  );

  it("takes the run's own settings (tools/poller.env)", () => {
    expect(parseMarket1Config(settings)).toEqual({
      STATE_DIR: "E:\\polymarket-follow-run\\var",
      MARKET1_ROOT: "F:\\polymarket-follow\\market1",
      MARKET1_BACKUP: "E:\\backups\\polymarket-follow\\market1",
      PAPER_ROOT: "F:\\polymarket-follow\\paper",
      RECORDINGS_ROOT: "F:\\polymarket-follow\\recordings",
      MONGO_URI: "mongodb://127.0.0.1:27017",
      MONGO_DB: "polymarket_follow",
    });
  });

  it("refuses MARKET1_ROOT or MARKET1_BACKUP equal to or inside PAPER_ROOT or RECORDINGS_ROOT", () => {
    const issues = (over: Record<string, string>) => {
      try {
        parseMarket1Config({ ...settings, ...over });
        return [];
      } catch (err) {
        return (err as { issues: { path: string[]; message: string }[] })
          .issues;
      }
    };
    const refused = (name: string) => [
      {
        path: [name],
        message: "must lie outside PAPER_ROOT and RECORDINGS_ROOT",
      },
    ];
    for (const [name, value] of [
      ["MARKET1_ROOT", "F:\\polymarket-follow\\paper"],
      ["MARKET1_ROOT", "F:\\polymarket-follow\\paper\\market1"],
      ["MARKET1_ROOT", "F:\\Polymarket-Follow\\Recordings\\m1"],
      ["MARKET1_BACKUP", "F:\\polymarket-follow\\recordings"],
      ["MARKET1_BACKUP", "F:\\polymarket-follow\\paper\\a\\b"],
    ] as const)
      expect(issues({ [name]: value }), `${name} ${value}`).toMatchObject(
        refused(name),
      );
    // Beside the stores, a name that only begins like one: allowed.
    expect(
      issues({
        MARKET1_ROOT: "F:\\polymarket-follow\\paper-market1",
        MARKET1_BACKUP: "F:\\polymarket-follow\\..recordings",
      }),
    ).toEqual([]);
  });
});

describe("MARKET-1's own writes (M15, F2)", () => {
  it("are whole files, and a rename refused while a reader holds the file is tried again", async () => {
    const dir = tmp("write");
    const file = path.join(dir, "page", "index.html");
    writeWhole(file, "one");
    expect(readFileSync(file, "utf8")).toBe("one");
    writeWhole(file, "two");
    expect(readFileSync(file, "utf8")).toBe("two");
    if (process.platform !== "win32") return;
    // Another process holds the file open for 1.5 s (Windows refuses a rename over it).
    const holder = spawn(
      process.execPath,
      [
        "-e",
        `const fs=require("fs");const fd=fs.openSync(${JSON.stringify(file)},"r");process.stdout.write("held\\n");setTimeout(()=>fs.closeSync(fd),1500);`,
      ],
      { stdio: ["ignore", "pipe", "ignore"] },
    );
    children.push(holder);
    await new Promise<void>((resolve) =>
      holder.stdout.once("data", () => resolve()),
    );
    expect(() => writeWhole(file, "three", 1)).toThrow(/EPERM|EACCES|EBUSY/);
    writeWhole(file, "four", 10, 500);
    expect(readFileSync(file, "utf8")).toBe("four");
  });
});
