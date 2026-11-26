/**
 * The pass and its parts (src/copyh/pass.ts, part.ts; rules.md C3, C15):
 * a made-up store's files in both formats, the switch hour's two files among
 * them, into parts, in this thread and through the worker pool (the build's
 * worker, byte for byte the same); a pass stopped by its minutes and resumed
 * equal to an unbroken one, byte for byte; a part redone for other code or
 * other lists; a bit flipped in any stretch of a part caught; the refusals:
 * a file that differs from its list, a sealed path or key, a path outside the
 * run's roots, the 1% day rule.
 */
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SWITCH_HOUR, WORKER_HEAP_GB } from "../src/copyh/design.js";
import {
  partFile,
  readPartHeader,
  readStretch,
  usersOf,
  valuesIn,
} from "../src/copyh/part.js";
import {
  WORKER_FILE,
  runPass,
  type FileTask,
  type PassLists,
} from "../src/copyh/pass.js";
import { NotFinished, StoreError, sha256 } from "../src/copyh/run.js";
import { SealedError } from "../src/copyh/seal.js";
import { HOUR_MS } from "../src/schedule.js";
import {
  COINS,
  DIRS,
  LIST_HASHES,
  addr,
  byBlock,
  keyOf,
  makeStore,
  record,
  trade,
} from "./copyh-world.js";

const LISTS: PassLists = {
  iids: COINS.map((c, i) => [c, i] as const),
  kinds: DIRS,
  hashes: LIST_HASHES,
};
const never = { stop: () => null };
/** A budget that lets `n` files start, then says its minutes are spent. */
const after = (n: number) => {
  let calls = 0;
  return { stop: () => (calls++ >= n ? "its minutes are spent" : null) };
};
const parts = () => mkdtempSync(path.join(tmpdir(), "copyh-parts-"));

/** Three hours of files: the switch hour in both formats, an hour before it, one after. */
function world(extra: Map<string, string> = new Map()) {
  const h0 = SWITCH_HOUR - HOUR_MS;
  const lines = (t: number, n: number) =>
    Array.from({ length: n }, (_, i) =>
      trade(addr(1 + (i % 7)), addr(300 + (i % 5)), {
        coin: COINS[i % COINS.length]!,
        side: i % 2 === 0 ? "A" : "B",
        time: t + i * 1000,
        tid: t / 1000 + i,
      }),
    ).flat();
  const files = new Map<string, string>([
    [keyOf(h0, "node_fills"), `${lines(h0, 30).join("\n")}\n`],
    [
      keyOf(SWITCH_HOUR, "node_fills"),
      `${lines(SWITCH_HOUR, 20).join("\n")}\n`,
    ],
    [
      keyOf(SWITCH_HOUR, "node_fills_by_block"),
      `${[
        byBlock(7, lines(SWITCH_HOUR + 50 * 60_000, 6)),
        byBlock(8, [
          record(addr(9), {
            coin: "@5",
            side: "A",
            time: SWITCH_HOUR + 3_100_000,
            crossed: true,
            tid: 1,
          }),
        ]),
      ].join("\n")}\n`,
    ],
    [
      keyOf(SWITCH_HOUR + HOUR_MS, "node_fills_by_block"),
      `${byBlock(9, lines(SWITCH_HOUR + HOUR_MS, 10)).replace(/"fee":"0.009"/g, '"fee":"-0.001"')}\n`,
    ],
    ...extra,
  ]);
  const s = makeStore(files);
  const tasks: FileTask[] = [...files.keys()].map((key, index) => ({
    index,
    key,
    sha256: s.list.get(key)!,
  }));
  return { ...s, tasks };
}

const pass = (
  w: ReturnType<typeof world>,
  dir: string,
  o: {
    workers?: number;
    code?: string;
    lists?: PassLists;
    budget?: { stop: () => string | null };
    tasks?: FileTask[];
  } = {},
) =>
  runPass({
    store: w.store,
    parts: dir,
    files: o.tasks ?? w.tasks,
    start: SWITCH_HOUR - HOUR_MS,
    end: SWITCH_HOUR + 2 * HOUR_MS,
    code: o.code ?? "code-a",
    lists: o.lists ?? LISTS,
    workers: o.workers ?? 0,
    roots: [w.root],
    budget: o.budget ?? never,
    log: () => {},
  });

