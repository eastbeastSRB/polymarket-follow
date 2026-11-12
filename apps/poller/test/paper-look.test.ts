/**
 * The looks (R1, R12, R14, R16): `look()` end to end over the synthetic world
 * of `paper-e2e.ts`, and `lookReport` on made-up copies — what decides at a
 * look (the voted, priced set, its own look's z, the unpriced share, the mean
 * d) and the printed band.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BACKUP_FAILED,
  lacksOf,
  pageData,
  scoreInput,
  type FixedInputs,
  type LookDone,
} from "../src/paper/daily.js";
import { renderPage, renderPositions } from "../src/paper/page.js";
import { parseRuleBook } from "../src/paper/rulebook.js";
import { CUT, LOOK_ENDS } from "../src/paper/instants.js";
import { PaperStore } from "../src/paper/store.js";
import { loadResearch } from "../src/paper/research.js";
import {
  LINES,
  score,
  type CopyRecord,
  type Scored,
} from "../src/paper/score.js";
import { LOOK_Z, twoWay } from "../src/paper/stats.js";
import { besideLines, lookReport } from "../src/paper/summary.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import {
  A,
  C,
  at,
  bannedWords,
  day,
  docs,
  freeze,
  makeWorld,
  positions,
  slow,
} from "./paper-e2e.js";
import { EMPTY_RULE_BOOK } from "./paper-world.js";

type LookResult = {
  look: number;
  frozen: string;
  afterTheVerdict: { look: number; verdict: string } | null;
  unreadListedAsHoles: { addr: string; P: number; due: number }[];
  marketDaysMissing: string[];
  lines: ReturnType<typeof lookReport>[];
  beside: ReturnType<typeof besideLines>;
};

const pageText = (paper: string) =>
  readFileSync(path.join(paper, "page", "index.html"), "utf8");

const resultOf = (paper: string, k: number): LookResult =>
  JSON.parse(
    readFileSync(path.join(paper, "looks", `L${k}`, "result.json"), "utf8"),
  ) as LookResult;

/** R12 as written, for a check of the code's verdict: DROP wins, WITHHELD above 2% unpriced. */
function verdictByHand(f: {
  mean: number;
  se: number | null;
  z: number;
  meanD: number | null;
  unpricedShare: number;
}): string {
  if (f.unpricedShare > 0.02) return "WITHHELD";
  if (f.se === null) return "TOO FEW TO TELL";
  if (f.mean + f.z * f.se < 10) return "DROP";
  if (f.mean - f.z * f.se > 0 && f.meanD !== null && f.meanD > 0) return "KEEP";
  return "TOO FEW TO TELL";
}

