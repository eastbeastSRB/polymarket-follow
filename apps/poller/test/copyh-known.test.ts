/**
 * COPY-H's known answers' sets (tools/copyh-known.cjs; rules.md C15 (a); the
 * supervisor's rulings on COPYH-REPRO's Q1 and Q2, 2026-11-26), on made-up
 * rows: FIND-6-EXITS's copies of accounts outside the kit's holdout; FIND-3's
 * population rows primary and not holdout, those voted at 24 h and those
 * whose look row holds a taker net; the 26 Mondays ending at the last Monday
 * before the cut, every pool-weeks Monday outside the holdout among them; a
 * holdout account's rows counted and never kept, its Mondays never checked;
 * each refusal (an account outside the population, a FIND-3 flag differing
 * from the population's, a copy not its account's, an id twice, a pool-weeks
 * instant outside the Mondays); a file whose bytes differ from its hash
 * refused before it is parsed; the tool's usage. The committed known.json
 * holds the record's counts (design.ts REPRODUCTION). A test never writes
 * the package's copyh/ files.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { REPRODUCTION } from "../src/copyh/design.js";
import { PACKAGE_ROOT, sha256 } from "../src/copyh/run.js";
import { DAY_MS } from "../src/schedule.js";

const TOOL = path.join(PACKAGE_ROOT, "..", "..", "tools", "copyh-known.cjs");
type Row = Record<string, unknown>;
type Sources = {
  population: { addr: string; holdout: boolean }[];
  find6exits: Row[];
  find3: Row[];
  find3look: Row[];
  poolWeeks: Row[];
  cut: number;
  count: number;
};
const tool = createRequire(import.meta.url)(TOOL) as {
  knownOf: (o: Sources) => {
    holdout: Record<string, number>;
    poolWeeksMondays: number;
    mondays: string[];
    find6exits: string[];
    x3: string[];
    x3voted: string[];
    x3find3: string[];
  };
  rowsOf: (file: string, want: string) => Row[];
};

const addr = (c: string) => `0x${c.repeat(40)}`;
const [A, B, H] = [addr("a"), addr("b"), addr("c")];
const population = [
  { addr: A, holdout: false },
  { addr: B, holdout: false },
  { addr: H, holdout: true },
];
const CUT = Date.parse("2026-11-07T00:00:00Z");
const M = (date: string) => Date.parse(`${date}T00:00:00Z`);
const id = (a: string, t: number, type = "OPEN") => `${a}|6|${t}|${type}`;

/** Made-up sources: two pool accounts and one of the holdout in each. */
function sources(): Sources {
  return {
    population,
    find6exits: [
      { id: id(B, 3), addr: B, netX: 1 },
      { id: id(H, 1), addr: H, netX: 2 },
      { id: id(A, 2, "FLIP"), addr: A, netX: 3 },
    ],
    find3: [
      { id: id(A, 10), addr: A, holdout: false, primary: true, voted24: true },
      { id: id(A, 11), addr: A, holdout: false, primary: true, voted24: false },
      { id: id(A, 12), addr: A, holdout: false, primary: false, voted24: true },
      { id: id(B, 13), addr: B, holdout: false, primary: true, voted24: true },
      { id: id(H, 14), addr: H, holdout: true, primary: true, voted24: true },
    ],
    find3look: [
      { id: id(A, 10), taker: 0.001 },
      { id: id(A, 11), taker: null },
      { id: id(A, 12), taker: 0.002 },
      { id: id(B, 13), taker: -0.003 },
      { id: id(H, 14), taker: 0.004 },
    ],
    poolWeeks: [
      { addr: B, M: M("2026-11-02") },
      { addr: A, M: M("2026-05-25") },
      { addr: A, M: M("2026-11-02") },
      { addr: H, M: M("2026-01-05") },
    ],
    cut: CUT,
    count: 26,
  };
}

