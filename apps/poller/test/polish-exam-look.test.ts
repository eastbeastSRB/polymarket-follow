/**
 * The exam's look on a FRESH world (src/polish/exam/steps.ts `stepOne`,
 * look.ts; polish/rules.md P1–P8, P14, P15; THE PLAN D9, D16, D47, D48,
 * D53b, T11, T12; test/polish-exam-world.ts): step 1 extracts FRESH under
 * the open seal, holds it whole, places the four lines, reads the safety net
 * once, counts, lists the book files N's legs on the deciding days need, and
 * stops with books needed (exit 5); its refusals: the exam's seal closed
 * (exit 4), the reproduction not passed by this program, step 1 already
 * run (exit 5), FRESH's store failing its integrity (exit 6), cuts.json
 * not N's (exit 6). Run in `pnpm verify`'s order: one test runs the build.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadResearch, type Research } from "../src/paper/research.js";
import { SAFETY_NET } from "../src/polish/exam/design.js";
import {
  BOOKS_NEEDED,
  INTEGRITY,
  LOOK1,
  STEP1,
  stepOne,
  type LookInput,
} from "../src/polish/exam/steps.js";
import { ExamUnfrozen, GateFailed, exitOf } from "../src/polish/run.js";
import { SEALED, type Seal } from "../src/polish/seal.js";
import { loadCoins } from "../src/waveh/coins.js";
import { PACKAGE_ROOT } from "../src/waveh/gate.js";
import { bookKey } from "../src/waveh/keys.js";
import { BooksNeeded } from "../src/waveh/legs.js";
import { AlreadyRun } from "../src/waveh/run.js";
import { StoreError } from "../src/waveh/store.js";
import {
  HOLE,
  LOOK_RANGE,
  LOOK_RECIPE,
  analyzerWorld,
  at,
  rawWorld,
} from "./polish-exam-world.js";
import { sha } from "./polish-tries-store.js";
import { cleanScratch, scratch } from "./waveh-world.js";

afterAll(cleanScratch, 120_000);

const OPEN: Seal = { examFrozen: true };
const CODE = "4".repeat(64);
const FREEZE = { sha256: "6".repeat(64), tag: "polish-freeze-1" };
const coins = loadCoins();
const tmp = (name: string) => {
  const d = mkdtempSync(path.join(tmpdir(), `polish-${name}-`));
  scratch.push(d);
  return d;
};
/** repro.json as the reproduction writes it, passed by `code` or not. */
const reproFile = (root: string, passed = true, code = CODE) => {
  const text = JSON.stringify({
    step: "reproduce",
    identity: { code },
    passed,
  });
  writeFileSync(path.join(root, "repro.json"), text);
  return sha(text);
};

