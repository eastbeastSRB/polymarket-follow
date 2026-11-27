/**
 * FRESH-2's sealed judgment (src/copyh/fresh2.ts; rules.md C14, RM1), on
 * statistics written out: each reading and sentence, in their order
 * (WITHHELD before the bounds; no error; both lower bounds and the three
 * sign conditions), each bound on both sides with a margin and at exactly
 * 0, at a try's 1.96 and at MAIN's 1.645. FRESH-2's stage (C14 (4)):
 * MAIN's prints in FRESH-2's form (no cascade print, no null mean gross,
 * the day and month prints named as what they are); the judged sets (MAIN
 * at a KEEP, its verdict the first KEEP or DROP of its looks; each try
 * confirmed on S); the one funding list composed of both; the refusals in
 * their order, each exit 5, before anything of FRESH-2 is read (no yes to
 * confirm among them).
 */
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Z_SEAL } from "../src/copyh/design.js";
import { fresh2Report, sealedOf } from "../src/copyh/fresh2.js";
import type { Report } from "../src/copyh/prints.js";
import { AlreadyRun, StoreError, exitOf, sha256 } from "../src/copyh/run.js";
import {
  LOOK_FILES,
  composedFunding,
  judgedSetsOf,
  readyForFresh2,
} from "../src/copyh/steps.js";
import type { Try } from "../src/copyh/tries.js";
import {
  R12_LINE,
  type Statistic,
  type Verdict,
} from "../src/copyh/verdict.js";

const line = (mean: number, se: number | null) => ({
  n: 300,
  mean,
  se,
  seTrader: se,
  seDay: se,
  seIid: se,
  traders: 40,
  days: 90,
});
/** A set's statistic: the money's m and SE, the edge's m′ and SE′ (byDay's mean, the larger error), the share unpriced, the sign means. */
const stat = (
  o: {
    m?: number;
    se?: number | null;
    mp?: number;
    sep?: number | null;
    unpriced?: number;
    signs?: Partial<Statistic["signs"]>;
    noMoney?: boolean;
  } = {},
): Statistic => ({
  copies: 300,
  unpriced: Math.round((o.unpriced ?? 0) * 300),
  unpricedShare: o.unpriced ?? 0,
  money:
    o.noMoney === true ? null : line(o.m ?? 10, o.se === undefined ? 2 : o.se),
  edge: {
    byDay: line(o.mp ?? 9, 1),
    byWeek: line(o.mp ?? 9, 1.5),
    se: o.sep === undefined ? 1.5 : o.sep,
  },
  signs: { traders: 1, days: 1, withoutThin: 1, ...o.signs },
});
const yes = (x: number, y: number) => [
  `Confirmed on FRESH-2: m − z·SE = ${x.toFixed(1)} bps a copy and m′ − z·SE′ = ${y.toFixed(1)}, both above 0; the traders' own means, the days' own means and the copies without thin legs are above 0 too.`,
  R12_LINE,
];
const no = (x: number, y: number) => [
  `Not confirmed on FRESH-2: m − z·SE = ${x.toFixed(1)} bps a copy and m′ − z·SE′ = ${y.toFixed(1)}; a yes needs both above 0 and the three conditions.`,
  R12_LINE,
];