describe("the known answers' sets", () => {
  it("applies each definition, every set sorted, the holdout's rows counted and never kept", () => {
    expect(tool.knownOf(sources())).toEqual({
      holdout: { find6exits: 1, find3: 1, find3look: 1, poolWeeks: 1 },
      poolWeeksMondays: 2,
      mondays: Array.from({ length: 26 }, (_, k) =>
        new Date(M("2026-05-11") + k * 7 * DAY_MS).toISOString().slice(0, 10),
      ),
      find6exits: [id(A, 2, "FLIP"), id(B, 3)],
      x3: [id(A, 10), id(A, 11), id(B, 13)],
      x3voted: [id(A, 10), id(B, 13)],
      x3find3: [id(A, 10), id(B, 13)],
    });
  });

  it("ends the Mondays at the last Monday before the cut, one millisecond either side of a Monday", () => {
    const at = (cut: number) =>
      tool.knownOf({ ...sources(), poolWeeks: [], cut, count: 2 }).mondays;
    expect(at(M("2026-11-09"))).toEqual(["2026-10-26", "2026-11-02"]);
    expect(at(M("2026-11-09") + 1)).toEqual(["2026-11-02", "2026-11-09"]);
  });

  it("refuses an account outside the population, a FIND-3 flag differing from it, a copy not its account's, an id twice and a Monday outside the list", () => {
    const s = sources();
    const X = addr("d");
    const cases: [Partial<Sources>, RegExp][] = [
      [
        { find6exits: [{ id: id(X, 1), addr: X }] },
        /not in the kit's population/,
      ],
      [
        { find3look: [{ id: id(X, 1), taker: 1 }] },
        /not in the kit's population/,
      ],
      [
        { poolWeeks: [{ addr: X, M: M("2026-11-02") }] },
        /not in the kit's population/,
      ],
      [
        { find3: [{ id: id(H, 1), addr: H, holdout: false, primary: true }] },
        /holdout flag differs/,
      ],
      [
        { find3: [{ id: id(A, 1), addr: A, holdout: true, primary: true }] },
        /holdout flag differs/,
      ],
      [{ find6exits: [{ id: id(B, 1), addr: A }] }, /is not 0xa+'s/],
      [
        {
          find6exits: [
            { id: id(A, 1), addr: A },
            { id: id(A, 1), addr: A },
          ],
        },
        /twice/,
      ],
      [
        { poolWeeks: [{ addr: A, M: M("2026-05-04") }] },
        /not one of the 26 Mondays/,
      ],
      [
        { poolWeeks: [{ addr: A, M: M("2026-11-02") + 1 }] },
        /not one of the 26/,
      ],
    ];
    for (const [change, why] of cases)
      expect(() => tool.knownOf({ ...s, ...change }), String(why)).toThrow(why);
    // A holdout account's Monday is never checked.
    expect(
      tool.knownOf({ ...s, poolWeeks: [{ addr: H, M: 1 }] }).poolWeeksMondays,
    ).toBe(0);
  });

  it("holds a file to its SHA-256 before it parses it", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "copyh-known-"));
    const good = path.join(dir, "good.jsonl.gz");
    const bytes = gzipSync(
      `${JSON.stringify({ a: 1 })}\n\n${JSON.stringify({ b: 2 })}\n`,
    );
    writeFileSync(good, bytes);
    expect(tool.rowsOf(good, sha256(bytes))).toEqual([{ a: 1 }, { b: 2 }]);
    const bad = path.join(dir, "bad.jsonl.gz");
    writeFileSync(bad, "not gzip at all");
    expect(() => tool.rowsOf(bad, sha256(bytes))).toThrow(
      /SHA-256 [0-9a-f]{64}, not [0-9a-f]{64}: nothing written/,
    );
  });

  it("refuses a call it does not know (exit 1, its usage)", () => {
    for (const args of [["--bogus"], ["--out"], ["--out", "a", "b"]]) {
      const r = spawnSync(process.execPath, [TOOL, ...args], {
        encoding: "utf8",
        timeout: 50_000,
      });
      expect(r.status, args.join(" ")).toBe(1);
      expect(r.stderr).toMatch(/usage: copyh-known\.cjs \[--out <file>\]/);
    }
  }, 60_000);
});

describe("the committed copyh/known.json", () => {
  const known = JSON.parse(
    readFileSync(path.join(PACKAGE_ROOT, "copyh", "known.json"), "utf8"),
  ) as Record<string, unknown> & {
    mondays: string[];
    find6exits: string[];
    x3: string[];
    x3voted: string[];
    x3find3: string[];
  };
  const [copies, x3, x3find3, mondays] = REPRODUCTION;

  it("holds the record's counts, each set sorted and once, X3's subsets inside it", () => {
    expect(known.mondays).toHaveLength(mondays);
    expect(known.find6exits).toHaveLength(copies);
    expect(known.x3).toHaveLength(x3);
    expect(known.x3find3).toHaveLength(x3find3);
    for (const set of [
      known.find6exits,
      known.x3,
      known.x3voted,
      known.x3find3,
    ])
      expect(set).toEqual([...new Set(set)].sort());
    const inX3 = new Set(known.x3);
    expect(known.x3voted.every((i) => inX3.has(i))).toBe(true);
    expect(known.x3find3.every((i) => inX3.has(i))).toBe(true);
  });
});
