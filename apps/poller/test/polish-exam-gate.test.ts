/**
 * The exam's gate and the seal's opening (src/polish/exam/gate.ts,
 * seal.ts, held.ts, tries/books.ts; polish/rules.md P0; decisions
 * 2026-11-19, POLISH-RULES's plan ruled, Q1): the seal opens only on the
 * exam's verified freeze whose tag holds the very list (a temporary git
 * repository), every refusal named; opened, FRESH's paths and keys up to
 * FRESH_END are read, and a key at or after FRESH_END never is; WAVE-H's
 * gate never opens it. The exam's compiled imports reach exactly its
 * closure, each file equal to its own program's freeze. Run in `pnpm
 * verify`'s order: the build first.
 */
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  rmdirSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  EXAM_CLOSURE,
  EXAM_FILES,
  EXAM_FROZEN_FILE,
  examFiles,
  sealOf,
  verifyExamFreeze,
} from "../src/polish/exam/gate.js";
import { readHeld } from "../src/polish/held.js";
import { FRESH_RANGE, WAVEH_RANGE } from "../src/polish/range.js";
import {
  FRESH_END,
  SEALED,
  SealedError,
  checkKey,
  checkPath,
  type Seal,
} from "../src/polish/seal.js";
import { heldBooks } from "../src/polish/tries/books.js";
import { HOUR_MS } from "../src/schedule.js";
import { LZ4JS_FILES, PACKAGE_ROOT } from "../src/waveh/gate.js";
import { DATA_END } from "../src/waveh/instants.js";
import { bookKey, keyDate } from "../src/waveh/keys.js";
import { StoreError, readBookList } from "../src/waveh/store.js";
import { lz4, sha, snapshot } from "./waveh-world.js";

const OPEN: Seal = { examFrozen: true };
const tmp = (name: string) => mkdtempSync(path.join(tmpdir(), `${name}-`));
const fillAt = (t: number) =>
  `node_fills_by_block/hourly/${new Date(t).toISOString().slice(0, 10).replaceAll("-", "")}/${new Date(t).getUTCHours()}.lz4`;

