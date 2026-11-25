/**
 * COPY-H's seals (src/copyh/seal.ts; rules.md C0, "the seals"): S is refused
 * before step 2 (FRESH's raw store and COPY-H's S folder, by name and
 * through a junction by real path; keys dated at or after END_E, one
 * millisecond either side); FRESH-2's folders and keys at or after END_S
 * until FRESH-2's freeze, the analyzer's folders and anything at or after
 * END_F2 always; the instants a reader checks (`checkInstant`, `endOf`);
 * a path sealed by its name is never resolved; a path outside the run's roots is refused, by name and
 * through a junction inside a root; nothing is written in COPYH-FUNDING's
 * folder.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { END_E, END_F2, END_S } from "../src/copyh/design.js";
import { RANGES } from "../src/copyh/range.js";
import {
  SEALED,
  SealedError,
  checkInside,
  checkInstant,
  checkKey,
  checkPath,
  checkWrite,
  endOf,
  type Seal,
} from "../src/copyh/seal.js";
import { HOUR_MS } from "../src/schedule.js";
import { keyDate } from "../src/waveh/keys.js";

const OPEN: Seal = { sOpen: true, f2Open: false };
const F2OPEN: Seal = { sOpen: true, f2Open: true };
const tmp = (name: string) => mkdtempSync(path.join(tmpdir(), `${name}-`));
const fillAt = (t: number) =>
  `node_fills_by_block/hourly/${new Date(t).toISOString().slice(0, 10).replaceAll("-", "")}/${new Date(t).getUTCHours()}.lz4`;

describe("the seal's paths", { timeout: 60_000 }, () => {
  const S_PATHS = [
    "F:\\research\\FRESH\\store\\node_fills_by_block\\hourly\\20260601\\3.lz4",
    "F:\\research\\COPY-H\\S\\store\\manifest.json",
    "f:/x/fresh/STORE/a.lz4",
    "F:\\x\\WAVE-H\\..\\FRESH\\store\\a.lz4",
    "F:\\x\\FRESH\\.\\store\\a.lz4",
    "F:\\x\\FRESH\\\\store\\a.lz4",
    "\\\\localhost\\F$\\x\\COPY-H\\S\\parts\\1.part",
    "\\\\?\\F:\\x\\copy-h\\s",
  ];
  const F2_PATHS = [
    "F:\\research\\FRESH-2\\store\\node_fills_by_block\\hourly\\20261201\\3.lz4",
    "F:\\x\\fresh-2",
  ];
  const ALWAYS = [
    "F:\\research\\ANALYZER\\WAVE-H\\store\\liq\\2025-10\\closedPnl.f64",
    "f:/x/analyzer/fresh/store/manifest.json",
  ];
  const FREE = [
    "F:\\research\\WAVE-H\\store\\node_fills\\hourly\\20250601\\3.lz4",
    "F:\\research\\COPY-H\\E\\store\\manifest.json",
    "F:\\research\\COPY-H\\burnin\\parts\\1.part",
    "F:\\research\\COPY-H\\funding\\info\\meta.json",
    "F:\\x\\FRESH\\store\\..\\..\\WAVE-H\\store\\a.lz4",
    "F:\\x\\FRESH\\notes.txt",
    "F:\\x\\S\\store\\a",
  ];

  it("refuses S's folders while S is closed, and passes them open", () => {
    for (const p of S_PATHS) {
      expect(() => checkPath(p), p).toThrow(SealedError);
      expect(() => checkPath(p, SEALED), p).toThrow("sealed until step 2");
      expect(() => checkPath(p, OPEN), p).not.toThrow();
      expect(() => checkPath(p, F2OPEN), p).not.toThrow();
    }
  });

  it("refuses FRESH-2's folders until FRESH-2's freeze, and passes them under it", () => {
    for (const p of F2_PATHS) {
      for (const seal of [SEALED, OPEN])
        expect(() => checkPath(p, seal), p).toThrow(
          "sealed until FRESH-2's freeze",
        );
      expect(() => checkPath(p, F2OPEN), p).not.toThrow();
    }
  });

  it("refuses the analyzer's folders always, whatever is open", () => {
    for (const p of ALWAYS)
      for (const seal of [SEALED, OPEN, F2OPEN])
        expect(() => checkPath(p, seal), p).toThrow("sealed always");
  });

  it("passes every other path, whatever is open", () => {
    for (const p of FREE)
      for (const seal of [SEALED, OPEN, F2OPEN])
        expect(() => checkPath(p, seal), p).not.toThrow();
  });

  it("never resolves a path sealed by its name; any other path it resolves", () => {
    const resolve = vi.spyOn(realpathSync, "native");
    try {
      for (const p of [...S_PATHS, ...F2_PATHS, ...ALWAYS])
        expect(() => checkPath(p), p).toThrow(SealedError);
      expect(resolve).not.toHaveBeenCalled();
      checkPath(path.join(tmp("copyh-seal"), "a.lz4"));
      expect(resolve).toHaveBeenCalled();
    } finally {
      resolve.mockRestore();
    }
  });

  it("refuses a path through a junction into a sealed folder by its real path, and touches nothing there", () => {
    const t = tmp("copyh-seal");
    const fresh = path.join(t, "FRESH", "store");
    const analyzer = path.join(t, "ANALYZER", "x");
    for (const d of [fresh, analyzer]) {
      mkdirSync(d, { recursive: true });
      writeFileSync(path.join(d, "a.lz4"), "synthetic");
    }
    mkdirSync(path.join(t, "WAVE-H"));
    const j1 = path.join(t, "WAVE-H", "store");
    const j2 = path.join(t, "other");
    symlinkSync(fresh, j1, "junction");
    symlinkSync(analyzer, j2, "junction");
    try {
      for (const p of [j1, path.join(j1, "a.lz4"), path.join(j1, "not", "yet")])
        expect(() => checkPath(p), p).toThrow(
          "sealed until step 2, by its real path",
        );
      expect(() => checkPath(path.join(j1, "a.lz4"), OPEN)).not.toThrow();
      expect(() => checkPath(path.join(j2, "a.lz4"), OPEN)).toThrow(
        "sealed always, by its real path",
      );
      expect(() => checkPath(path.join(t, "WAVE-H", "b.lz4"))).not.toThrow();
    } finally {
      // The junctions alone, never what they point at.
      rmdirSync(j1);
      rmdirSync(j2);
    }
    expect(existsSync(path.join(fresh, "a.lz4"))).toBe(true);
  });

  it("never writes in COPYH-FUNDING's folder, by name or through a junction, and writes S's only open", () => {
    const t = tmp("copyh-seal");
    const funding = path.join(t, "COPY-H", "funding");
    mkdirSync(funding, { recursive: true });
    for (const d of [
      funding,
      path.join(funding, "info"),
      "F:\\research\\copy-h\\FUNDING\\x",
    ])
      expect(() => checkWrite(d), d).toThrow("never written");
    const j = path.join(t, "COPY-H", "E");
    symlinkSync(funding, j, "junction");
    try {
      expect(() => checkWrite(path.join(j, "store"))).toThrow("never written");
    } finally {
      rmdirSync(j);
    }
    expect(() => checkWrite(path.join(t, "COPY-H", "E"))).not.toThrow();
    const s = "F:\\research\\COPY-H\\S\\store";
    expect(() => checkWrite(s)).toThrow("sealed until step 2");
    expect(() => checkWrite(s, OPEN)).not.toThrow();
  });
});

describe("the run's roots", { timeout: 60_000 }, () => {
  it("pass a path inside a root, the root itself and any case of it; refuse one outside, `..` out of a root among them", () => {
    const roots = ["F:\\research\\WAVE-H\\store", "F:\\research\\COPY-H"];
    for (const p of [
      "F:\\research\\WAVE-H\\store\\node_fills\\hourly\\20250601\\3.lz4",
      "f:/RESEARCH/copy-h/E/store/manifest.json",
      "F:\\research\\COPY-H",
    ])
      expect(() => checkInside(p, roots), p).not.toThrow();
    for (const p of [
      "F:\\research\\WAVE-H\\other.lz4",
      "F:\\research\\COPY-H2\\x",
      "F:\\research\\WAVE-H\\store\\..\\..\\recordings\\a.jsonl",
      "E:\\elsewhere\\x",
    ])
      expect(() => checkInside(p, roots), p).toThrow(
        "outside the run's folders",
      );
    expect(() => checkInside("F:\\research\\COPY-H\\x", [])).toThrow(
      SealedError,
    );
  });

  it("refuses a path through a junction inside a root that leads out of it, by its real path", () => {
    const t = tmp("copyh-roots");
    const root = path.join(t, "WAVE-H", "store");
    const outside = path.join(t, "elsewhere");
    mkdirSync(root, { recursive: true });
    mkdirSync(outside);
    writeFileSync(path.join(outside, "a.lz4"), "synthetic");
    const j = path.join(root, "node_fills");
    symlinkSync(outside, j, "junction");
    try {
      expect(() => checkInside(path.join(j, "a.lz4"), [root])).toThrow(
        "outside the run's folders, by its real path",
      );
      expect(() =>
        checkInside(path.join(root, "x", "y.lz4"), [root]),
      ).not.toThrow();
    } finally {
      rmdirSync(j);
    }
  });
});

describe("the seal's keys", { timeout: 60_000 }, () => {
  it("passes E's keys closed, WAVE-H's last file among them, and keys dated 1 ms before END_E", () => {
    const last = RANGES.E.fill.at(-1)!;
    expect(keyDate(last)).toBe(END_E - HOUR_MS);
    for (const k of [
      RANGES.E.fill[0]!,
      last,
      "asset_ctxs/20260529.csv.lz4",
      `info/fundingHistory/SOL/${END_E - 1}.json`,
    ])
      expect(() => checkKey(k), k).not.toThrow();
  });

  it("refuses a key dated at or after END_E while S is closed, and passes it open, 1 ms before END_S too", () => {
    for (const k of [
      RANGES.S.fill[0]!,
      fillAt(END_S - HOUR_MS),
      "asset_ctxs/20260530.csv.lz4",
      `info/fundingHistory/SOL/${END_E}.json`,
      `info/fundingHistory/SOL/${END_S - 1}.json`,
    ]) {
      expect(() => checkKey(k), k).toThrow(
        "dated at or after END_E, S's months, sealed until step 2",
      );
      expect(() => checkKey(k, OPEN), k).not.toThrow();
    }
  });

  it("refuses a key dated at or after END_S until FRESH-2's freeze, at or after END_F2 always, and one whose date does not parse", () => {
    for (const k of [
      fillAt(END_S),
      "asset_ctxs/20261116.csv.lz4",
      `info/fundingHistory/SOL/${END_S}.json`,
      fillAt(END_F2 - HOUR_MS),
    ]) {
      for (const seal of [SEALED, OPEN])
        expect(() => checkKey(k, seal), k).toThrow(
          "dated at or after END_S, FRESH-2's months, sealed until FRESH-2's freeze",
        );
      expect(() => checkKey(k, F2OPEN), k).not.toThrow();
    }
    for (const k of [fillAt(END_F2), `info/fundingHistory/SOL/${END_F2}.json`])
      for (const seal of [SEALED, OPEN, F2OPEN])
        expect(() => checkKey(k, seal), k).toThrow(
          "dated at or after END_F2, sealed always",
        );
    for (const k of ["node_fills/hourly/2025061/3.lz4", "copyh/x.json"])
      expect(() => checkKey(k, F2OPEN), k).toThrow("no date that parses");
  });

  it("refuses a fill, row or minute from the seal's end, 1 ms either side of each END", () => {
    expect([endOf(SEALED), endOf(OPEN), endOf(F2OPEN)]).toEqual([
      END_E,
      END_S,
      END_F2,
    ]);
    const cases: [number, Seal, string | null][] = [
      [END_E - 1, SEALED, null],
      [END_E, SEALED, "at or after END_E, S's months, sealed until step 2"],
      [END_E, OPEN, null],
      [END_S - 1, OPEN, null],
      [
        END_S,
        OPEN,
        "at or after END_S, FRESH-2's months, sealed until FRESH-2's freeze",
      ],
      [END_S, F2OPEN, null],
      [END_F2 - 1, F2OPEN, null],
      [END_F2, F2OPEN, "at or after END_F2, sealed always"],
    ];
    for (const [t, seal, why] of cases) {
      const check = () => checkInstant(t, "a funding row", seal);
      if (why === null) expect(check, String(t)).not.toThrow();
      else
        expect(check, String(t)).toThrow(
          `a funding row at ${new Date(t).toISOString()}: ${why}`,
        );
    }
  });
});
