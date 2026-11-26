/**
 * COPY-H's built program (dist/copyh.js and dist/copyh/main.js; rules.md
 * C15), spawned: a heap flag, a COPYH_HEAP_GB of another form, an unknown
 * command or option and bad settings refused (exit 2) before anything is
 * opened; S's range sealed before the freeze (exit 5), nothing written there;
 * a gated command stopped by the gate (exit 4) while the freeze does not
 * verify, asked through the gate itself (code-rules, POLISH-FIX); `coins`
 * writing coins.json from a stored meta reply held to its manifest line, the
 * program's heap ceiling exactly design.ts's, and refusing a reply that
 * differs or a manifest without exactly one line for it (exit 5); a build
 * over a built store refused (exit 5); `reproduce` refused without
 * PAPER_SEED (exit 2) and its seed folder sealed by name (exit 5). Run in
 * `pnpm verify`'s order: the
 * build first.
 */
import { spawnSync } from "node:child_process";
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
import { META_KEY, coinsFromMeta } from "../src/copyh/coins.js";
import { WORKER_HEAP_GB } from "../src/copyh/design.js";
import { verifyFreeze } from "../src/copyh/gate.js";
import { PACKAGE_ROOT, sha256 } from "../src/copyh/run.js";
import { heapLimitOf } from "./copyh-world.js";

const BUILT = existsSync(path.join(PACKAGE_ROOT, "dist", "copyh", "main.js"));

/** A run's folders: COPY-H's, WAVE-H's raw store, the funding store and FRESH's, all empty. */
function folders() {
  const root = mkdtempSync(path.join(tmpdir(), "copyh-main-"));
  const f = {
    COPYH_ROOT: path.join(root, "COPY-H"),
    WAVEH_STORE: path.join(root, "WAVE-H", "store"),
    COPYH_FUNDING: path.join(root, "COPY-H", "funding"),
    FRESH_STORE: path.join(root, "FRESH", "store"),
    FRESH2_STORE: path.join(root, "FRESH-2", "store"),
  };
  for (const d of Object.values(f)) mkdirSync(d, { recursive: true });
  return f;
}

/** The built program, its environment ours but for the settings given. */
function run(
  args: readonly string[],
  env: Record<string, string>,
  node: readonly string[] = [],
) {
  const base = Object.fromEntries(
    Object.entries(process.env).filter(
      ([k]) =>
        !k.startsWith("COPYH_") &&
        k !== "WAVEH_STORE" &&
        k !== "FRESH_STORE" &&
        k !== "FRESH2_STORE" &&
        k !== "PAPER_SEED" &&
        k !== "NODE_OPTIONS",
    ),
  );
  const r = spawnSync(
    process.execPath,
    [...node, path.join(PACKAGE_ROOT, "dist", "copyh.js"), ...args],
    { env: { ...base, ...env }, encoding: "utf8", timeout: 50_000 },
  );
  return { code: r.status, stderr: r.stderr };
}
type LogLine = { msg: string; why?: string; heapLimitMB?: number };
/** The log's lines of a run (one UTC day's file). */
function logOf(root: string): LogLine[] {
  const dir = path.join(root, "logs");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((f) =>
    readFileSync(path.join(dir, f), "utf8")
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => JSON.parse(l) as LogLine),
  );
}

/** COPYH-FUNDING's store in a run's folders: the meta reply and the manifest text given. */
function fundingStore(
  f: ReturnType<typeof folders>,
  meta: Buffer,
  manifest: (line: string) => string,
) {
  mkdirSync(path.join(f.COPYH_FUNDING, "info"), { recursive: true });
  writeFileSync(path.join(f.COPYH_FUNDING, ...META_KEY.split("/")), meta);
  const line = {
    key: META_KEY,
    bytes: meta.length,
    sha256: sha256(meta),
    fetchedAt: "2026-11-25T21:12:00.000Z",
  };
  writeFileSync(
    path.join(f.COPYH_FUNDING, "manifest.jsonl"),
    manifest(`${JSON.stringify(line)}\n`),
  );
  return line;
}