describe("the seal, opened by the exam's gate", () => {
  it("passes FRESH's raw store and the analyzer's FRESH folder by name and through a junction; closed, it refuses them", () => {
    const t = tmp("seal");
    const fresh = path.join(t, "FRESH", "store");
    mkdirSync(fresh, { recursive: true });
    mkdirSync(path.join(t, "WAVE-H"));
    const junction = path.join(t, "WAVE-H", "store");
    symlinkSync(fresh, junction, "junction");
    try {
      for (const p of [
        "F:\\polymarket-follow-research\\FRESH\\store\\node_fills_by_block\\hourly\\20260601\\3.lz4",
        "F:\\polymarket-follow-research\\ANALYZER\\FRESH\\store\\manifest.json",
        path.join(junction, "a.lz4"),
      ]) {
        expect(() => checkPath(p, OPEN), p).not.toThrow();
        expect(() => checkPath(p, SEALED), p).toThrow(SealedError);
        expect(() => checkPath(p), p).toThrow(SealedError);
      }
    } finally {
      // The junction alone, never what it points at.
      rmdirSync(junction);
    }
  });

  it("passes a key dated after DATA END and before FRESH_END; refuses one at or after FRESH_END, open or closed", () => {
    for (const k of [
      fillAt(DATA_END + HOUR_MS),
      fillAt(FRESH_END - HOUR_MS),
      "asset_ctxs/20261115.csv.lz4",
      `info/fundingHistory/SOL/${DATA_END + 160 * 86_400_000}.json`,
      bookKey("SOL", FRESH_END - HOUR_MS),
    ]) {
      expect(() => checkKey(k, OPEN), k).not.toThrow();
      expect(() => checkKey(k), k).toThrow("after DATA END");
    }
    for (const k of [
      fillAt(FRESH_END),
      "asset_ctxs/20261116.csv.lz4",
      `info/fundingHistory/SOL/${FRESH_END}.json`,
      bookKey("SOL", FRESH_END),
    ]) {
      expect(() => checkKey(k, OPEN), k).toThrow(
        "at or after FRESH_END, after every month the exam reads",
      );
      expect(() => checkKey(k), k).toThrow("at or after FRESH_END");
    }
    expect(() => checkKey("node_fills/hourly/2025061/3.lz4", OPEN)).toThrow(
      "no date",
    );
    expect(FRESH_END).toBe(Date.parse("2026-11-16T00:00:00Z"));
  });

  it("passes, closed, a key dated at DATA END exactly: WAVE-H's last fill file, which the ten months' extraction reads", () => {
    const last = WAVEH_RANGE.fill.at(-1)!;
    expect(keyDate(last)).toBe(DATA_END);
    expect(() => checkKey(last)).not.toThrow();
    expect(() => checkKey(last, SEALED)).not.toThrow();
    expect(() => checkKey(FRESH_RANGE.fill[0]!)).toThrow("after DATA END");
  });

  it("is never opened by WAVE-H's gate", () => {
    const wavehOpen = { open: true };
    // @ts-expect-error WAVE-H's gate is not the exam's seal
    expect(() => checkKey(fillAt(DATA_END + HOUR_MS), wavehOpen)).toThrow(
      SealedError,
    );
    expect(() =>
      // @ts-expect-error WAVE-H's gate is not the exam's seal
      checkPath("F:\\x\\FRESH\\store\\a.lz4", wavehOpen),
    ).toThrow(SealedError);
  });

  it("reads a FRESH file held to its hash only when open; closed, it opens nothing", () => {
    const store = path.join(tmp("raw"), "FRESH", "store");
    const key = fillAt(Date.parse("2026-06-01T03:00:00Z"));
    const bytes = lz4("synthetic");
    mkdirSync(path.join(store, ...path.dirname(key).split("/")), {
      recursive: true,
    });
    writeFileSync(path.join(store, ...key.split("/")), bytes);
    expect(() => readHeld(store, key, sha(bytes))).toThrow(
      "FRESH is sealed until the polishing's exam is frozen",
    );
    expect(readHeld(store, key, sha(bytes), OPEN).equals(bytes)).toBe(true);
    expect(() => readHeld(store, key, "0".repeat(64), OPEN)).toThrow(
      StoreError,
    );
    expect(() => readHeld(store, key, undefined, OPEN)).toThrow(
      `${key}: not in the list`,
    );
    // Elsewhere, the key alone seals it.
    const other = path.join(tmp("raw"), "store");
    mkdirSync(path.join(other, ...path.dirname(key).split("/")), {
      recursive: true,
    });
    writeFileSync(path.join(other, ...key.split("/")), bytes);
    expect(() => readHeld(other, key, sha(bytes))).toThrow("after DATA END");
    expect(readHeld(other, key, sha(bytes), OPEN).equals(bytes)).toBe(true);
  });

  it("gives a FRESH leg its book only when open; at FRESH_END never", async () => {
    const raw = tmp("books");
    const x = Date.parse("2026-06-01T10:20:00Z");
    const hour = Math.floor(x / HOUR_MS) * HOUR_MS;
    const lines: string[] = [];
    for (const [h, t] of [
      [hour, x - 1_000],
      [FRESH_END, FRESH_END + 1_000],
    ] as const) {
      const key = bookKey("SOL", h);
      const b = lz4(snapshot("SOL", t));
      mkdirSync(path.join(raw, ...path.dirname(key).split("/")), {
        recursive: true,
      });
      writeFileSync(path.join(raw, ...key.split("/")), b);
      lines.push(JSON.stringify({ key, bytes: b.length, sha256: sha(b) }));
    }
    const list = readBookList(`${lines.join("\n")}\n`);
    const pace = () => Promise.resolve();
    const gate = { open: true };
    await expect(heldBooks(raw, gate, list, pace)("SOL", x)).rejects.toThrow(
      "after DATA END",
    );
    await expect(
      heldBooks(raw, gate, list, pace, SEALED)("SOL", x),
    ).rejects.toThrow(SealedError);
    expect(await heldBooks(raw, gate, list, pace, OPEN)("SOL", x)).toEqual({
      book: {
        ts: x - 1_000,
        bids: [[99.9, 1000]],
        asks: [[100.1, 1000]],
      },
    });
    await expect(
      heldBooks(raw, gate, list, pace, OPEN)("SOL", FRESH_END + 2_000),
    ).rejects.toThrow("at or after FRESH_END");
  });
});

