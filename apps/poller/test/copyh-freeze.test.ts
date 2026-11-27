/**
 * COPY-H's list tool (tools/copyh-freeze.cjs; rules.md C3, C9): a call it
 * does not know refused; --data's list, every file of E's and S's ranges in
 * their order, each line its frozen source list's, the sources named by
 * SHA-256; its refusals, nothing written; the program reading the committed
 * list (range.ts), a file it lacks or names twice a stop; --funding's list,
 * the meta reply and every window of every coin, each held to the store's
 * list and manifest and read by the program's reader (funding.ts), and its
 * refusals. The freeze lists on made-up git repositories (never the
 * package's): --final's first list, its head, files and tag line, the gate
 * opening on it once tagged, and its refusals (a marker, C17's own sentence
 * not one; a tree not clean; a file missing; a later list's file; a closure
 * file against the four freezes; the store closure; the tag's number);
 * --rounds' list with look1.sha256 as step 2 reads it, only tries.json,
 * choice.json and look1.sha256 added, and its refusals; --fresh2's with
 * look2.sha256, coins appended, and its refusals. A test never writes the
 * package's `copyh/` files.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as reader from "../src/copyh/funding.js";
import {
  COPYH_CLOSURE,
  COPYH_FILES,
  FROZEN_FILE,
  LZ4JS_FILES,
  frozenFiles,
  verifyFreeze,
} from "../src/copyh/gate.js";
import {
  RANGES,
  filesOf,
  readDataList as readCopyhList,
} from "../src/copyh/range.js";
import { PACKAGE_ROOT, StoreError, sha256 } from "../src/copyh/run.js";
import { LOOK_FILES, heldLookFiles } from "../src/copyh/steps.js";
import { readDataList } from "../src/waveh/store.js";
import { git } from "./copyh-world.js";

type Source = { name: string; text: string };
type RangeKeys = { name: string; fill: readonly string[] };
const TOOL = path.join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "tools",
  "copyh-freeze.cjs",
);
const tool = createRequire(import.meta.url)(TOOL) as {
  dataList: (sources: Source[], ranges: RangeKeys[]) => string;
  listOf: (text: string, name: string) => Map<string, string>;
  manifestOf: (text: string) => Map<string, { key: string; sha256: string }>;
  fundingList: (o: {
    list: Map<string, string>;
    listText: string;
    manifest: Map<string, { key: string; sha256: string }>;
    coins: { meta: { sha256: string }; coins: { name: string }[] };
    windows: { start: number; end: number }[];
    read: (key: string) => Buffer;
    reader: typeof reader;
  }) => string;
  freezeList: (o: {
    pkg: string;
    kind: Kind;
    tag: number;
    root: string | null;
    build: () => void;
    storeProblems: (pkg: string) => Promise<string[]>;
  }) => Promise<{ files: number; sha256: string; written: string[] }>;
  hashLines: (text: string) => Map<string, string>;
  markerLines: (text: string) => number[];
};
type Kind = "final" | "rounds" | "fresh2";
const hash = (n: number) => n.toString(16).padStart(64, "0");
const listText = (keys: readonly string[], from = 0) =>
  `${keys.map((k, i) => `${hash(from + i)} *${k}`).join("\n")}\n`;

describe("--data", { timeout: 60_000 }, () => {
  it("refuses a call it does not know (exit 1, its usage), and a later list's tag below 2", () => {
    const run = (args: readonly string[]) =>
      spawnSync(process.execPath, [TOOL, ...args], {
        encoding: "utf8",
        timeout: 50_000,
      });
    for (const args of [
      ["--bogus"],
      ["--data", "--funding"],
      ["--final", "--tag", "1"],
      ["--rounds", "--root", "x"],
      ["--fresh2", "--tag", "3", "--root", "x"],
    ]) {
      const r = run(args);
      expect(r.status, args.join(" ")).toBe(1);
      expect(r.stderr, args.join(" ")).toContain(
        "usage: copyh-freeze.cjs --data [--funding <COPYH_FUNDING>] | --final | --rounds --root <COPYH_ROOT> --tag <n> | --fresh2",
      );
    }
    const low = run(["--rounds", "--root", "x", "--tag", "1"]);
    expect([low.status, low.stderr]).toEqual([
      1,
      "copyh-freeze: --tag needs a number from 2, not 1\n",
    ]);
  });

  it("lists each range's files in its order with its source's hash, the sources named by SHA-256", () => {
    const e = { name: "E", fill: ["b", "a"] };
    const s = { name: "S", fill: ["c"] };
    const we = listText(["a", "b", "x"]);
    const fs = `# a comment\n${listText(["c"], 9)}`;
    const text = tool.dataList(
      [
        { name: "waveh/data.sha256", text: we },
        { name: "polish/fresh.sha256", text: fs },
      ],
      [e, s],
    );
    expect(text.split("\n")).toEqual([
      "# COPY-H's raw fill files (copyh/rules.md C3): written by tools/copyh-freeze.cjs --data",
      "# from the frozen lists' names and hashes alone, no data file opened:",
      `# E: 2 files from waveh/data.sha256 (${sha256(we)})`,
      `# S: 1 files from polish/fresh.sha256 (${sha256(fs)})`,
      `${hash(1)} *b`,
      `${hash(0)} *a`,
      `${hash(9)} *c`,
      "",
    ]);
    expect([...readDataList(text)]).toEqual([
      ["b", hash(1)],
      ["a", hash(0)],
      ["c", hash(9)],
    ]);
  });

  it("refuses a range file missing from its list, a file in two ranges, and a list naming a file twice", () => {
    const src = (text: string) => [
      { name: "one", text },
      { name: "two", text: listText(["c"]) },
    ];
    expect(() =>
      tool.dataList(src(listText(["a"])), [
        { name: "E", fill: ["a", "b"] },
        { name: "S", fill: ["c"] },
      ]),
    ).toThrow("1 files of E are not in one, the first b: nothing written");
    expect(() =>
      tool.dataList(src(listText(["c"])), [
        { name: "E", fill: ["c"] },
        { name: "S", fill: ["c"] },
      ]),
    ).toThrow("c is in two ranges: nothing written");
    expect(() => tool.listOf(listText(["a", "a"]), "one")).toThrow(
      "one line 2 is not a new file's line",
    );
    expect(() => tool.listOf("not a line\n", "one")).toThrow(
      "one line 1 is not a new file's line",
    );
  });

  it("gives, from the frozen lists, E's 8,845 and S's 4,102 files, each line its source's", () => {
    const read = (rel: string) =>
      readFileSync(path.join(PACKAGE_ROOT, rel), "utf8");
    const waveh = read("waveh/data.sha256");
    const fresh = read("polish/fresh.sha256");
    const text = tool.dataList(
      [
        { name: "waveh/data.sha256", text: waveh },
        { name: "polish/fresh.sha256", text: fresh },
      ],
      [RANGES.E, RANGES.S],
    );
    const list = readDataList(text);
    expect(list.size).toBe(8_845 + 4_102);
    expect([...list.keys()]).toEqual([...RANGES.E.fill, ...RANGES.S.fill]);
    const w = readDataList(waveh);
    const f = readDataList(fresh);
    for (const k of RANGES.E.fill) expect(list.get(k), k).toBe(w.get(k));
    for (const k of RANGES.S.fill) expect(list.get(k), k).toBe(f.get(k));
  });
});

describe(
  "the program reads the committed data list",
  { timeout: 60_000 },
  () => {
    it("skips its header lines and gives each range's files in order: the burn-in's 850", () => {
      const list = readCopyhList(
        readFileSync(path.join(PACKAGE_ROOT, "copyh", "data.sha256"), "utf8"),
      );
      expect(list.size).toBe(8_845 + 4_102);
      const burnin = filesOf(RANGES.burnin, list);
      expect(burnin).toHaveLength(850);
      expect(burnin[0]).toEqual({
        index: 0,
        key: RANGES.burnin.fill[0],
        sha256: list.get(RANGES.burnin.fill[0]!),
      });
      expect(filesOf(RANGES.E, list).map((f) => f.key)).toEqual(RANGES.E.fill);
      expect(() => readCopyhList("# a header\nnot a line\n")).toThrow(
        "data.sha256: line 2 is not a list line",
      );
    });

    it("stops on a range's file the data list lacks (exit 5), and on a data list naming a file twice", () => {
      const list = readCopyhList(
        readFileSync(path.join(PACKAGE_ROOT, "copyh", "data.sha256"), "utf8"),
      );
      const first = RANGES.E.fill[0]!;
      list.delete(first);
      expect(() => filesOf(RANGES.E, list)).toThrow(StoreError);
      expect(() => filesOf(RANGES.E, list)).toThrow(
        `${first}: not in copyh/data.sha256`,
      );
      expect(() => readCopyhList(`${hash(1)} *a\n${hash(2)} *a\n`)).toThrow(
        "data.sha256: a twice",
      );
    });
  },
);

describe("--funding", { timeout: 60_000 }, () => {
  const W = [
    { start: Date.UTC(2025, 5, 30), end: Date.UTC(2025, 6, 20) },
    { start: Date.UTC(2025, 6, 20), end: Date.UTC(2025, 7, 9) },
  ];
  const rows = (t: number, coin: string) =>
    Buffer.from(
      JSON.stringify([
        { coin, fundingRate: "0.00001", premium: "0.0", time: t + 887_645 },
        { coin, fundingRate: "0.00001", premium: "0.0", time: t + 3_600_017 },
      ]),
    );
  function store() {
    const files = new Map<string, Buffer>([
      ["info/meta.json", Buffer.from('{"universe":[]}')],
    ]);
    for (const coin of ["BTC", "ETH"])
      for (const w of W)
        files.set(reader.fundingKey(coin, w.start), rows(w.start, coin));
    const listText = [...files.keys()]
      .sort()
      .map((k) => `${sha256(files.get(k)!)} *${k}\n`)
      .join("");
    const manifestText = [...files]
      .map(
        ([key, b]) =>
          `${JSON.stringify({ key, bytes: b.length, sha256: sha256(b), fetchedAt: "x" })}\n`,
      )
      .join("");
    return { files, listText, manifestText };
  }
  const run = (
    st: ReturnType<typeof store>,
    over: Partial<Parameters<typeof tool.fundingList>[0]> = {},
  ) =>
    tool.fundingList({
      list: tool.listOf(st.listText, "funding.sha256"),
      listText: st.listText,
      manifest: tool.manifestOf(`${st.manifestText}{"key":"torn`),
      coins: {
        meta: { sha256: sha256(st.files.get("info/meta.json")!) },
        coins: [{ name: "BTC" }, { name: "ETH" }],
      },
      windows: W,
      read: (key) => st.files.get(key)!,
      reader,
      ...over,
    });

  it("lists the meta reply and every window of every coin, sorted, each read by the program's reader", () => {
    const st = store();
    const text = run(st);
    const lines = text.split("\n");
    expect(lines.slice(0, 3)).toEqual([
      "# COPY-H's funding (copyh/rules.md C9): written by tools/copyh-freeze.cjs --data --funding",
      `# from the funding store's funding.sha256 (${sha256(st.listText)}), each line held to its manifest.jsonl,`,
      "# every window of the 2 coins of coins.json read by dist/copyh/funding.js:",
    ]);
    expect(lines.slice(3, -1)).toEqual(st.listText.split("\n").slice(0, -1));
  });

  it("refuses a window missing, a line differing from the manifest, bytes differing, a reply the reader refuses, and coins of another meta", () => {
    const st = store();
    const missing = store();
    missing.listText = missing.listText
      .split("\n")
      .filter((l) => !l.includes("ETH"))
      .join("\n");
    expect(() => run(missing)).toThrow(
      "2 files are not in the funding store's list, the first info/fundingHistory/ETH/",
    );
    const other = store();
    other.manifestText = other.manifestText.replace(
      sha256(other.files.get("info/meta.json")!),
      "0".repeat(64),
    );
    expect(() => run(other)).toThrow(
      "info/meta.json: its line differs from the store's manifest",
    );
    const k = reader.fundingKey("BTC", W[1]!.start);
    expect(() =>
      run(st, {
        read: (key) => (key === k ? Buffer.from("[]") : st.files.get(key)!),
      }),
    ).toThrow(`${k}: its bytes differ from its line`);
    const twice = store();
    const bad = Buffer.from(
      JSON.stringify([
        { coin: "BTC", fundingRate: "0.0", premium: "0.0", time: W[1]!.start },
        {
          coin: "BTC",
          fundingRate: "0.0",
          premium: "0.0",
          time: W[1]!.start + 1_000,
        },
      ]),
    );
    twice.files.set(k, bad);
    twice.listText = twice.listText.replace(
      sha256(rows(W[1]!.start, "BTC")),
      sha256(bad),
    );
    twice.manifestText = twice.manifestText.replace(
      sha256(rows(W[1]!.start, "BTC")),
      sha256(bad),
    );
    expect(() => run(twice)).toThrow(`${k}: BTC's hour`);
    expect(() =>
      run(st, {
        coins: { meta: { sha256: "1".repeat(64) }, coins: [{ name: "BTC" }] },
      }),
    ).toThrow("coins.json was made from another meta reply");
    // A listed window the store's manifest does not hold at all.
    const manifest = tool.manifestOf(
      st.manifestText
        .split("\n")
        .filter((l) => !l.includes(k))
        .join("\n"),
    );
    expect(() => run(st, { manifest })).toThrow(
      `${k}: its line differs from the store's manifest`,
    );
    expect(() => tool.manifestOf('{"key":"a"}\n{"key":"a"}\n')).toThrow(
      "manifest.jsonl: a twice",
    );
  });
});

/** C17's own sentence, the markers' forms quoted: no marker. */
const C17 =
  "this file while it holds `[SET BEFORE THE FREEZE` or `[OPEN Q` (RL10; as a\n";