const bytesOfParts = (dir: string) =>
  readdirSync(dir)
    .sort()
    .map((f) => [f, sha256(readFileSync(path.join(dir, f)))]);

describe("the pass", { timeout: 60_000 }, () => {
  it("writes each file's part with its rows, counts and lists, and resumes without redoing one of the same code and lists", async () => {
    const w = world();
    const dir = parts();
    const first = await pass(w, dir);
    expect(first).toMatchObject({
      files: 4,
      skipped: 0,
      extracted: 4,
      failed: 0,
    });
    expect(first.seen).toBe(60 + 40 + 12 + 1 + 20);
    for (const t of w.tasks) {
      const h = readPartHeader(partFile(dir, t.index))!;
      expect(h.header.input).toEqual(t);
      expect(h.header.lists).toEqual(LIST_HASHES);
      const kept = h.header.groups.reduce((n, g) => n + g.rows, 0);
      expect(kept).toBe(h.header.scan.classes.kept);
      // Every group's stretch reads back, its rows' times in the range.
      for (const g of h.header.groups) {
        const st = readStretch(partFile(dir, t.index), h, g);
        const time = valuesIn(st, g.blobs.time!, "f64");
        expect(time.length).toBe(g.rows);
      }
      expect(usersOf(partFile(dir, t.index), h).length).toBe(
        h.header.users.count,
      );
    }
    const again = await pass(w, dir);
    expect(again).toMatchObject({ skipped: 4, extracted: 0 });
    expect(await pass(w, dir, { code: "code-b" })).toMatchObject({
      skipped: 0,
      extracted: 4,
    });
    expect(
      await pass(w, dir, {
        code: "code-b",
        lists: { ...LISTS, hashes: { ...LIST_HASHES, dirs: sha256("other") } },
      }),
    ).toMatchObject({ skipped: 0, extracted: 4 });
  });

  it("reads both formats' files of the switch hour, a spot record left out", async () => {
    const w = world();
    const dir = parts();
    await pass(w, dir);
    const headers = w.tasks.map(
      (t) => readPartHeader(partFile(dir, t.index))!.header,
    );
    expect(headers.map((h) => h.scan.classes.kept)).toEqual([60, 40, 12, 20]);
    expect(headers[2]!.scan.classes.spot).toBe(1);
    expect(headers[2]!.scan.runs).toEqual([[7, 8]]);
  });

  it("stopped by its minutes, ends the files under way, says it is not finished, and resumed gives the unbroken parts byte for byte", async () => {
    const w = world();
    const unbroken = parts();
    await pass(w, unbroken);
    const broken = parts();
    await expect(pass(w, broken, { budget: after(2) })).rejects.toThrow(
      NotFinished,
    );
    expect(readdirSync(broken).sort()).toEqual(["0.part", "1.part"]);
    await expect(pass(w, broken, { budget: after(1) })).rejects.toThrow(
      "the pass stopped with 1 files to go: its minutes are spent",
    );
    expect(await pass(w, broken)).toMatchObject({ skipped: 3, extracted: 1 });
    expect(bytesOfParts(broken)).toEqual(bytesOfParts(unbroken));
  });

  it("catches a bit flipped in any stretch of a part: the addresses, a group, the bars", async () => {
    const w = world();
    const dir = parts();
    await pass(w, dir);
    const file = partFile(dir, 0);
    const whole = readFileSync(file);
    const h = readPartHeader(file)!;
    const group = h.header.groups.find((g) => g.rows > 0)!;
    for (const [name, s] of [
      ["users", h.header.users],
      ["group", group],
      ["bars", h.header.bars],
    ] as const) {
      const flipped = Buffer.from(whole);
      const at = h.start + s.span[0] + Math.floor(s.span[1] / 2);
      flipped[at] = flipped[at]! ^ 1;
      writeFileSync(file, flipped);
      // The header still reads: the resume would keep it; the stretch's hash refuses it.
      expect(readPartHeader(file), name).not.toBeNull();
      expect(() => readStretch(file, readPartHeader(file)!, s), name).toThrow(
        "a stretch's SHA-256 differs from its header's",
      );
    }
    writeFileSync(file, whole.subarray(0, whole.length - 3));
    expect(readPartHeader(file)).toBeNull();
  });

  it("stops at a file that differs from its list, a sealed store, a key of S's months, and a path outside its roots", async () => {
    const w = world();
    const wrong = w.tasks.map((t, i) =>
      i === 1 ? { ...t, sha256: "0".repeat(64) } : t,
    );
    await expect(pass(w, parts(), { tasks: wrong })).rejects.toThrow(
      StoreError,
    );
    await expect(pass(w, parts(), { tasks: wrong })).rejects.toThrow(
      `${w.tasks[1]!.key}: SHA-256 ${w.tasks[1]!.sha256}, the list's ${"0".repeat(64)}`,
    );
    const sealedStore = {
      ...w,
      store: path.join(w.root, "FRESH", "store"),
      root: w.root,
    };
    await expect(pass(sealedStore, parts())).rejects.toThrow(SealedError);
    const late = [
      {
        index: 0,
        key: "node_fills_by_block/hourly/20260529/2.lz4",
        sha256: "a".repeat(64),
      },
    ];
    await expect(pass(w, parts(), { tasks: late })).rejects.toThrow(
      "dated at or after END_E, S's months, sealed until step 2",
    );
    const outside = { ...w, root: path.join(w.root, "elsewhere") };
    await expect(pass(outside, parts())).rejects.toThrow(
      "outside the run's folders",
    );
  });

  it("stops on the day rule: more than 1%, and at least 10, of a day's records failing", async () => {
    const t = SWITCH_HOUR - HOUR_MS;
    const good = Array.from({ length: 1990 }, (_, i) =>
      record(addr(9), {
        coin: "SOL",
        side: "B",
        time: t + i,
        crossed: false,
        tid: i,
      }),
    );
    const bad = (n: number) => Array.from({ length: n }, () => "not a record");
    const at = (n: number, keep = good) =>
      world(
        new Map([
          [keyOf(t, "node_fills"), `${[...keep, ...bad(n)].join("\n")}\n`],
        ]),
      );
    // The day's other three files add 40 + 13 + 20 records: 2,063 + n in all, judged on the day's whole total.
    const ok = at(20);
    await expect(pass(ok, parts())).resolves.toMatchObject({ failed: 20 });
    const stop = at(21);
    await expect(pass(stop, parts())).rejects.toThrow(
      "21 of 2084 records fail the boundary",
    );
    const few = at(9, good.slice(0, 100));
    await expect(pass(few, parts())).resolves.toMatchObject({ failed: 9 });
    const ten = at(10, good.slice(0, 100));
    await expect(pass(ten, parts())).rejects.toThrow(
      "10 of 183 records fail the boundary",
    );
  });

  it.runIf(existsSync(WORKER_FILE))(
    "through the worker pool writes the same parts byte for byte, each worker with its own ceiling",
    async () => {
      const w = world();
      const here = parts();
      const there = parts();
      await pass(w, here);
      const got = await pass(w, there, { workers: 2 });
      expect(got).toMatchObject({ extracted: 4, skipped: 0 });
      expect(bytesOfParts(there)).toEqual(bytesOfParts(here));
      // Each worker's ceiling is design.ts's, not the process's.
      for (const m of got.peaks.workers) {
        expect(m.heapLimit / 2 ** 20).toBeGreaterThanOrEqual(
          WORKER_HEAP_GB * 1024,
        );
        expect(m.heapLimit / 2 ** 20).toBeLessThan(WORKER_HEAP_GB * 1024 + 512);
      }
      const stopped = parts();
      await expect(
        pass(w, stopped, { workers: 2, budget: after(2) }),
      ).rejects.toThrow(NotFinished);
      expect(await pass(w, stopped, { workers: 2 })).toMatchObject({
        skipped: 2,
        extracted: 2,
      });
      expect(bytesOfParts(stopped)).toEqual(bytesOfParts(here));
    },
    60_000,
  );
});