/** A git command in a test repository: no user setting, hook, signing or line-ending conversion reaches it. */
function git(cwd: string, ...args: string[]): string {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")),
  );
  const r = spawnSync(
    "git",
    [
      "-c",
      "user.name=test",
      "-c",
      "user.email=test@example.invalid",
      "-c",
      "commit.gpgsign=false",
      "-c",
      "tag.gpgsign=false",
      "-c",
      "core.autocrlf=false",
      "-c",
      "core.hooksPath=no-hooks",
      "-c",
      "init.defaultBranch=main",
      ...args,
    ],
    { cwd, env, encoding: "utf8", timeout: 30_000 },
  );
  if (r.status !== 0)
    throw new Error(`git ${args.join(" ")}: ${r.stderr || r.error?.message}`);
  return r.stdout;
}

describe("the exam's freeze (a temporary git repository)", () => {
  let repo = "";
  let root = "";
  let list = "";
  /** The list's text for the package's files, with these header lines. */
  const listOf = (head: readonly string[]) =>
    `${[
      ...head,
      ...examFiles(root).map(
        (f) => `${sha(readFileSync(path.join(root, f)))} *${f}`,
      ),
    ].join("\n")}\n`;
  const HEAD = [
    "# FROZEN: the exam's files of what runs (polish/rules.md P0)",
    "# tag polish-freeze-1",
  ];
  const listFile = () => path.join(root, EXAM_FROZEN_FILE);
  /** Where a file is moved while it is missing: outside the package, so out of every scope. */
  const away = (full: string) => path.join(repo, `away-${path.basename(full)}`);
  /** Runs `check` on a change made by `change`, then puts every file back. */
  const withChange = (
    change: () => void,
    check: () => void,
    undo: () => void,
  ) => {
    change();
    try {
      check();
    } finally {
      undo();
    }
  };

  beforeAll(() => {
    repo = tmp("exam-repo");
    root = path.join(repo, "apps", "poller");
    const files = [
      "dist/polish.js",
      "dist/polish/main.js",
      "dist/polish/tries/steps.js",
      ...EXAM_CLOSURE,
      "research/kit.js",
      ...LZ4JS_FILES,
      ...EXAM_FILES,
    ];
    for (const f of files) {
      mkdirSync(path.join(root, path.dirname(f)), { recursive: true });
      writeFileSync(path.join(root, f), `synthetic ${f}\n`);
    }
    list = listOf(HEAD);
    writeFileSync(listFile(), list);
    git(repo, "init", "-q");
    git(repo, "add", "-A");
    git(repo, "commit", "-q", "-m", "the freeze");
    git(repo, "tag", "polish-freeze-1");
  }, 60_000);

  it("opens on a verified list whose tag holds it, byte for byte", () => {
    const f = verifyExamFreeze(root);
    expect(f).toEqual({
      ok: true,
      sha256: sha(Buffer.from(list)),
      files: examFiles(root).length,
      tag: "polish-freeze-1",
    });
    expect(examFiles(root)).toContain("dist/polish/tries/steps.js");
    expect(examFiles(root)).not.toContain(EXAM_FROZEN_FILE);
    expect(sealOf(f)).toEqual({ examFrozen: true });
  }, 60_000);

  it("refuses with no list", () => {
    withChange(
      () => renameSync(listFile(), away(listFile())),
      () => {
        const f = verifyExamFreeze(root);
        expect(f).toEqual({
          ok: false,
          problems: [`no ${EXAM_FROZEN_FILE}`],
        });
        expect(sealOf(f)).toEqual({ examFrozen: false });
      },
      () => renameSync(away(listFile()), listFile()),
    );
  }, 60_000);

  it("refuses a file changed, a listed file missing, and a file of what runs not in the list", () => {
    const main = path.join(root, "dist", "polish", "main.js");
    const kit = path.join(root, "research", "kit.js");
    const extra = path.join(root, "dist", "polish", "extra.js");
    withChange(
      () => {
        writeFileSync(main, "changed\n");
        renameSync(kit, away(kit));
        writeFileSync(extra, "extra\n");
      },
      () =>
        expect(verifyExamFreeze(root)).toEqual({
          ok: false,
          problems: [
            "not in the freeze: dist/polish/extra.js",
            "changed: dist/polish/main.js",
            "missing: research/kit.js",
          ],
        }),
      () => {
        writeFileSync(main, "synthetic dist/polish/main.js\n");
        renameSync(away(kit), kit);
        rmSync(extra);
      },
    );
    expect(verifyExamFreeze(root).ok).toBe(true);
  }, 60_000);

  it("refuses a list without a file the exam reads by name, or one of the closure", () => {
    for (const named of [
      "polish/fresh-unpaired.json",
      "dist/waveh/price.js",
      "node_modules/lz4js/xxh32.js",
    ]) {
      const full = path.join(root, named);
      withChange(
        () => {
          renameSync(full, away(full));
          writeFileSync(listFile(), listOf(HEAD));
        },
        () =>
          expect(verifyExamFreeze(root)).toEqual({
            ok: false,
            problems: [
              `not in the freeze: ${named}`,
              `the tag polish-freeze-1 holds another ${EXAM_FROZEN_FILE}`,
            ],
          }),
        () => {
          renameSync(away(full), full);
          writeFileSync(listFile(), list);
        },
      );
    }
  }, 60_000);

  it("refuses a list with no tag line, two, or one of another form, without asking git", () => {
    for (const [head, n] of [
      [[HEAD[0]!], 0],
      [[...HEAD, "# tag polish-freeze-2"], 2],
      [[HEAD[0]!, "# tag waveh-freeze-1"], 0],
      [[HEAD[0]!, "# tag polish-freeze-1 "], 0],
      [[HEAD[0]!, "#tag polish-freeze-1"], 0],
      [[HEAD[0]!, "# tag polish-freeze-01"], 0],
      [[HEAD[0]!, "# tag --output=x"], 0],
    ] as const)
      withChange(
        () => writeFileSync(listFile(), listOf(head)),
        () =>
          expect(verifyExamFreeze(root), head.join("|")).toEqual({
            ok: false,
            problems: [
              `${n} tag lines ("# tag polish-freeze-<n>") in ${EXAM_FROZEN_FILE}, not one`,
            ],
          }),
        () => writeFileSync(listFile(), list),
      );
  }, 60_000);

  it("refuses a tag that does not exist, one that does not hold the list, and a list edited after its tag", () => {
    for (const [text, why] of [
      [
        listOf([HEAD[0]!, "# tag polish-freeze-2"]),
        `the tag polish-freeze-2 does not hold ${EXAM_FROZEN_FILE}`,
      ],
      [
        listOf([`${HEAD[0]!} (edited)`, HEAD[1]!]),
        `the tag polish-freeze-1 holds another ${EXAM_FROZEN_FILE}`,
      ],
      [list.replace("\n", "\r\n"), `the tag polish-freeze-1 holds another`],
    ] as const)
      withChange(
        () => writeFileSync(listFile(), text),
        () => {
          const f = verifyExamFreeze(root);
          expect(f.ok).toBe(false);
          expect(f.ok ? [] : f.problems).toHaveLength(1);
          expect(f.ok ? "" : f.problems[0]).toContain(why);
        },
        () => writeFileSync(listFile(), list),
      );
    // A tag on a commit whose tree has no list.
    const plain = tmp("exam-plain");
    writeFileSync(path.join(plain, "a.txt"), "a\n");
    git(plain, "init", "-q");
    git(plain, "add", "-A");
    git(plain, "commit", "-q", "-m", "no list");
    git(plain, "tag", "polish-freeze-1");
    const pkg = path.join(plain, "pkg");
    mkdirSync(path.dirname(path.join(pkg, EXAM_FROZEN_FILE)), {
      recursive: true,
    });
    writeFileSync(path.join(pkg, EXAM_FROZEN_FILE), "# tag polish-freeze-1\n");
    const f = verifyExamFreeze(pkg);
    expect(f.ok ? [] : f.problems).toContain(
      `the tag polish-freeze-1 does not hold ${EXAM_FROZEN_FILE}`,
    );
    expect(verifyExamFreeze(root).ok).toBe(true);
  }, 60_000);
});

