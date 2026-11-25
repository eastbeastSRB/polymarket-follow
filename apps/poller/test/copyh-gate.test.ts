/**
 * COPY-H's gate (src/copyh/gate.ts; rules.md C0, "the gate"): S opens only
 * for step 2 on a verified freeze whose tag holds the very list (a temporary
 * git repository): an untagged list, an edited list, a file changed, missing
 * or unlisted, a file of the closure changed, the tag holding another list,
 * git not on the PATH, each refused and named. The compiled imports reach
 * exactly the closure, each file equal to its own program's freeze. Run in
 * `pnpm verify`'s order: the build first.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  COPYH_CLOSURE,
  COPYH_FILES,
  FROZEN_FILE,
  LZ4JS_FILES,
  frozenFiles,
  sealOf,
  verifyFreeze,
} from "../src/copyh/gate.js";
import { PACKAGE_ROOT, sha256 } from "../src/copyh/run.js";

const tmp = (name: string) => mkdtempSync(path.join(tmpdir(), `${name}-`));

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

describe("COPY-H's freeze (a temporary git repository)", () => {
  let repo = "";
  let root = "";
  let list = "";
  const listOf = (head: readonly string[]) =>
    `${[
      ...head,
      ...frozenFiles(root).map(
        (f) => `${sha256(readFileSync(path.join(root, f)))} *${f}`,
      ),
    ].join("\n")}\n`;
  const HEAD = [
    "# FROZEN: COPY-H's files of what runs (copyh/rules.md C0)",
    "# tag copyh-freeze-1",
  ];
  const listFile = () => path.join(root, FROZEN_FILE);
  const away = (full: string) => path.join(repo, `away-${path.basename(full)}`);
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
    repo = tmp("copyh-repo");
    root = path.join(repo, "apps", "poller");
    for (const f of [
      "dist/copyh.js",
      "dist/copyh/main.js",
      "dist/copyh/deep/x.js",
      ...COPYH_CLOSURE,
      "research/kit.js",
      ...LZ4JS_FILES,
      ...COPYH_FILES,
    ]) {
      mkdirSync(path.join(root, path.dirname(f)), { recursive: true });
      writeFileSync(path.join(root, f), `synthetic ${f}\n`);
    }
    list = listOf(HEAD);
    writeFileSync(listFile(), list);
    git(repo, "init", "-q");
    git(repo, "add", "-A");
    git(repo, "commit", "-q", "-m", "the freeze");
    git(repo, "tag", "copyh-freeze-1");
  }, 60_000);

  it("verifies a list whose tag holds it, byte for byte, and opens S for step 2 alone", () => {
    const f = verifyFreeze(root);
    expect(f).toEqual({
      ok: true,
      sha256: sha256(list),
      files: frozenFiles(root).length,
      tag: "copyh-freeze-1",
    });
    expect(frozenFiles(root)).toContain("dist/copyh/deep/x.js");
    expect(frozenFiles(root)).not.toContain(FROZEN_FILE);
    expect(sealOf(f, "2")).toEqual({ sOpen: true });
    expect(sealOf(f, "1")).toEqual({ sOpen: false });
  }, 60_000);

  it("refuses with no list, and S stays closed", () => {
    withChange(
      () => renameSync(listFile(), away(listFile())),
      () => {
        const f = verifyFreeze(root);
        expect(f).toEqual({ ok: false, problems: [`no ${FROZEN_FILE}`] });
        expect(sealOf(f, "2")).toEqual({ sOpen: false });
      },
      () => renameSync(away(listFile()), listFile()),
    );
  }, 60_000);

  it("refuses a file changed, a file of the closure changed, a listed file missing, and a file of what runs not in the list", () => {
    const main = path.join(root, "dist", "copyh", "main.js");
    const closed = path.join(root, COPYH_CLOSURE[0]!);
    const kit = path.join(root, "research", "kit.js");
    const extra = path.join(root, "copyh", "extra.json");
    withChange(
      () => {
        writeFileSync(main, "changed\n");
        writeFileSync(closed, "changed\n");
        renameSync(kit, away(kit));
        writeFileSync(extra, "{}\n");
      },
      () =>
        expect(verifyFreeze(root)).toEqual({
          ok: false,
          problems: [
            "not in the freeze: copyh/extra.json",
            "changed: dist/copyh/main.js",
            `changed: ${COPYH_CLOSURE[0]!}`,
            "missing: research/kit.js",
          ],
        }),
      () => {
        writeFileSync(main, "synthetic dist/copyh/main.js\n");
        writeFileSync(closed, `synthetic ${COPYH_CLOSURE[0]!}\n`);
        renameSync(away(kit), kit);
        rmSync(extra);
      },
    );
    expect(verifyFreeze(root).ok).toBe(true);
  }, 60_000);

  it("refuses a list without a file COPY-H reads by name, one of the closure, or one of lz4js's", () => {
    for (const named of [
      "copyh/data.sha256",
      "copyh/unpaired.json",
      COPYH_CLOSURE[0]!,
      LZ4JS_FILES[2]!,
    ]) {
      const full = path.join(root, named);
      withChange(
        () => {
          renameSync(full, away(full));
          writeFileSync(listFile(), listOf(HEAD));
        },
        () =>
          expect(verifyFreeze(root)).toEqual({
            ok: false,
            problems: [
              `not in the freeze: ${named}`,
              `the tag copyh-freeze-1 holds another ${FROZEN_FILE}`,
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
      [[...HEAD, "# tag copyh-freeze-2"], 2],
      [[HEAD[0]!, "# tag polish-freeze-1"], 0],
      [[HEAD[0]!, "# tag copyh-freeze-1 "], 0],
      [[HEAD[0]!, "#tag copyh-freeze-1"], 0],
      [[HEAD[0]!, "# tag copyh-freeze-01"], 0],
      [[HEAD[0]!, "# tag --output=x"], 0],
    ] as const)
      withChange(
        () => writeFileSync(listFile(), listOf(head)),
        () =>
          expect(verifyFreeze(root), head.join("|")).toEqual({
            ok: false,
            problems: [
              `${n} tag lines ("# tag copyh-freeze-<n>") in ${FROZEN_FILE}, not one`,
            ],
          }),
        () => writeFileSync(listFile(), list),
      );
  }, 60_000);

  it("refuses a tag that does not exist, one that does not hold the list, and a list edited after its tag", () => {
    for (const [text, why] of [
      [
        listOf([HEAD[0]!, "# tag copyh-freeze-2"]),
        `the tag copyh-freeze-2 does not hold ${FROZEN_FILE}`,
      ],
      [
        listOf([`${HEAD[0]!} (edited)`, HEAD[1]!]),
        `the tag copyh-freeze-1 holds another ${FROZEN_FILE}`,
      ],
      [list.replace("\n", "\r\n"), "the tag copyh-freeze-1 holds another"],
    ] as const)
      withChange(
        () => writeFileSync(listFile(), text),
        () => {
          const f = verifyFreeze(root);
          expect(f.ok ? [] : f.problems).toEqual([
            expect.stringContaining(why),
          ]);
          expect(sealOf(f, "2")).toEqual({ sOpen: false });
        },
        () => writeFileSync(listFile(), list),
      );
    expect(verifyFreeze(root).ok).toBe(true);
  }, 60_000);

  it("refuses, saying so, when git cannot show the tag's list (no git on the PATH)", () => {
    vi.stubEnv("PATH", "");
    const f = (() => {
      try {
        return verifyFreeze(root);
      } finally {
        vi.unstubAllEnvs();
      }
    })();
    expect(f.ok ? [] : f.problems).toEqual([
      expect.stringMatching(/^git could not show the tag's list \(.*ENOENT/),
    ]);
    expect(sealOf(f, "2")).toEqual({ sOpen: false });
    expect(verifyFreeze(root).ok).toBe(true);
  }, 60_000);
});

/** The repository files a compiled module's relative imports reach, itself included. */
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
  !existsSync(path.join(PACKAGE_ROOT, rel))
    ? []
    : statSync(path.join(PACKAGE_ROOT, rel)).isDirectory()
      ? readdirSync(path.join(PACKAGE_ROOT, rel))
          .sort()
          .flatMap((n) => under(`${rel}/${n}`))
      : [rel];

describe("COPY-H's closure", () => {
  it.runIf(existsSync(path.join(PACKAGE_ROOT, "dist", "copyh")))(
    "is exactly what the program's compiled files reach outside dist/copyh, the shared files aside",
    () => {
      const reached = [
        ...closureOf([...under("dist/copyh.js"), ...under("dist/copyh")]),
      ];
      expect(
        reached
          .filter(
            (f) =>
              f !== "dist/copyh.js" &&
              !f.startsWith("dist/copyh/") &&
              f !== "dist/schedule.js" &&
              f !== "dist/log.js",
          )
          .sort(),
      ).toEqual([...COPYH_CLOSURE].sort());
    },
  );

  it("holds each closure file in its own programs' freezes, equal to every one naming it", () => {
    const lists = [
      "waveh/FROZEN.sha256",
      "polish/FROZEN.sha256",
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
    for (const f of COPYH_CLOSURE) {
      const got = sha256(readFileSync(path.join(PACKAGE_ROOT, f)));
      const naming = lists.filter(([, l]) => l.has(f));
      expect(naming.length, f).toBeGreaterThan(0);
      for (const [name, l] of naming)
        expect(l.get(f), `${f} in ${name}`).toBe(got);
    }
  });
});