describe("the sealed judgment on FRESH-2 (C14, RM1)", () => {
  it("bars a try at 1.96 and MAIN's KEEP at 1.645", () => {
    expect(Z_SEAL).toEqual([1.96, 1.645]);
  });

  it("confirms when both lower bounds are above 0, each bound on both sides with a margin, at a try's 1.96 and MAIN's 1.645", () => {
    for (const z of Z_SEAL) {
      const m = 2 * z;
      expect(sealedOf(stat({ m: m + 0.02 }), z)).toEqual({
        reading: "CONFIRMED",
        z,
        sentences: yes(m + 0.02 - z * 2, 9 - z * 1.5),
      });
      expect(sealedOf(stat({ m: m - 0.02 }), z)).toEqual({
        reading: "NOT CONFIRMED",
        z,
        sentences: no(m - 0.02 - z * 2, 9 - z * 1.5),
      });
      // A lower bound of exactly 0 (m = z·SE) is not above 0.
      expect(sealedOf(stat({ m }), z).reading).toBe("NOT CONFIRMED");
      const mp = 1.5 * z;
      expect(sealedOf(stat({ m: 9, mp }), z).reading).toBe("NOT CONFIRMED");
      expect(sealedOf(stat({ m: 9, mp: mp + 0.02 }), z)).toEqual({
        reading: "CONFIRMED",
        z,
        sentences: yes(9 - z * 2, mp + 0.02 - z * 1.5),
      });
      expect(sealedOf(stat({ m: 9, mp: mp - 0.02 }), z)).toEqual({
        reading: "NOT CONFIRMED",
        z,
        sentences: no(9 - z * 2, mp - 0.02 - z * 1.5),
      });
    }
  });

  it("confirms only when the three sign conditions hold", () => {
    for (const signs of [{ traders: 0 }, { days: null }, { withoutThin: -1 }])
      expect(sealedOf(stat({ m: 9, signs }), 1.96)).toEqual({
        reading: "NOT CONFIRMED",
        z: 1.96,
        sentences: no(9 - 1.96 * 2, 9 - 1.96 * 1.5),
      });
  });

  it("withholds a set of more than 2% unpriced before the bounds, and not one of 2%", () => {
    expect(sealedOf(stat({ unpriced: 0.0201 }), 1.96)).toEqual({
      reading: "WITHHELD",
      z: 1.96,
      sentences: [
        "Withheld on FRESH-2: 2.0% of the copies were unpriced, above the 2% limit.",
        R12_LINE,
      ],
    });
    expect(sealedOf(stat({ m: 9, unpriced: 0.02 }), 1.96).reading).toBe(
      "CONFIRMED",
    );
    expect(sealedOf(stat({ se: null, unpriced: 0.05 }), 1.645).reading).toBe(
      "WITHHELD",
    );
  });

  it("gives no error's reading for an empty set or one whose SE or SE′ cannot be computed", () => {
    for (const s of [
      stat({ noMoney: true }),
      stat({ se: null }),
      stat({ sep: null }),
    ])
      expect(sealedOf(s, 1.645)).toEqual({
        reading: "NOT CONFIRMED",
        z: 1.645,
        sentences: [
          "Not confirmed on FRESH-2: no error could be computed.",
          R12_LINE,
        ],
      });
  });
});

describe("MAIN's prints in FRESH-2's form (C14 (4) 5.: no move of a crash hour)", () => {
  it("drops the cascade print and the null mean gross, names the day and month prints as what they are, and takes every other print as it is", () => {
    const report = {
      r14: { copies: 3, worstDay: "the worst day" },
      lines: "the lines",
      parts: { sides: "the sides", months: "the months", slices: "slices" },
      venues: "the venues",
      h1: {
        nullMeanGross: 1.5,
        d: "d",
        edge: "the edge",
        moneyByWeek: "by week",
        moneyByMonth: "by month",
      },
      concentration: "concentration",
      settled: "settled",
      thin: "thin",
      gap: "gap",
      cascade: "the cascade",
    } as unknown as Report;
    expect(fresh2Report(report)).toEqual({
      r14: {
        copies: 3,
        "COPY-H's copies by UTC day: the worst": "the worst day",
      },
      lines: "the lines",
      parts: {
        sides: "the sides",
        slices: "slices",
        "COPY-H's copies by UTC month": "the months",
      },
      venues: "the venues",
      h1: {
        d: "d",
        edge: "the edge",
        moneyByWeek: "by week",
        moneyByMonth: "by month",
      },
      concentration: "concentration",
      settled: "settled",
      thin: "thin",
      gap: "gap",
    });
  });
});