/** The repository files a compiled module's relative imports reach, itself included (as test/waveh-freeze.test.ts walks them). */
function closureOf(starts: readonly string[]): Set<string> {
  const seen = new Set<string>();
  const todo = [...starts];
  while (todo.length > 0) {
    const rel = todo.pop()!;
    if (seen.has(rel)) continue;
    seen.add(rel);
    const text = readFileSync(path.join(PACKAGE_ROOT, rel), "utf8");
    for (const m of text.matchAll(
      /(?:import|export)\s[^;]*?from\s*"(\.{1,2}\/[^"]+)"|import\s*\(\s*"(\.{1,2}\/[^"]+)"\s*\)/g,
    ))
      todo.push(path.posix.join(path.posix.dirname(rel), m[1] ?? m[2]!));
  }
  return seen;
}
const under = (rel: string): string[] =>
  statSync(path.join(PACKAGE_ROOT, rel)).isDirectory()
    ? readdirSync(path.join(PACKAGE_ROOT, rel))
        .sort()
        .flatMap((n) => under(`${rel}/${n}`))
    : [rel];

describe("the exam's closure", () => {
  it("is exactly what the program's compiled files reach outside dist/polish, the shared files aside", () => {
    const reached = [...closureOf(["dist/polish.js", ...under("dist/polish")])];
    expect(
      reached
        .filter((f) => f !== "dist/polish.js" && !f.startsWith("dist/polish/"))
        .sort(),
    ).toEqual([...EXAM_CLOSURE, "dist/log.js", "dist/schedule.js"].sort());
  });

  it("holds each closure file in WAVE-H's, MARKET-1's or the paper experiment's freeze, equal to every one naming it", () => {
    const lists = [
      "waveh/FROZEN.sha256",
      "market1/FROZEN.sha256",
      "experiment/FROZEN.sha256",
    ].map((f) => {
      const want = new Map<string, string>();
      for (const line of readFileSync(path.join(PACKAGE_ROOT, f), "utf8").split(
        "\n",
      )) {
        const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
        if (m) want.set(m[2]!, m[1]!);
      }
      return [f, want] as const;
    });
    for (const f of EXAM_CLOSURE) {
      const got = sha(readFileSync(path.join(PACKAGE_ROOT, f)));
      const naming = lists.filter(([, l]) => l.has(f));
      expect(naming.length, f).toBeGreaterThan(0);
      for (const [name, l] of naming)
        expect(l.get(f), `${f} in ${name}`).toBe(got);
    }
  });
});