describe("the look's step 1 (exam --step 1)", { timeout: 120_000 }, () => {
  let kit: Research;
  let w: ReturnType<typeof rawWorld>;
  let a: ReturnType<typeof analyzerWorld>;
  let root = "";
  let repro = "";
  let error: unknown;
  const input = (r: string, over: Partial<LookInput> = {}): LookInput => ({
    analyzer: a.analyzer,
    root: r,
    coins,
    kit,
    code: CODE,
    wavehFrozen: "5".repeat(64),
    cutsFile: a.cutsFile,
    design: a.design,
    log: () => {},
    fresh: w.store,
    list: w.list,
    listSha256: w.listSha256,
    range: LOOK_RANGE,
    seal: OPEN,
    freeze: FREEZE,
    known: [],
    workers: 0,
    pace: () => Promise.resolve(),
    ...over,
  });
  const read = (name: string) =>
    JSON.parse(readFileSync(path.join(root, LOOK1, name), "utf8")) as Record<
      string,
      unknown
    > & { counts: Record<string, unknown> };
  const failure = (p: Promise<unknown>) => p.catch((e: unknown) => e);

  beforeAll(async () => {
    kit = await loadResearch();
    w = rawWorld();
    a = analyzerWorld();
    root = tmp("look-root");
    repro = reproFile(root);
    error = await failure(stepOne(input(root)));
  }, 120_000);

  it("extracts FRESH, holds it whole, and stops with books needed (exit 5), listing the book files of N's legs on the deciding days", () => {
    expect(error).toBeInstanceOf(BooksNeeded);
    expect(exitOf(error)).toEqual({ code: 5, event: "books needed" });
    expect((error as Error).message).toBe(
      "step 1 done: 4 book files listed in look1\\books-needed.txt",
    );
    // B's legs (SOL) and E's (HYPE); not A's (cut), C's (slice 40) nor D's (left out).
    const keys = readFileSync(path.join(root, LOOK1, BOOKS_NEEDED), "utf8");
    expect(keys).toBe(
      `${[
        bookKey("SOL", at("18T01:00:00")),
        bookKey("HYPE", at("18T08:00:00")),
        bookKey("SOL", at("19T01:00:00")),
        bookKey("HYPE", at("19T08:00:00")),
      ].join("\n")}\n`,
    );
    expect(keys).toContain("market_data/20260718/1/l2Book/SOL.lz4");
    expect(read(INTEGRITY)).toMatchObject({
      pass: true,
      whole: { problems: [], storeCode: CODE, thisCode: CODE },
      pairing: { problems: [], straddled: 0, edges: [], found: [] },
    });
  });

  it("writes step1.json: its identity, the deciding line by the safety net, the positions by line and where, and their SHA-256", () => {
    const s = read(STEP1);
    expect(Object.keys(s).slice(0, 2)).toEqual(["step", "identity"]);
    expect(s.identity).toEqual({
      code: CODE,
      wavehFrozen: "5".repeat(64),
      store: a.design.explored.store,
      gates: a.design.explored.gates,
      exam: FREEZE,
      freshList: w.listSha256,
      freshStore: sha(readFileSync(path.join(root, "store", "manifest.json"))),
      repro,
    });
    expect(s.inputs).toEqual({
      choice: a.design.explored.choice,
      cuts: a.design.explored.cuts,
      recipe: LOOK_RECIPE,
    });
    expect(s.integrity).toBe(
      sha(readFileSync(path.join(root, LOOK1, INTEGRITY))),
    );
    // The 715 line on the deciding days, not left out, is B alone: the safety net hands the exam to N.
    expect(s.deciding).toEqual({
      line: "N",
      why: `the 715 line spans 1 UTC days and 1 coins on the deciding days; ${SAFETY_NET.days} and ${SAFETY_NET.coins} are needed`,
      days: 1,
      coins: 1,
    });
    expect(s.positions).toEqual({ "715": 2, N: 5, "1391": 1, B0: 5 });
    expect(s.featureUnknown).toEqual({ "715": {}, N: {}, "1391": {}, B0: {} });
    expect(s.booksNeeded).toBe(4);
    expect(s.positionsSha256).toMatch(/^[0-9a-f]{64}$/);
    expect(s.counts.positions).toEqual({
      "715": { "segment 1": 2 },
      N: { "cut: a day without books": 1, "segment 1": 4 },
      "1391": { "segment 1": 1 },
      B0: { "cut: a day without books": 1, "segment 1": 4 },
    });
    expect(s.counts.left).toEqual({
      "715": {},
      N: { "a hole in the hour up to t": 1 },
      "1391": {},
      B0: { "a hole in the hour up to t": 1 },
    });
    // E's funding row at 10:00 has no price at 09:59; SOL's minutes are all priced.
    expect(s.counts.fundingWithoutPrice).toEqual({
      "715": 0,
      N: 1,
      "1391": 0,
      B0: 1,
    });
  });

  it("counts the files, the holes, the days of asset_ctxs, the minutes by the trade fallback and without a price, and F7's days with their shares", () => {
    const c = read(STEP1).counts;
    expect(c.files).toBe(LOOK_RANGE.fill.length);
    expect(c.blocks).toEqual({ missing: {}, back: 0 });
    expect(Object.keys(c.days as object)).toEqual([
      "2026-07-17",
      "2026-07-18",
      "2026-07-19",
    ]);
    expect(c.holes).toEqual([
      [new Date(HOLE[0]).toISOString(), new Date(HOLE[1]).toISOString()],
    ]);
    expect(c.ctxsByDay).toEqual({
      "2026-07-17": { rows: 0, failed: 0, offMinute: 0, late: 0, twice: 0 },
    });
    expect(Object.keys(c.ctxsAbsent as object)).toEqual(["2026-07-19"]);
    const byCoin = (c.prices as { byCoin: Record<string, unknown> }).byCoin;
    // BTC and SOL trade every 30 s from 07-17 09:00 to 07-19 12:59:30; a trade prices its minute and the next four.
    for (const coin of ["BTC", "SOL"])
      expect(byCoin[coin], coin).toEqual({
        "2026-07-17": [900, 540],
        "2026-07-18": [1440, 0],
        "2026-07-19": [784, 656],
      });
    // HYPE trades at 04:50, 04:52, 04:54, 05:00, 07:58 and 08:00 of 07-18: 9 + 5 + 7 minutes.
    expect(byCoin.HYPE).toEqual({
      "2026-07-17": [0, 1440],
      "2026-07-18": [21, 1419],
      "2026-07-19": [0, 1440],
    });
    const f7 = c.f7 as Record<string, { why: string[] }>;
    expect(Object.keys(f7)).toEqual([
      "2026-07-08",
      "2026-07-12",
      "2026-07-13",
      "2026-07-14",
      "2026-07-15",
      "2026-07-16",
      "2026-07-17",
      "2026-07-18",
      "2026-07-19",
    ]);
    expect(f7["2026-07-08"]).toEqual({
      why: ["no books (the archive's listing of 2026-11-13)"],
      "715": { positions: 0, share: 0 },
      N: { positions: 0, share: 0 },
    });
    // On the deciding days before option B's cut: the 715 line B; N A, B, E and D.
    expect(f7["2026-07-17"]).toEqual({
      why: ["no books (the archive's listing of 2026-11-13)"],
      "715": { positions: 0, share: 0 },
      N: { positions: 1, share: 0.25 },
    });
    expect(f7["2026-07-18"]).toEqual({
      why: ["no asset_ctxs file"],
      "715": { positions: 1, share: 1 },
      N: { positions: 4, share: 1 },
    });
    expect(f7["2026-07-19"]).toMatchObject({
      "715": { positions: 1, share: 1 },
      N: { positions: 3, share: 0.75 },
    });
    expect(f7["2026-07-19"]!.why).toHaveLength(1);
    expect(f7["2026-07-19"]!.why[0]).toMatch(
      /^asset_ctxs read as absent: .*asset_ctxs header/,
    );
  });

  it("refuses with the exam's seal closed (exit 4), before anything is read or written", async () => {
    const r = tmp("look-root");
    reproFile(r);
    const e = await failure(stepOne(input(r, { seal: SEALED })));
    expect(e).toBeInstanceOf(ExamUnfrozen);
    expect(exitOf(e)).toEqual({
      code: 4,
      event: "the exam's freeze does not verify",
    });
    expect(existsSync(path.join(r, "store"))).toBe(false);
    expect(existsSync(path.join(r, LOOK1))).toBe(false);
  });

  it("refuses without repro.json, with one not passed or passed by other code (exit 5), before anything is written", async () => {
    for (const [prepare, message] of [
      [() => {}, "no repro.json in EXAM_ROOT: the reproduction runs first"],
      [
        (r: string) => reproFile(r, false),
        `repro.json is not a reproduction this program passed (passed false, by ${CODE})`,
      ],
      [
        (r: string) => reproFile(r, true, "7".repeat(64)),
        `repro.json is not a reproduction this program passed (passed true, by ${"7".repeat(64)})`,
      ],
    ] as const) {
      const r = tmp("look-root");
      prepare(r);
      const e = await failure(stepOne(input(r)));
      expect(e, message).toBeInstanceOf(StoreError);
      expect((e as Error).message).toBe(message);
      expect(exitOf(e).code).toBe(5);
      expect(existsSync(path.join(r, "store")), message).toBe(false);
    }
  });

  it("refuses a second step 1 (exit 5, already run), its files untouched", async () => {
    const before = readFileSync(path.join(root, LOOK1, STEP1));
    const e = await failure(stepOne(input(root)));
    expect(e).toBeInstanceOf(AlreadyRun);
    expect(exitOf(e)).toEqual({ code: 5, event: "already run" });
    expect(readFileSync(path.join(root, LOOK1, STEP1)).equals(before)).toBe(
      true,
    );
  });

  it("refuses cuts.json whose W4 is not N's (exit 6) before the extraction", async () => {
    const r = tmp("look-root");
    reproFile(r);
    const e = await failure(
      stepOne(
        input(r, {
          design: { ...a.design, recipe: { ...LOOK_RECIPE, n: 3 } },
        }),
      ),
    );
    expect(e).toBeInstanceOf(GateFailed);
    expect((e as Error).message).toBe("polish/cuts.json's W4 is not N's cut 3");
    expect(existsSync(path.join(r, "store"))).toBe(false);
  });

  it("stops at a store failing its integrity (exit 6): integrity.json lists every problem, and no step1.json is written", async () => {
    const r = tmp("look-root");
    reproFile(r);
    const ruled = {
      file: LOOK_RANGE.fill[3]!,
      coin: "SOL",
      tid: "7",
      side: "taker" as const,
      ruled: "2026-11-25",
    };
    const e = await failure(stepOne(input(r, { known: [ruled] })));
    expect(e).toBeInstanceOf(GateFailed);
    expect(exitOf(e).code).toBe(6);
    expect((e as Error).message).toBe(
      "FRESH's store failed its integrity: see look1\\integrity.json",
    );
    const integrity = JSON.parse(
      readFileSync(path.join(r, LOOK1, INTEGRITY), "utf8"),
    ) as { pass: boolean; pairing: { problems: string[] } };
    expect(integrity.pass).toBe(false);
    expect(integrity.pairing.problems).toEqual([
      `${ruled.file} SOL 7: listed as 1 taker unpaired, not found`,
    ]);
    expect(existsSync(path.join(r, LOOK1, STEP1))).toBe(false);
    expect(existsSync(path.join(r, LOOK1, BOOKS_NEEDED))).toBe(false);
  });

  it("the built program refuses step 1 without FRESH's raw store, or with another folder (exit 2)", () => {
    const program = path.join(PACKAGE_ROOT, "dist", "polish.js");
    const env = {
      ANALYZER_ROOT: tmp("exam-analyzer"),
      EXAM_ROOT: tmp("exam-root"),
    };
    for (const [FRESH_STORE, why] of [
      ["", "FRESH_STORE"],
      [tmp("other"), "is not FRESH's raw store"],
    ] as const) {
      const r = spawnSync(process.execPath, [program, "exam", "--step", "1"], {
        env: { ...process.env, ...env, FRESH_STORE },
        encoding: "utf8",
        timeout: 60_000,
      });
      expect(r.status, why).toBe(2);
      expect(r.stderr, why).toContain(why);
    }
  }, 60_000);
});