describe.runIf(BUILT)("the built program", { timeout: 60_000 }, () => {
  it("refuses a heap flag, on the command line or in NODE_OPTIONS, and a COPYH_HEAP_GB of another form, before it opens anything", () => {
    const f = folders();
    for (const form of [
      "--max-old-space-size=512",
      "--max_old_space_size=512",
    ]) {
      const flag = run(["coins"], f, [form]);
      expect(flag.code, form).toBe(2);
      expect(flag.stderr, form).toContain(
        "a heap flag overrides every worker's ceiling",
      );
    }
    const options = run(["coins"], {
      ...f,
      NODE_OPTIONS: "--max-old-space-size=512",
    });
    expect(options.code).toBe(2);
    for (const v of ["4", "2", "x"]) {
      const heap = run(["coins"], { ...f, COPYH_HEAP_GB: v });
      expect(heap.code, v).toBe(2);
      expect(heap.stderr, v).toContain(`COPYH_HEAP_GB=${v}: a whole number`);
    }
    expect(existsSync(path.join(f.COPYH_ROOT, "logs"))).toBe(false);
  });

  it("refuses an unknown command or option and bad settings (exit 2)", () => {
    const f = folders();
    for (const [args, why] of [
      [["nothing"], 'the command "nothing"'],
      [["count"], "count needs --range"],
      [["build", "--range", "X"], 'the option "--range"'],
      [["build", "--range", "E", "--minutes", "15"], 'the option "--minutes"'],
      [["build", "--range", "E", "--workers", "0"], 'the option "--workers"'],
      [["build", "--range", "E", "--workers", "17"], 'the option "--workers"'],
      [["build", "--range", "E", "--twin", "--twin"], 'the option "--twin"'],
      [["coins", "--twin"], 'the option "--twin"'],
    ] as const) {
      const r = run(args, f);
      expect(r.code, args.join(" ")).toBe(2);
      expect(r.stderr, args.join(" ")).toContain(why);
    }
    const bad = run(["build", "--range", "E"], { ...f, WAVEH_STORE: "x" });
    expect([bad.code, bad.stderr.includes("not an absolute path")]).toEqual([
      2,
      true,
    ]);
    const without = (k: string) =>
      Object.fromEntries(Object.entries(f).filter(([x]) => x !== k));
    const noFunding = without("COPYH_FUNDING");
    expect(run(["coins"], noFunding).stderr).toContain(
      "coins needs COPYH_FUNDING",
    );
    expect(run(["build", "--range", "S"], without("FRESH_STORE")).code).toBe(2);
    expect(run(["reproduce"], f).stderr).toContain(
      "reproduce needs PAPER_SEED",
    );
    expect(run(["reproduce", "--twin"], f).stderr).toContain(
      'the option "--twin"',
    );
  });

  it("seals the reproduction's seed folder by its name (exit 5), having written nothing", () => {
    const f = folders();
    const seed = path.join(path.dirname(f.COPYH_ROOT), "ANALYZER", "seed");
    mkdirSync(seed, { recursive: true });
    const r = run(["reproduce"], { ...f, PAPER_SEED: seed });
    expect(r.code).toBe(5);
    expect(r.stderr).toContain("not ready");
    expect(existsSync(path.join(f.COPYH_ROOT, "repro.json"))).toBe(false);
  });

  it("seals S's range before the freeze (exit 5), and writes nothing there", () => {
    const f = folders();
    for (const c of ["build", "count", "integrity"]) {
      const r = run([c, "--range", "S"], f);
      expect(r.code, c).toBe(5);
      expect(r.stderr, c).toContain("sealed until step 2");
    }
    expect(existsSync(path.join(f.COPYH_ROOT, "S"))).toBe(false);
  });

  it("seals FRESH-2's range before its freeze (exit 5), and writes nothing there", () => {
    const f = folders();
    for (const c of ["build", "count", "integrity"]) {
      const r = run([c, "--range", "FRESH-2"], f);
      expect(r.code, c).toBe(5);
      expect(r.stderr, c).toContain("sealed until FRESH-2's freeze");
    }
    expect(existsSync(path.join(f.COPYH_ROOT, "FRESH-2"))).toBe(false);
  });

  it("refuses the integrity of a store not built (exit 5)", () => {
    const f = folders();
    expect(run(["integrity", "--range", "burnin"], f).code).toBe(5);
    expect(logOf(f.COPYH_ROOT).at(-1)).toMatchObject({ msg: "not ready" });
  });

  it("stops a gated command at the gate while the freeze does not verify (exit 4), having read nothing", () => {
    const f = folders();
    for (const c of ["step1", "tries", "choice", "step2", "fresh2"] as const) {
      if (verifyFreeze(PACKAGE_ROOT, c).ok) continue;
      const r = run([c], f);
      expect(r.code, c).toBe(4);
    }
    const lines = logOf(f.COPYH_ROOT);
    expect(lines.filter((l) => l.msg === "frozen files differ").length).toBe(
      ["step1", "tries", "choice", "step2", "fresh2"].filter(
        (c) => !verifyFreeze(PACKAGE_ROOT, c as "step1").ok,
      ).length,
    );
  });

  it("refuses a funding manifest that holds the meta reply's line twice or not at all (exit 5)", () => {
    for (const times of [2, 0]) {
      const f = folders();
      fundingStore(f, Buffer.from('{"universe":[]}'), (line) =>
        line.repeat(times),
      );
      expect(run(["coins"], f).code, String(times)).toBe(5);
      expect(logOf(f.COPYH_ROOT).at(-1)?.why, String(times)).toContain(
        `${times} lines for ${META_KEY}`,
      );
    }
  });

  it("refuses a build over a built store (exit 5, already run) before it reads a list", () => {
    const f = folders();
    const store = path.join(f.COPYH_ROOT, "burnin", "store");
    mkdirSync(store, { recursive: true });
    writeFileSync(path.join(store, "manifest.json"), "{}");
    expect(run(["build", "--range", "burnin"], f).code).toBe(5);
    expect(logOf(f.COPYH_ROOT).at(-1)).toMatchObject({ msg: "already run" });
  });

  it("writes coins.json from the stored meta reply held to its manifest line, and refuses a reply that differs (exit 5)", async () => {
    const f = folders();
    const meta = Buffer.from(
      JSON.stringify({
        universe: [
          { name: "BTC", szDecimals: 5 },
          { name: "MATIC", szDecimals: 1, isDelisted: true },
        ],
        marginTables: [],
      }),
    );
    mkdirSync(path.join(f.COPYH_FUNDING, "info"), { recursive: true });
    writeFileSync(path.join(f.COPYH_FUNDING, ...META_KEY.split("/")), meta);
    const line = {
      key: META_KEY,
      bytes: meta.length,
      sha256: sha256(meta),
      fetchedAt: "2026-11-25T21:12:00.000Z",
    };
    const other = {
      key: "info/fundingHistory/BTC/1751241600000.json",
      bytes: 2,
      sha256: sha256("[]"),
      fetchedAt: "2026-11-25T21:13:00.000Z",
    };
    // A download appending: its last line not whole yet.
    writeFileSync(
      path.join(f.COPYH_FUNDING, "manifest.jsonl"),
      `${JSON.stringify(line)}\n${JSON.stringify(other)}\n{"key":"info/fund`,
    );
    const r = run(["coins"], f);
    expect([r.code, r.stderr]).toEqual([0, ""]);
    // The program's own ceiling is design.ts's: exactly a worker's of WORKER_HEAP_GB × 1,024 MB.
    const start = logOf(f.COPYH_ROOT).find((l) => l.msg === "start coins");
    expect(start?.heapLimitMB).toBe(
      Math.round((await heapLimitOf(WORKER_HEAP_GB * 1024)) / 2 ** 20),
    );
    const written = JSON.parse(
      readFileSync(path.join(f.COPYH_ROOT, "coins.json"), "utf8"),
    ) as unknown;
    expect(written).toEqual(coinsFromMeta(meta, line));
    writeFileSync(path.join(f.COPYH_FUNDING, ...META_KEY.split("/")), "{}");
    expect(run(["coins"], f).code).toBe(5);
    expect(logOf(f.COPYH_ROOT).at(-1)).toMatchObject({
      msg: "not ready",
      why: `${META_KEY} is not the bytes its manifest line names`,
    });
  });
});