const STAT: Statistic = {
  copies: 0,
  unpriced: 0,
  unpricedShare: 0,
  money: null,
  edge: { byDay: null, byWeek: null, se: null },
  signs: { traders: null, days: null, withoutThin: null },
};
const TRIES: Try[] = [
  {
    name: "a",
    line: "BROAD",
    conditions: [{ covariate: "coin", op: "=", value: 2 }],
    why: "made-up",
  },
  { name: "b", line: "MAIN", conditions: [], why: "made-up" },
];
const asSet = (t: Try) => ({
  kind: "try" as const,
  name: t.name,
  line: t.line,
  conditions: t.conditions,
  z: 1.96,
});
const MAIN_SET = {
  kind: "MAIN" as const,
  name: "MAIN",
  line: "MAIN" as const,
  conditions: [],
  z: 1.645,
};
const codeOf = (f: () => unknown): number | null => {
  try {
    f();
    return null;
  } catch (err) {
    return exitOf(err).code;
  }
};

describe("FRESH-2's judged sets (C14 (4); C12's verdict)", () => {
  const confirmed = (...readings: string[]) =>
    TRIES.map((t, k) => ({ name: t.name, reading: readings[k]! }));

  it("judges MAIN at 1.645 when its verdict, the first KEEP or DROP of its looks, is KEEP, then each try confirmed on S at 1.96 in the choice's order", () => {
    const none = confirmed("NOT CONFIRMED", "WITHHELD");
    expect(judgedSetsOf(["KEEP", "DROP"], TRIES, none)).toEqual([MAIN_SET]);
    expect(judgedSetsOf(["TOO FEW TO TELL", "KEEP"], TRIES, none)).toEqual([
      MAIN_SET,
    ]);
    expect(judgedSetsOf(["WITHHELD", "KEEP"], TRIES, none)).toEqual([MAIN_SET]);
    expect(judgedSetsOf(["DROP", "KEEP"], TRIES, none)).toEqual([]);
    expect(judgedSetsOf(["TOO FEW TO TELL", "WITHHELD"], TRIES, none)).toEqual(
      [],
    );
    expect(
      judgedSetsOf(
        ["TOO FEW TO TELL", "DROP"],
        TRIES,
        confirmed("NOT CONFIRMED", "CONFIRMED"),
      ),
    ).toEqual([asSet(TRIES[1]!)]);
    expect(
      judgedSetsOf(
        ["KEEP", "KEEP"],
        TRIES,
        confirmed("CONFIRMED", "CONFIRMED"),
      ),
    ).toEqual([MAIN_SET, asSet(TRIES[0]!), asSet(TRIES[1]!)]);
    expect(judgedSetsOf(["KEEP", "KEEP"], [], [])).toEqual([MAIN_SET]);
  });

  it("refuses confirmations that are not the chosen tries, by place and name (exit 5)", () => {
    for (const c of [
      [...confirmed("CONFIRMED", "CONFIRMED")].reverse(),
      confirmed("CONFIRMED", "CONFIRMED").slice(1),
      [
        { name: "a", reading: "CONFIRMED" },
        { name: "c", reading: "CONFIRMED" },
      ],
    ]) {
      const f = () => judgedSetsOf(["KEEP", "KEEP"], TRIES, c);
      expect(f).toThrow(StoreError);
      expect(codeOf(f)).toBe(5);
    }
  });
});