const RULES = `# made-up rules\n${C17}`;
const coinsJson = (names: readonly string[], rule = "made-up") =>
  JSON.stringify({
    rule,
    meta: {
      key: "info/meta.json",
      bytes: 1,
      sha256: "0".repeat(64),
      read: "2026-11-27T00:00:00.000Z",
    },
    coins: names.map((name, iid) => ({
      iid,
      name,
      szDecimals: 2,
      delisted: false,
    })),
  });
const LOCK = "lockfileVersion: made-up\n";
const CHOICE = '{"made-up": "choice"}\n';

type Repo = {
  repo: string;
  pkg: string;
  /** COPY-H's folder: look 1's and look 2's three files and the program's choice.json. */
  root: string;
  put: (rel: string, text: string) => void;
  gone: (rel: string) => void;
  commit: () => void;
};

/** A made-up repository: apps/poller with every file of what runs (dist and node_modules ignored, as the real one's), the four freezes naming the closure's and lz4js's files (WAVE-H's), the toolchain's versions and the lockfile, committed; and COPY-H's folder. */
function repoOf(): Repo {
  const repo = mkdtempSync(path.join(tmpdir(), "copyh-freeze-repo-"));
  const pkg = path.join(repo, "apps", "poller");
  const put = (rel: string, text: string) => {
    mkdirSync(path.dirname(path.join(pkg, rel)), { recursive: true });
    writeFileSync(path.join(pkg, rel), text);
  };
  for (const f of [
    "dist/copyh.js",
    "dist/copyh/main.js",
    ...COPYH_CLOSURE,
    "research/kit.js",
    ...LZ4JS_FILES,
    ...COPYH_FILES,
  ])
    put(f, `synthetic ${f}\n`);
  put("copyh/rules.md", RULES);
  put("copyh/coins.json", coinsJson(["BTC", "ETH"]));
  put(
    "waveh/FROZEN.sha256",
    `# made-up\n${[...COPYH_CLOSURE, ...LZ4JS_FILES]
      .map((f) => `${sha256(readFileSync(path.join(pkg, f)))} *${f}`)
      .join("\n")}\n`,
  );
  for (const f of ["market1", "experiment", "polish"])
    put(`${f}/FROZEN.sha256`, "# made-up, naming none\n");
  for (const [p, v] of [
    ["typescript", "6.0.3"],
    ["zod", "4.6.7"],
    ["pino", "10.4.0"],
    ["lz4js", "0.2.0"],
  ])
    put(`node_modules/${p}/package.json`, JSON.stringify({ version: v }));
  writeFileSync(path.join(repo, "pnpm-lock.yaml"), LOCK);
  writeFileSync(
    path.join(repo, ".gitignore"),
    "apps/poller/dist/\napps/poller/node_modules/\n",
  );
  const root = path.join(repo, "COPY-H");
  for (const look of ["look1", "look2"]) {
    mkdirSync(path.join(root, look), { recursive: true });
    for (const f of LOOK_FILES)
      writeFileSync(path.join(root, look, f), `${look}'s ${f}\n`);
  }
  mkdirSync(path.join(root, "rounds"));
  writeFileSync(path.join(root, "rounds", "choice.json"), CHOICE);
  const commit = () => {
    git(repo, "add", "-A");
    git(repo, "commit", "-q", "--allow-empty", "-m", "made-up");
  };
  git(repo, "init", "-q");
  commit();
  return {
    repo,
    pkg,
    root,
    put,
    gone: (rel) => rmSync(path.join(pkg, rel)),
    commit,
  };
}