describe("a look, look() (R1, R12, R16)", () => {
  it(
    "refuses without a freeze, before its Monday and a second time; waits for unfinished reads and runs a week later listing them; writes MAIN's figures as the day's log of every copy gives them; marks a look after the verdict",
    { timeout: 120_000 },
    async () => {
      const tmp = mkdtempSync(path.join(tmpdir(), "paper-look-"));
      try {
        const { pkg, paperRoot, run, runLook } = await makeWorld(tmp);
        const root = paperRoot("paper");
        const late = paperRoot("paper-late");
        const END_1 = LOOK_ENDS[0];

        // No freeze: refused, nothing written.
        expect(await runLook(root, 1, "2026-12-21T05:00:00Z")).toBe(4);
        expect(existsSync(path.join(root, "looks"))).toBe(false);
        const frozen = freeze(pkg);

        // The day's run whose END is look 1's: every read from the cut.
        expect((await run(root, "2026-12-19T04:00:00Z")).exit).toBe(0);
        // The next day's page, before look 1 has run: the next look is still look 1.
        expect((await run(root, "2026-12-20T04:00:00Z")).exit).toBe(0);
        expect(pageText(root)).toContain(
          '<div class="box"><strong>Too early to judge — next look 2026-12-19.</strong></div>',
        );
        // Before its Monday, END_1 + 2 days: refused.
        expect(await runLook(root, 1, "2026-12-20T23:59:59Z")).toBe(5);
        expect(existsSync(path.join(root, "looks"))).toBe(false);
        // On its Monday, the reads complete: it runs, once.
        expect(await runLook(root, 1, "2026-12-21T05:00:00Z")).toBe(0);
        expect(await runLook(root, 1, "2026-12-22T05:00:00Z")).toBe(5);
        const r1 = resultOf(root, 1);
        expect(r1).toMatchObject({
          look: 1,
          frozen,
          afterTheVerdict: null,
          unreadListedAsHoles: [],
          marketDaysMissing: [],
        });
        expect(r1.lines.map((l) => l.line)).toEqual([...LINES]);

        // MAIN as the day's log of every copy at END_1 gives it: the voted copies, money on the priced ones.
        const set = positions(root, "2026-12-19").filter(
          (c) => c.lines.includes("MAIN") && c.voted,
        );
        const priced = set.filter((c) => c.money !== null);
        const items = priced.map((c) => ({
          addr: c.addr,
          tIn: c.tIn,
          x: c.money!.net,
        }));
        const m = twoWay(kit, items)!;
        const ds = set.flatMap((c) =>
          c.d.MAIN === null || c.d.MAIN === undefined ? [] : [c.d.MAIN],
        );
        const meanD = ds.length
          ? ds.reduce((s, x) => s + x, 0) / ds.length
          : null;
        const main = r1.lines.find((l) => l.line === "MAIN")!;
        expect(set).toHaveLength(42);
        expect(main.copies).toBe(42);
        expect(main.traders).toBe(2);
        expect(main.z).toBe(2.81);
        expect(main.unpricedShare).toBe(
          (set.length - priced.length) / set.length,
        );
        expect(main.money!.mean).toBeCloseTo(
          items.reduce((s, i) => s + i.x, 0) / items.length,
          9,
        );
        expect(main.money!.se).toBeCloseTo(m.se!, 9);
        expect(main.d!.mean).toBeCloseTo(meanD!, 9);
        expect(r1.beside.withoutGapCopies.n).toBe(
          priced.filter((c) => !c.gap).length,
        );
        expect(
          r1.lines.filter((l) => l.verdict !== null).map((l) => l.line),
        ).toEqual(main.verdict === null ? [] : ["MAIN"]);
        expect(main.verdict).toBe(
          verdictByHand({
            mean: m.mean,
            se: m.se,
            z: 2.81,
            meanD,
            unpricedShare: main.unpricedShare,
          }),
        );

        // The page after look 1: its MAIN verdict and sentence (R15), the next look's date if neither KEEP nor DROP.
        expect((await run(root, "2026-12-21T06:00:00Z")).exit).toBe(0);
        const decided = main.verdict === "KEEP" || main.verdict === "DROP";
        expect(pageText(root)).toContain(
          `<div class="box"><strong>Look 1 (2026-12-19): the main line ${main.verdict}. ${main.sentence}${decided ? "" : " Next look 2027-02-06."}</strong></div>`,
        );

        // Unfinished reads: the late folder's last run was on 12-14. The look waits a week, then runs and lists them.
        expect((await run(late, "2026-12-14T04:00:00Z")).exit).toBe(0);
        expect(await runLook(late, 1, "2026-12-21T05:00:00Z")).toBe(5);
        expect(await runLook(late, 1, "2026-12-27T23:59:59Z")).toBe(5);
        expect(existsSync(path.join(late, "looks"))).toBe(false);
        expect(await runLook(late, 1, "2026-12-28T00:00:00Z")).toBe(0);
        const forced = resultOf(late, 1);
        const read14 = at("2026-12-14T00:00:00Z");
        expect(forced.unreadListedAsHoles).toEqual([
          { addr: A, P: read14, due: END_1 },
          { addr: C, P: read14, due: END_1 },
        ]);
        expect(forced.marketDaysMissing).toEqual(
          ["14", "15", "16", "17", "18"].map((d) => `6 2026-12-${d}`),
        );

        // The page escapes a look's words: the latest look's, here a made-up look 3.
        mkdirSync(path.join(late, "looks", "L3"), { recursive: true });
        writeFileSync(
          path.join(late, "looks", "L3", "result.json"),
          JSON.stringify({
            lines: [
              { line: "MAIN", verdict: "KEEP", sentence: "<i>x</i> & y" },
            ],
          }),
        );
        expect((await run(late, "2026-12-28T06:00:00Z")).exit).toBe(0);
        expect(pageText(late)).toContain(
          "Look 3 (2027-05-08): the main line KEEP. &#60;i&#62;x&#60;/i&#62; &#38; y</strong>",
        );

        // After the verdict: a look after one whose MAIN said KEEP or DROP is marked so; after any other, not.
        mkdirSync(path.join(late, "looks", "L1"), { recursive: true });
        writeFileSync(
          path.join(late, "looks", "L1", "result.json"),
          JSON.stringify({ lines: [{ line: "MAIN", verdict: "DROP" }] }),
        );
        expect(await runLook(late, 2, "2027-02-15T00:00:00Z")).toBe(0);
        expect(resultOf(late, 2).afterTheVerdict).toEqual({
          look: 1,
          verdict: "DROP",
        });
        expect(await runLook(root, 2, "2027-02-15T00:00:00Z")).toBe(0);
        expect(resultOf(root, 2).afterTheVerdict).toEqual(
          main.verdict === "KEEP" || main.verdict === "DROP"
            ? { look: 1, verdict: main.verdict }
            : null,
        );
        expect(resultOf(root, 2).lines[0]!.z).toBe(2.43);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    },
  );

  it(
    "reads nothing after its END: an exit a later run stored never reaches an earlier look (R1)",
    { timeout: 60_000 },
    async () => {
      const tmp = mkdtempSync(path.join(tmpdir(), "paper-look-"));
      try {
        const { pkg, kit, fixed, paperRoot, run } = await makeWorld(tmp);
        freeze(pkg);
        const root = paperRoot("paper");
        // Read through 12-21: A's position of 12-18, open at END_1, and its exit on 12-19 are stored.
        expect((await run(root, "2026-12-21T04:00:00Z")).exit).toBe(0);
        const store = new PaperStore(root);
        const a18 = slow[A]!.out.find((x) => day(x.open) === "2026-12-18")!;
        const END_1 = LOOK_ENDS[0];
        expect(a18.close).toBeGreaterThan(END_1);
        expect(store.readRows(A).some((r) => r.timestamp === a18.close)).toBe(
          true,
        );
        // Scored at END_1, as a look scores (the market listed, so that the copy exists): open, not crossing.
        const scored = score(
          scoreInput(
            {
              kit,
              store,
              state: store.readState(),
              book: EMPTY_RULE_BOOK,
              cache: new Map(),
              end: END_1,
            },
            fixed,
          ),
        );
        const c = scored.copies.find((x) => x.addr === A && x.t === a18.open)!;
        expect(c.plan.flag).toBe("open");
        expect(c.plan.legs).toEqual([
          {
            h: END_1 - 1 - c.tIn,
            part: 1,
            kind: "cut",
            forced: false,
            liq: false,
          },
        ]);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    },
  );
});

/** A made-up copy: a MAIN entry of A or C on day i after the cut, its money `net`, its d `d`. */
function copy(
  i: number,
  net: number | null,
  d: number | null,
  over: Partial<CopyRecord> = {},
): CopyRecord {
  const t = CUT + i * DAY_MS + 20 * HOUR_MS;
  return {
    id: `e${i}-${String(net)}`,
    addr: i % 2 ? A : C,
    iid: 6,
    dir: 1,
    type: "OPEN",
    t,
    D: 80_000,
    tIn: t + 80_000,
    monday: 0,
    lines: ["MAIN"],
    label: "directional",
    facts: null,
    exits: [],
    plan: { legs: [], flag: null, lastExitT: null },
    entryPrice: 100,
    money:
      net === null
        ? null
        : {
            net,
            gross: net + 8,
            fees: 8,
            funding: 0,
            holdMs: 10 * HOUR_MS,
            fullExitMs: 10 * HOUR_MS,
            fundingMissing: 0,
            spreadFallback: false,
          },
    unpriced: net === null ? "no mark" : null,
    d: { MAIN: d },
    dReason: {},
    voted: true,
    gap: false,
    stop2: null,
    stop5: null,
    days7: null,
    jump: null,
    notional: false,
    competition: { days: false, boosted: false },
    mapOpen: null,
    ...over,
  };
}

const scoredOf = (copies: CopyRecord[]): Scored => ({
  copies,
  otherMarkets: 0,
  p1: new Map(),
});

/** One copy a day for `days` days, the money `base + wobble`, d = `d`. */
const days = (n: number, net: (i: number) => number, d = 5) =>
  Array.from({ length: n }, (_, i) => copy(i, net(i), d));

const kit = await loadResearch();

describe("lookReport (R12, R14)", () => {
  it("prints the band with Student's t at the look's level on the day clusters (df = days - 1)", () => {
    const want = [2.97, 2.48, 2.19];
    for (const [k, n] of [
      [1, 42],
      [2, 91],
      [3, 182],
    ] as const) {
      const r = lookReport(
        kit,
        scoredOf(days(n, (i) => 20 + 30 * Math.sin(i))),
        "MAIN",
        k,
      );
      expect(r.money!.days).toBe(n);
      expect(r.tBandHalfWidth! / r.money!.seDay!).toBeCloseTo(want[k - 1]!, 1);
    }
  });

  it("decides MAIN from its voted, priced copies, its own look's z, its unpriced share and its mean d", () => {
    const wobble = (i: number) => 3 * Math.sin(i);
    const v = (cs: CopyRecord[], k: 1 | 2 | 3 = 1) =>
      lookReport(kit, scoredOf(cs), "MAIN", k).verdict;
    expect(v(days(40, (i) => 50 + wobble(i)))).toBe("KEEP");
    expect(v(days(40, (i) => -50 + wobble(i)))).toBe("DROP");
    expect(v(days(40, (i) => (i % 2 ? 500 : -500) + wobble(i)))).toBe(
      "TOO FEW TO TELL",
    );
    // KEEP needs d's mean above 0 too.
    expect(v(days(40, (i) => 50 + wobble(i), -5))).toBe("TOO FEW TO TELL");
    // One unpriced copy in 41 (2.4%): withheld.
    expect(v([...days(40, (i) => 50 + wobble(i)), copy(40, null, 5)])).toBe(
      "WITHHELD",
    );
    // Copies not yet voted are not in the set.
    const unvoted = Array.from({ length: 10 }, (_, i) =>
      copy(i, -1000, -5, { voted: false, id: `u${i}` }),
    );
    const withUnvoted = lookReport(
      kit,
      scoredOf([...days(40, (i) => 50 + wobble(i)), ...unvoted]),
      "MAIN",
      1,
    );
    expect([withUnvoted.copies, withUnvoted.verdict]).toEqual([40, "KEEP"]);
    // Each look its own z: the mean at 2.5 errors is KEEP at look 3 (2.17), not at look 1 (2.81).
    const base = days(60, (i) => 40 * Math.sin(i * 1.7) + 15 * Math.cos(i));
    const m = twoWay(
      kit,
      base.map((c) => ({ addr: c.addr, tIn: c.tIn, x: c.money!.net })),
    )!;
    const shift = 2.5 * m.se! - m.mean;
    const shifted = days(
      60,
      (i) => 40 * Math.sin(i * 1.7) + 15 * Math.cos(i) + shift,
    );
    expect(m.se! * (2.5 + LOOK_Z[2])).toBeGreaterThan(10);
    expect(v(shifted, 1)).toBe("TOO FEW TO TELL");
    expect(v(shifted, 3)).toBe("KEEP");
  });

  it("says at look 3, when too few to tell, the largest mean result not ruled out", () => {
    const r = lookReport(
      kit,
      scoredOf(days(40, (i) => (i % 2 ? 500 : -500))),
      "MAIN",
      3,
    );
    expect(r.verdict).toBe("TOO FEW TO TELL");
    expect(r.sentence).toBe(
      `no mean result as large as ${(r.money!.mean + LOOK_Z[2] * r.money!.se!).toFixed(1)} bps a position was seen`,
    );
    const r1 = lookReport(
      kit,
      scoredOf(days(40, (i) => (i % 2 ? 500 : -500))),
      "MAIN",
      1,
    );
    expect(r1.sentence).toBe(
      "Keep and drop are verdicts on this test, never instructions to trade.",
    );
  });

  it("prints the lines beside MAIN on its voted copies with MAIN's statistic and no verdict word, and no verdict for the other lines", () => {
    const cs = days(40, (i) => 10 + 3 * i).map((c, i) => ({
      ...c,
      lines: i < 30 ? (["MAIN", "BROAD"] as const) : (["BROAD"] as const),
      voted: i !== 7,
      stop2: i % 4 === 0 ? null : c.money!.net - 1,
      stop5: c.money!.net - 2,
      days7: c.money!.net + 3,
      jump: i % 3 === 0 ? null : i % 3 === 1 ? 5 : 1,
      notional: i % 2 === 0,
      competition: { days: i % 5 === 0, boosted: i % 7 === 0 },
      mapOpen: i % 6 !== 0,
      gap: i % 8 === 0,
    })) as CopyRecord[];
    const b = besideLines(kit, scoredOf(cs));
    const main = cs.filter((c) => c.lines.includes("MAIN") && c.voted);
    const broad = cs.filter((c) => c.voted);
    const check = (
      got: { n: number; mean: number | null; se: number | null },
      sel: CopyRecord[],
      value: (c: CopyRecord) => number | null = (c) => c.money!.net,
    ) => {
      const items = sel.flatMap((c) => {
        const x = value(c);
        return x === null ? [] : [{ addr: c.addr, tIn: c.tIn, x }];
      });
      const m = twoWay(kit, items)!;
      expect(got).toEqual({ n: items.length, mean: m.mean, se: m.se });
    };
    check(b.STOP2, main, (c) => c.stop2);
    check(b.STOP5, main, (c) => c.stop5);
    check(b.DAYS7, main, (c) => c.days7);
    check(
      b.JUMP.above3,
      main.filter((c) => c.jump !== null && c.jump > 3),
    );
    check(
      b.JUMP.upTo3,
      main.filter((c) => c.jump !== null && c.jump <= 3),
    );
    expect(b.JUMP.withoutJ).toBe(main.filter((c) => c.jump === null).length);
    check(
      b.NOTIONAL.board,
      main.filter((c) => c.notional),
    );
    check(
      b.NOTIONAL.rest,
      main.filter((c) => !c.notional),
    );
    check(
      b.COMP.MAIN.withoutCompetitionDays,
      main.filter((c) => !c.competition.days),
    );
    check(
      b.COMP.MAIN.withoutBoostedMarkets,
      main.filter((c) => !c.competition.boosted),
    );
    check(
      b.COMP.BROAD.withoutCompetitionDays,
      broad.filter((c) => !c.competition.days),
    );
    check(
      b.COMP.BROAD.withoutBoostedMarkets,
      broad.filter((c) => !c.competition.boosted),
    );
    check(
      b.mapWouldClose,
      main.filter((c) => c.mapOpen === false),
    );
    check(
      b.withoutGapCopies,
      main.filter((c) => !c.gap),
    );
    expect(JSON.stringify(b)).not.toMatch(/KEEP|DROP|TOO FEW|WITHHELD|verdict/);
    for (const line of ["TEN", "BROAD", "DAY", "FAV"] as const) {
      const r = lookReport(
        kit,
        scoredOf(cs.map((c) => ({ ...c, lines: [line] }))),
        line,
        1,
      );
      expect([r.verdict, r.sentence]).toEqual([null, null]);
    }
  });

  it("names the day that moves the mean most by its date, and never says 'follow' on the page (R14, R15)", () => {
    const r = lookReport(
      kit,
      scoredOf(days(40, (i) => 50 + 40 * Math.sin(i))),
      "MAIN",
      1,
    );
    expect(r.withoutItAndTheMostInfluentialDay!.key).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
    const unpriced = copy(1, null, null, {
      unpriced: "no mark at the follow instant",
    });
    const data = pageData(
      kit,
      scoredOf([unpriced]),
      CUT + 10 * DAY_MS,
      new Map(),
      null,
      [],
      "",
      [null, null, null],
    );
    expect(data.rows[0]!.flags).toContain(
      "unpriced: no mark at the paper entry",
    );
    expect(renderPage(data)).not.toMatch(/follow/i);
    expect(renderPositions(data)).not.toMatch(/follow/i);
  });

  it("puts on the page no word R15 bans, with every verdict and sentence at every look, every unpriced reason and every alarm (R12, R15)", () => {
    const wobble = (i: number) => 3 * Math.sin(i);
    const sets = [
      days(40, (i) => 50 + wobble(i)),
      days(40, (i) => -50 + wobble(i)),
      [...days(40, (i) => 50 + wobble(i)), copy(40, null, 5)],
      days(40, (i) => (i % 2 ? 500 : -500)),
      [copy(0, null, null)],
    ];
    const reports = sets.flatMap((cs) =>
      ([1, 2, 3] as const).map((k) => lookReport(kit, scoredOf(cs), "MAIN", k)),
    );
    expect(new Set(reports.map((r) => r.verdict))).toEqual(
      new Set(["KEEP", "DROP", "WITHHELD", "TOO FEW TO TELL", null]),
    );
    const sentences = new Set(reports.map((r) => r.sentence));
    expect(sentences.size).toBe(2);
    expect([...sentences].some((s) => s!.startsWith("no mean result"))).toBe(
      true,
    );

    // Every reason a position is unpriced, a gap, every line and every kind of leg on the rows.
    const legs = (["REDUCE", "CLOSE", "FLIP", "cut"] as const).map((kind) => ({
      h: HOUR_MS,
      part: 0.25,
      kind,
      forced: false,
      liq: false,
    }));
    const rows = [
      "no mark at the follow instant",
      "no mark at an exit instant",
      "a funding settlement without a mark",
      "open across a split day of its market",
    ].map((unpriced, i) =>
      copy(i, null, null, {
        unpriced,
        gap: true,
        lines: [...LINES],
        plan: { legs, flag: i % 2 ? "open" : "crossing", lastExitT: null },
      }),
    );
    // Every alarm: each way a reading ends, each cause of a hole, a split event, a fee category missing, raw replies not stored, a failed backup.
    const book = parseRuleBook(docs, [6, 2]);
    const fixed = {
      markets: [6, 2],
      kitMarkets: new Map([
        [6, "crypto"],
        [2, "commodity"],
      ]),
    } as unknown as FixedInputs;
    const holes = [
      "rejected rows",
      "account not found",
      "page cap",
      "safety cap",
    ].map((cause) => ({ addr: A, cause }));
    const lacks = [
      ...(["done", "paused", "schema alarm", "api failing"] as const).flatMap(
        (end) => [
          ...lacksOf(end, holes, 3, scoredOf(rows), book, fixed, 2),
          ...lacksOf(end, [], 0, scoredOf([]), EMPTY_RULE_BOOK, fixed, 0),
        ],
      ),
      BACKUP_FAILED,
    ];
    for (const alarm of [
      "reading ended: schema alarm — ",
      "split events recorded by the collector: 1 — alarm: ",
      "alarm: fee categories missing from the collector's schedule: commodity — ",
      "raw replies not stored: 2 ",
    ])
      expect(lacks.some((l) => l.startsWith(alarm))).toBe(true);

    const pageOf = (looks: (LookDone | null)[]) =>
      pageData(
        kit,
        scoredOf(rows),
        CUT + 10 * DAY_MS,
        new Map([[6, "BTC-USD"]]),
        { sha256: "ab".repeat(32), at: "2026-11-12" },
        lacks,
        "this run: 3 calls, peak 30 tokens a minute and 10 in 5 s, 0 answered 429",
        looks,
      );
    const pages = [
      pageOf([null, null, null]),
      ...reports.map((r) =>
        pageOf(
          ([1, 2, 3] as const).map((k) =>
            k <= r.look
              ? { k, verdict: r.verdict, sentence: r.sentence }
              : null,
          ),
        ),
      ),
    ];
    expect(new Set(pages.map((p) => p.verdict)).size).toBe(pages.length);
    for (const p of pages)
      expect([
        p.verdict,
        bannedWords(renderPage(p)),
        bannedWords(renderPositions(p)),
      ]).toEqual([p.verdict, [], []]);
  });
});