describe("FRESH-2's one funding list (the supervisor's ruling, 2026-11-27)", () => {
  const H = (n: number) => n.toString(16).padStart(64, "0");
  const lists = () => {
    const dir = mkdtempSync(path.join(tmpdir(), "funding-lists-"));
    const one = path.join(dir, "funding.sha256");
    const two = path.join(dir, "funding2.sha256");
    writeFileSync(
      one,
      `${H(1)} *info/fundingHistory/BTC/1.json\n${H(2)} *info/fundingHistory/ETH/1.json\n`,
    );
    writeFileSync(two, `${H(3)} *info/fundingHistory/BTC/9.json`);
    return { dir, one, two };
  };

  it("writes both lists' windows, each once, into one list in the engine folder", () => {
    const l = lists();
    const file = composedFunding(path.join(l.dir, "engine"), [l.one, l.two]);
    expect(file).toBe(path.join(l.dir, "engine", "funding.sha256"));
    expect(readFileSync(file, "utf8")).toBe(
      `${readFileSync(l.one, "utf8")}${readFileSync(l.two, "utf8")}\n`,
    );
  });

  it("refuses a window in both lists and a missing list (exit 5)", () => {
    const l = lists();
    writeFileSync(l.two, `${H(4)} *info/fundingHistory/ETH/1.json\n`);
    const twice = () => composedFunding(path.join(l.dir, "e"), [l.one, l.two]);
    expect(twice).toThrow(/info\/fundingHistory\/ETH\/1\.json twice/);
    expect(codeOf(twice)).toBe(5);
    const gone = () =>
      composedFunding(path.join(l.dir, "e"), [
        l.one,
        path.join(l.dir, "none.sha256"),
      ]);
    expect(gone).toThrow(/none\.sha256: FRESH-2's funding reads it/);
    expect(codeOf(gone)).toBe(5);
  });
});

describe("FRESH-2's refusals (C14 (4), in their order, before anything of FRESH-2 is read)", () => {
  const VALUES = {
    labelFills: 13_000_000,
    historyFills: 8_500_000,
    markMinutes: 5,
  } as const;
  /** A COPY-H folder with steps 1's and 2's results and stores' files, and a package folder whose look2.sha256 and choice.json name them. */
  function fresh2World(
    o: { v1?: Verdict; v2?: Verdict; readings?: string[] } = {},
  ) {
    const root = path.join(
      mkdtempSync(path.join(tmpdir(), "fresh2-")),
      "COPY-H",
    );
    const pkg = mkdtempSync(path.join(tmpdir(), "fresh2-pkg-"));
    const put = (file: string, text: string) => {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, text);
    };
    put(
      path.join(root, "repro.json"),
      `{"identity":{"program":"this"},"passed":true}`,
    );
    const storeOf = (look: string, of: string) => {
      const files = {
        "store/manifest.json": `${of}'s manifest`,
        "builds.json": `${of}'s builds`,
        "integrity/integrity.json": `${of}'s integrity`,
      };
      for (const [n, text] of Object.entries(files))
        put(path.join(look, ...n.split("/")), text);
      return Object.fromEntries(
        Object.entries(files).map(([n, text]) => [n, sha256(text)]),
      );
    };
    const Z = "0".repeat(64);
    const resultOf = (
      look: 1 | 2,
      verdict: Verdict,
      files: Record<string, string>,
    ) => ({
      identity: { files },
      look,
      z: look === 1 ? 2.81 : 2.43,
      verdict,
      sentences: [],
      after: false,
      statistic: STAT,
      positions: {
        lines: 0,
        sha256: Z,
        file: { name: "positions.jsonl.gz", sha256: Z },
      },
    });
    const look1 = path.join(root, "look1");
    const look2 = path.join(root, "look2");
    put(
      path.join(look1, "result.json"),
      JSON.stringify(
        resultOf(1, o.v1 ?? "TOO FEW TO TELL", storeOf(look1, "E")),
      ),
    );
    const readings = o.readings ?? ["CONFIRMED", "NOT CONFIRMED"];
    put(
      path.join(look2, "result.json"),
      JSON.stringify({
        ...resultOf(2, o.v2 ?? "TOO FEW TO TELL", {
          "look1/result.json": sha256(
            readFileSync(path.join(look1, "result.json")),
          ),
          ...storeOf(look2, "S"),
        }),
        confirmations: TRIES.map((t, k) => ({
          name: t.name,
          line: t.line,
          statistic: STAT,
          reading: readings[k],
          s: null,
          z: null,
          sentences: [],
        })),
      }),
    );
    put(path.join(look2, "positions.jsonl.gz"), "S's positions");
    put(path.join(look2, "report.json"), "S's report");
    put(
      path.join(pkg, "copyh", "look2.sha256"),
      LOOK_FILES.map(
        (f) => `${sha256(readFileSync(path.join(look2, f)))} *${f}\n`,
      ).join(""),
    );
    const choice = (tries: readonly Try[]) =>
      put(
        path.join(pkg, "copyh", "choice.json"),
        JSON.stringify({ chosen: tries.map((t) => ({ try: t })) }),
      );
    choice(TRIES);
    const ready =
      (v: Parameters<typeof readyForFresh2>[0]["values"] = VALUES) =>
      () =>
        readyForFresh2({ root, packageRoot: pkg, program: "this", values: v });
    return { root, pkg, look1, look2, put, choice, ready };
  }

  it("passes with every earlier file held, giving the values and the judged sets", () => {
    expect(fresh2World().ready()()).toEqual({
      values: VALUES,
      sets: [asSet(TRIES[0]!)],
    });
    expect(
      fresh2World({
        v1: "KEEP",
        readings: ["NOT CONFIRMED", "CONFIRMED"],
      }).ready()().sets,
    ).toEqual([MAIN_SET, asSet(TRIES[1]!)]);
  });

  it("refuses a second run, repro.json not this program's, an unset value, step 2's files changed, step 1's result not the one step 2 names, E's or S's store changed, no choice or another, and no yes to confirm, each exit 5, in that order", () => {
    const w = fresh2World();
    const refused = (f: () => unknown, why: string | RegExp) => {
      expect(f).toThrow(why);
      expect(codeOf(f)).toBe(5);
    };
    const changed = (file: string, check: () => void) => {
      const bytes = readFileSync(file);
      writeFileSync(file, Buffer.concat([bytes, Buffer.from(" ")]));
      check();
      writeFileSync(file, bytes);
    };
    w.put(path.join(w.root, "fresh2", "result.json"), "{}");
    expect(w.ready()).toThrow(AlreadyRun);
    refused(w.ready(), /FRESH-2's stage runs once/);
    rmSync(path.join(w.root, "fresh2", "result.json"));
    const repro = path.join(w.root, "repro.json");
    const passed = readFileSync(repro);
    writeFileSync(repro, `{"identity":{"program":"other"},"passed":true}`);
    refused(w.ready(), /another program's \(other\)/);
    writeFileSync(repro, passed);
    refused(
      w.ready({ ...VALUES, labelFills: null }),
      "unset: LABEL_FILLS_MAX (C17)",
    );
    for (const f of LOOK_FILES) {
      const file = path.join(w.look2, f);
      changed(file, () =>
        refused(w.ready(), `${file} is not the file look2.sha256 names`),
      );
    }
    const r1 = path.join(w.look1, "result.json");
    changed(r1, () =>
      refused(
        w.ready(),
        `${r1} is not the file ${w.look2}'s result.json names`,
      ),
    );
    for (const look of [w.look1, w.look2])
      for (const name of [
        "store/manifest.json",
        "builds.json",
        "integrity/integrity.json",
      ]) {
        const file = path.join(look, ...name.split("/"));
        changed(file, () =>
          refused(
            w.ready(),
            `${file} is not the file ${look}'s result.json names`,
          ),
        );
      }
    rmSync(path.join(w.pkg, "copyh", "choice.json"));
    refused(w.ready(), /no the rounds' choice that parses/);
    w.choice([...TRIES].reverse());
    refused(w.ready(), /are not the chosen tries of copyh\/choice\.json/);
    w.choice(TRIES);
    expect(() => w.ready()()).not.toThrow();
    const no = fresh2World({
      v1: "DROP",
      v2: "KEEP",
      readings: ["NOT CONFIRMED", "WITHHELD"],
    });
    refused(no.ready(), /no yes to confirm/);
  });
});