const builds: string[] = [];
/** A list of `kind` at the made-up package, its build counted, the store closure's check giving `store`. */
const freeze = (r: Repo, kind: Kind, tag: number, store: string[] = []) =>
  tool.freezeList({
    pkg: r.pkg,
    kind,
    tag,
    root: kind === "final" ? null : r.root,
    build: () => builds.push(r.pkg),
    storeProblems: () => Promise.resolve(store),
  });
const listAt = (r: Repo) => readFileSync(path.join(r.pkg, FROZEN_FILE), "utf8");
/** The list committed and its commit tagged copyh-freeze-<n>. */
const tagged = (r: Repo, n: number) => {
  r.commit();
  git(r.repo, "tag", `copyh-freeze-${n}`);
};
/** A repository at its first list, tagged. */
async function first(): Promise<Repo> {
  const r = repoOf();
  await freeze(r, "final", 1);
  tagged(r, 1);
  return r;
}
/** A repository at the rounds' list, a round having run, tagged. */
async function rounds(): Promise<Repo> {
  const r = await first();
  r.put("copyh/choice.json", CHOICE);
  r.put("copyh/tries.json", "{}\n");
  r.commit();
  await freeze(r, "rounds", 2);
  tagged(r, 2);
  return r;
}
const lookLines = (dir: string) =>
  LOOK_FILES.map(
    (f) => `${sha256(readFileSync(path.join(dir, f)))} *${f}\n`,
  ).join("");

describe(
  "the freeze lists (C0, C14, C17; temporary git repositories, never the package's)",
  { timeout: 120_000 },
  () => {
    it("--final writes the first list: its head, every file of what runs with its SHA-256 by path, its tag line, the program built anew first; the gate opens on it once its commit holds the tag", async () => {
      const r = repoOf();
      const commit = git(r.repo, "rev-parse", "HEAD").trim();
      const done = await freeze(r, "final", 1);
      expect(builds.at(-1)).toBe(r.pkg);
      const text = listAt(r);
      const lines = text.split("\n");
      expect(lines.slice(0, 5)).toEqual([
        "# FROZEN: COPY-H's files of what runs (copyh/rules.md C0): the first list (copyh-freeze.cjs --final)",
        expect.stringMatching(
          new RegExp(
            `^# written \\d{4}-\\d\\d-\\d\\dT[\\d:.]+Z from commit ${commit}$`,
          ),
        ),
        `# node ${process.version}; typescript 6.0.3; zod 4.6.7; pino 10.4.0; lz4js 0.2.0`,
        `# pnpm-lock.yaml sha256 ${sha256(LOCK)}`,
        "# tag copyh-freeze-1",
      ]);
      const files = [...frozenFiles(r.pkg)].sort();
      expect(lines.slice(5)).toEqual([
        ...files.map(
          (f) => `${sha256(readFileSync(path.join(r.pkg, f)))} *${f}`,
        ),
        "",
      ]);
      expect(done).toEqual({
        files: files.length,
        sha256: sha256(text),
        written: [FROZEN_FILE],
      });
      expect(verifyFreeze(r.pkg).ok).toBe(false);
      tagged(r, 1);
      expect(verifyFreeze(r.pkg, "step1")).toMatchObject({
        ok: true,
        tag: "copyh-freeze-1",
        files: files.length,
      });
    });

    it("--final refuses, writing nothing: rules.md holding a marker (each form; C17's quoted sentence none), a tree not clean, a file copyh/ must hold missing, a later list's file, a closure file unequal to a freeze naming it or in none, the store closure not the rehearsal's, a tag not the next free", async () => {
      expect(tool.markerLines(RULES)).toEqual([]);
      expect(
        tool.markerLines(
          "[SET BEFORE THE FREEZE: x]\n| y | [SET BEFORE THE FREEZE] |\n[OPEN Q3]\n[OPEN Q]\n",
        ),
      ).toEqual([1, 2, 3]);
      const refused = async (
        change: (r: Repo) => void,
        why: RegExp,
        o: { tag?: number; store?: string[]; commit?: boolean } = {},
      ) => {
        const r = repoOf();
        change(r);
        if (o.commit ?? true) r.commit();
        await expect(
          freeze(r, "final", o.tag ?? 1, o.store),
          why.source,
        ).rejects.toThrow(why);
        expect(existsSync(path.join(r.pkg, FROZEN_FILE))).toBe(false);
      };
      await refused(
        (r) => r.put("copyh/rules.md", `${RULES}[SET BEFORE THE FREEZE: x]\n`),
        /copyh\/rules\.md holds a marker to set before the freeze, at line 3: nothing written/,
      );
      await refused(
        (r) => r.put("copyh/extra.json", "{}\n"),
        /the tree is not clean: commit first, then freeze: nothing written/,
        { commit: false },
      );
      await refused(
        (r) => r.gone("copyh/unpaired.json"),
        /missing: copyh\/unpaired\.json: nothing written/,
      );
      await refused(
        (r) => r.put("copyh/look1.sha256", ""),
        /a later list's file in the first: copyh\/look1\.sha256: nothing written/,
      );
      await refused(
        (r) => r.put("dist/waveh/books.js", "changed\n"),
        /dist\/waveh\/books\.js differs from waveh\/FROZEN\.sha256: nothing written/,
      );
      await refused(
        (r) => r.put("waveh/FROZEN.sha256", "# naming none\n"),
        /dist\/market1\/book\.js is in none of the four freezes/,
      );
      await refused(
        () => {},
        /the store closure is not the rehearsal's: changed: dist\/copyh\/pass\.js: nothing written/,
        { store: ["changed: dist/copyh/pass.js"] },
      );
      await refused(
        (r) => git(r.repo, "tag", "copyh-freeze-1"),
        /copyh-freeze-1 is not the next free number \(the tags: 1\): nothing written/,
      );
    });

    it("--rounds writes look1.sha256, step 1's three files by name in sha256sum's form, and the rounds' list, the first's but tries.json, choice.json and look1.sha256 added, with no build; step 2's gate opens on it, and step 2 holds look 1's files to it", async () => {
      const r = await first();
      const before = tool.hashLines(listAt(r));
      r.put("copyh/choice.json", CHOICE);
      r.put("copyh/tries.json", "{}\n");
      r.commit();
      const made = builds.length;
      const done = await freeze(r, "rounds", 2);
      expect(builds.length).toBe(made);
      expect(done.written).toEqual(["copyh/look1.sha256", FROZEN_FILE]);
      const look1 = path.join(r.root, "look1");
      expect(
        readFileSync(path.join(r.pkg, "copyh", "look1.sha256"), "utf8"),
      ).toBe(lookLines(look1));
      expect(() =>
        heldLookFiles(look1, path.join(r.pkg, "copyh", "look1.sha256")),
      ).not.toThrow();
      const now = tool.hashLines(listAt(r));
      expect([...now.keys()].filter((f) => !before.has(f))).toEqual([
        "copyh/choice.json",
        "copyh/look1.sha256",
        "copyh/tries.json",
      ]);
      for (const [f, h] of before) expect(now.get(f), f).toBe(h);
      expect(listAt(r)).toContain(
        "# FROZEN: COPY-H's files of what runs (copyh/rules.md C0): the rounds' list (copyh-freeze.cjs --rounds)\n",
      );
      expect(listAt(r)).toContain("\n# tag copyh-freeze-2\n");
      expect(verifyFreeze(r.pkg, "step2").ok).toBe(false);
      tagged(r, 2);
      expect(verifyFreeze(r.pkg, "step2")).toMatchObject({
        ok: true,
        tag: "copyh-freeze-2",
      });
      // With no round run, no tries.json: choice.json and look1.sha256 alone.
      const none = await first();
      none.put("copyh/choice.json", CHOICE);
      none.commit();
      await freeze(none, "rounds", 2);
      expect(
        [...tool.hashLines(listAt(none)).keys()].filter((f) => !before.has(f)),
      ).toEqual(["copyh/choice.json", "copyh/look1.sha256"]);
    });

    it("--rounds refuses, writing nothing: choice.json not the program's or missing, a look file missing, a file of the list before changed, added elsewhere or gone, the tree's list not the tag's, a tag not the next free, a tree not clean", async () => {
      const refused = async (
        change: (r: Repo) => void,
        why: RegExp,
        o: { tag?: number; commit?: boolean; choice?: boolean } = {},
      ) => {
        const r = await first();
        if (o.choice ?? true) r.put("copyh/choice.json", CHOICE);
        change(r);
        const list = listAt(r);
        if (o.commit ?? true) r.commit();
        await expect(
          freeze(r, "rounds", o.tag ?? 2),
          why.source,
        ).rejects.toThrow(why);
        expect(listAt(r)).toBe(list);
        expect(existsSync(path.join(r.pkg, "copyh", "look1.sha256"))).toBe(
          false,
        );
      };
      await refused(
        (r) => r.put("copyh/choice.json", '{"another": "choice"}\n'),
        /copyh\/choice\.json is not .*choice\.json, byte for byte: nothing written/,
      );
      await refused(
        () => {},
        /the rounds' list \(copyh-freeze\.cjs --rounds\) holds copyh\/choice\.json; this tree does not: nothing written/,
        { choice: false },
      );
      await refused(
        (r) => rmSync(path.join(r.root, "look1", "report.json")),
        /report\.json: nothing written/,
      );
      await refused(
        (r) => r.put("dist/copyh/main.js", "changed\n"),
        /changed: dist\/copyh\/main\.js: nothing written/,
      );
      await refused(
        (r) => r.put("copyh/extra.json", "{}\n"),
        /added: copyh\/extra\.json: nothing written/,
      );
      await refused(
        (r) => r.gone("research/kit.js"),
        /gone: research\/kit\.js: nothing written/,
      );
      await refused(
        (r) => r.put("copyh/FROZEN.sha256", "# another list\n"),
        /the tree's copyh\/FROZEN\.sha256 is not the one copyh-freeze-1 holds: nothing written/,
      );
      await refused(
        () => {},
        /copyh-freeze-3 is not the next free number \(the tags: 1\): nothing written/,
        { tag: 3 },
      );
      await refused(
        (r) => r.put("copyh/tries.json", "{}\n"),
        /the tree is not clean/,
        { commit: false },
      );
    });

    it("--fresh2 writes look2.sha256 and FRESH-2's list, the rounds' but fresh2.sha256, funding2.sha256 and look2.sha256 added and coins appended to coins.json; FRESH-2's gate opens on it; it refuses another coins.json, a needed file missing and any other difference, writing nothing", async () => {
      const r = await rounds();
      const before = tool.hashLines(listAt(r));
      r.put("copyh/fresh2.sha256", `${"1".repeat(64)} *made-up\n`);
      r.put("copyh/funding2.sha256", `${"2".repeat(64)} *made-up\n`);
      r.put("copyh/coins.json", coinsJson(["BTC", "ETH", "SOL"]));
      r.commit();
      const done = await freeze(r, "fresh2", 3);
      expect(done.written).toEqual(["copyh/look2.sha256", FROZEN_FILE]);
      expect(
        readFileSync(path.join(r.pkg, "copyh", "look2.sha256"), "utf8"),
      ).toBe(lookLines(path.join(r.root, "look2")));
      const now = tool.hashLines(listAt(r));
      expect([...now.keys()].filter((f) => !before.has(f))).toEqual([
        "copyh/fresh2.sha256",
        "copyh/funding2.sha256",
        "copyh/look2.sha256",
      ]);
      for (const [f, h] of before)
        if (f !== "copyh/coins.json") expect(now.get(f), f).toBe(h);
      tagged(r, 3);
      expect(verifyFreeze(r.pkg, "fresh2")).toMatchObject({
        ok: true,
        tag: "copyh-freeze-3",
      });
      const refused = async (change: (r: Repo) => void, why: RegExp) => {
        const x = await rounds();
        x.put("copyh/fresh2.sha256", `${"1".repeat(64)} *made-up\n`);
        x.put("copyh/funding2.sha256", `${"2".repeat(64)} *made-up\n`);
        change(x);
        x.commit();
        const list = listAt(x);
        await expect(freeze(x, "fresh2", 3), why.source).rejects.toThrow(why);
        expect(listAt(x)).toBe(list);
        expect(existsSync(path.join(x.pkg, "copyh", "look2.sha256"))).toBe(
          false,
        );
      };
      await refused(
        (x) => x.put("copyh/coins.json", coinsJson(["BTC", "ETX", "SOL"])),
        /copyh\/coins\.json: the coin of iid 1 changed or gone: nothing written/,
      );
      await refused(
        (x) => x.put("copyh/coins.json", coinsJson(["BTC"])),
        /copyh\/coins\.json: the coin of iid 1 changed or gone: nothing written/,
      );
      await refused(
        (x) =>
          x.put(
            "copyh/coins.json",
            coinsJson(["BTC", "ETH", "SOL"], "another"),
          ),
        /copyh\/coins\.json: its rule changed: nothing written/,
      );
      await refused(
        (x) => x.gone("copyh/funding2.sha256"),
        /FRESH-2's list \(copyh-freeze\.cjs --fresh2\) holds copyh\/funding2\.sha256; this tree does not: nothing written/,
      );
      await refused(
        (x) => x.put("copyh/dirs.json", "{}\n"),
        /changed: copyh\/dirs\.json: nothing written/,
      );
    });
  },
);
