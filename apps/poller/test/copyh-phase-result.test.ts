/**
 * RANK and RESULT's cores (src/copyh/phase-rank.ts, phase-result.ts;
 * rules.md C7's RANK, C12, C14's prior mean net, C15's positions lines), on
 * made-up positions and made-up closed parts:
 * - RANK's accounts at each Monday from MAIN's accounts there and the priced
 *   MAIN copies alone (an unpriced one, another line's, a last leg at M, an
 *   account not in MAIN at M, four copies: none counts), ⌈n ÷ 5⌉ by mean,
 *   ties by address; each trader's prior mean net at each Monday where it
 *   has a copy, over its priced MAIN copies whose latest instant lies before
 *   M, 1 ms either side, none when it has none;
 * - a position's line: the copy, its prior mean net among its covariates,
 *   its RANK membership;
 * - a closed part's lines read a chunk at a time, a line longer than a chunk
 *   whole, a part without its last newline refused; PRICES' parts merged by
 *   entry id, a tie in its part's order, a part out of id order refused;
 * - the look's set: MAIN's voted copies, x the net (null unpriced), x′ the
 *   MAIN edge.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { partLines, type PhaseRecord } from "../src/copyh/engine.js";
import { byId, type Position } from "../src/copyh/phase-prices.js";
import {
  mainAccountsOf,
  rankInputOf,
  rankOf,
  type RankInput,
} from "../src/copyh/phase-rank.js";
import {
  inLookSet,
  judgedCopyOf,
  positionLine,
  positionLines,
  positionsInOrder,
} from "../src/copyh/phase-result.js";
import { sha256 } from "../src/copyh/run.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";

const M = Date.parse("2025-12-01T00:00:00Z");
const WEEK = 7 * DAY_MS;
const addr = (n: number) => `0x${n.toString(16).padStart(40, "0")}`;

/** A made-up position: a MAIN copy of addr(1) at M, priced at 1 bps, voted, unless told. */
function pos(o: Partial<Position> = {}): Position {
  return {
    id: `${addr(1)}|2|${M + HOUR_MS}|OPEN`,
    addr: addr(1),
    iid: 2,
    dir: 1,
    type: "OPEN",
    t: M + HOUR_MS,
    D: 5_000,
    M,
    lines: ["MAIN", "BROAD"],
    exits: [],
    plan: { legs: [], flag: "open", lastExitT: null, settled: false },
    voted: true,
    gap: false,
    covariates: {
      closedCycles: 4,
      medianHoldHours: 7.5,
      longShare: 0.5,
      entries: 9,
      coin: 2,
      sizeUsd: 1234.5,
      priorCopies: 0,
    },
    thin: false,
    money: {
      net: 1,
      gross: 10,
      fees: -9,
      funding: 0,
      holdMs: 3_600_000,
      fullExitMs: 3_600_000,
      fundingMissing: 0,
      spreadFallback: false,
    },
    judged: { MAIN: { d: 2, nullGross: 0.5, edge: 1.5 } },
    main: null,
    ...o,
  };
}

describe("RANK's core (C7, C14's prior mean net)", () => {
  it("takes MAIN's accounts at each Monday from the members whose mask holds MAIN's bit, BUILD's and BUILD-L's", () => {
    const main = mainAccountsOf([
      [
        [
          addr(1),
          [
            [0, 1],
            [1, 1 | 2 | 4 | 8],
          ],
        ],
        [addr(2), [[1, 4]]],
      ],
      [[addr(3), [[1, 1 | 4]]]],
    ]);
    expect([...main].map(([k, s]) => [k, [...s]])).toEqual([
      [0, [addr(1)]],
      [1, [addr(1), addr(3)]],
    ]);
  });

  /** A priced MAIN copy of a trader at the Monday of index k, its follow instant and latest instant given. */
  const main = (
    a: string,
    k: number,
    tIn: number,
    lastLeg: number,
    net: number | null,
  ): RankInput => ({ addr: a, k, main: { tIn, lastLeg, net } });

  it("ranks MAIN's accounts at each Monday by their priced MAIN copies of the 12 weeks before it, at least 5, the first ⌈n ÷ 5⌉, ties by address", () => {
    const mondays = [M - WEEK, M];
    const copies: RankInput[] = [];
    // Six accounts in MAIN at M with five priced copies each in the 12 weeks: means 1…6, addr(6) and addr(7) tied at 6.
    const means: [number, number][] = [
      [2, 1],
      [3, 2],
      [4, 3],
      [5, 4],
      [7, 6],
      [6, 6],
    ];
    for (const [n, mean] of means)
      for (let j = 0; j < 5; j++)
        copies.push(
          main(addr(n), 0, M - 11 * WEEK + j * DAY_MS, M - 10 * WEEK, mean),
        );
    // addr(8): four priced copies, an unpriced one and one in another line only.
    for (let j = 0; j < 4; j++)
      copies.push(main(addr(8), 0, M - 2 * WEEK, M - WEEK, 99));
    copies.push(main(addr(8), 0, M - 2 * WEEK, M - WEEK, null));
    copies.push({ addr: addr(8), k: 0, main: null });
    // addr(9): five copies, one of them with its last leg at M.
    for (let j = 0; j < 5; j++)
      copies.push(main(addr(9), 0, M - 2 * WEEK, j === 0 ? M : M - 1, 50));
    // addr(10): five copies, not in MAIN at M.
    for (let j = 0; j < 5; j++)
      copies.push(main(addr(10), 0, M - 2 * WEEK, M - WEEK, 70));
    const inMain = new Set([2, 3, 4, 5, 6, 7, 8, 9].map(addr));
    const r = rankOf(mondays, new Map([[1, inMain]]), copies);
    // Ranked: the six (addr(8) and addr(9) have four priced copies before M): ⌈6 ÷ 5⌉ = 2, the tie at 6 by the smaller address.
    expect(r.rank).toEqual([
      [0, []],
      [1, [addr(6), addr(7)]],
    ]);
    // addr(9)'s fifth copy's last leg 1 ms before M: seven ranked, ⌈7 ÷ 5⌉ = 2, addr(9) first at 50, then addr(6); the set by address.
    copies[copies.length - 10] = main(addr(9), 0, M - 2 * WEEK, M - 1, 50);
    expect(rankOf(mondays, new Map([[1, inMain]]), copies).rank[1]).toEqual([
      1,
      [addr(6), addr(9)],
    ]);
    // Its follow instant 1 ms before the 12 weeks: four again.
    copies[copies.length - 10] = main(addr(9), 0, M - 12 * WEEK - 1, M - 1, 50);
    expect(rankOf(mondays, new Map([[1, inMain]]), copies).rank[1]).toEqual([
      1,
      [addr(6), addr(7)],
    ]);
  });

  it("reads a positions line as a MAIN copy's follow instant, latest leg and net, or as another line's copy, and refuses a Monday not the step's", () => {
    const legs = [
      {
        h: 2 * HOUR_MS,
        part: 0.5,
        kind: "REDUCE" as const,
        forced: false,
        liq: false,
      },
      {
        h: HOUR_MS,
        part: 0.5,
        kind: "CLOSE" as const,
        forced: false,
        liq: false,
      },
    ];
    const p = pos({ plan: { legs, flag: null, lastExitT: M, settled: false } });
    expect(rankInputOf(p, [M - WEEK, M])).toEqual({
      addr: addr(1),
      k: 1,
      main: {
        tIn: M + HOUR_MS + 5_000,
        lastLeg: M + 3 * HOUR_MS + 5_000,
        net: 1,
      },
    });
    expect(
      rankInputOf(pos({ money: { reason: "no mark at an exit instant" } }), [M])
        .main,
    ).toMatchObject({ net: null });
    expect(rankInputOf(pos({ lines: ["BROAD"] }), [M]).main).toBeNull();
    expect(() => rankInputOf(pos(), [M - WEEK])).toThrow(
      /a copy of a Monday not the step's/,
    );
  });

  it("gives each trader's prior mean net at each Monday where it has a copy: its priced MAIN copies whose latest instant lies before M, 1 ms either side; none without one", () => {
    const mondays = [M - WEEK, M, M + WEEK];
    const a = addr(1);
    const b = addr(2);
    const copies: RankInput[] = [
      main(a, 0, M - 3 * WEEK, M - WEEK - 1, 4),
      main(a, 0, M - 3 * WEEK, M - WEEK, 8),
      main(a, 1, M - 2 * WEEK, M - 1, 1.5),
      main(a, 1, M - 2 * WEEK, M - 2, null),
      main(a, 1, M, M + 2 * DAY_MS, 100),
      { addr: b, k: 2, main: null },
    ];
    expect(rankOf(mondays, new Map(), copies).prior).toEqual([
      [
        a,
        [
          [0, 4],
          [1, (4 + 8 + 1.5) / 3],
        ],
      ],
      [b, [[2, null]]],
    ]);
  });
});

describe("a position's line", () => {
  it("is the copy with C14's prior mean net among its covariates and its RANK membership", () => {
    const p = pos();
    const line = JSON.parse(positionLine(p, 3.25, true)) as Record<
      string,
      unknown
    >;
    expect(line).toEqual({
      ...p,
      covariates: { ...p.covariates, priorMeanNetBps: 3.25 },
      rank: true,
    });
    expect(JSON.parse(positionLine(p, null, false))).toMatchObject({
      covariates: { priorMeanNetBps: null },
      rank: false,
    });
  });

  it("takes into the look's set MAIN's copies voted by its END alone", () => {
    expect(inLookSet(pos())).toBe(true);
    expect(inLookSet(pos({ voted: false }))).toBe(false);
    expect(inLookSet(pos({ lines: ["BROAD"] }))).toBe(false);
  });

  it("puts a copy of MAIN's voted set in the statistic's form: its net, or null unpriced; its MAIN edge, or null", () => {
    expect(judgedCopyOf(pos({ thin: true }))).toEqual({
      addr: addr(1),
      tIn: M + HOUR_MS + 5_000,
      x: 1,
      edge: 1.5,
      thin: true,
    });
    expect(
      judgedCopyOf(
        pos({
          money: { reason: "no mark at the follow instant" },
          judged: { MAIN: { d: null, reason: "entry unpriced", edge: null } },
        }),
      ),
    ).toMatchObject({ x: null, edge: null });
  });
});

/** A closed phase of made-up parts, each its lines: a/<id>.part (its header line first) and the record. */
function closed(parts: readonly (readonly [string, string])[]) {
  const dir = mkdtempSync(path.join(tmpdir(), "copyh-result-"));
  mkdirSync(path.join(dir, "a"));
  const record: PhaseRecord = { phase: "PRICES", parts: [] };
  for (const [id, body] of parts) {
    const header = JSON.stringify({ phase: "PRICES", id, inputs: {} });
    const bytes = Buffer.from(`${header}\n${body}`, "utf8");
    writeFileSync(path.join(dir, "a", `${id}.part`), bytes);
    record.parts.push([id, sha256(header), sha256(bytes)]);
  }
  return { dir, record };
}

describe("a closed part's lines and PRICES' merge", () => {
  /** A copy of addr(a) at M + 1 h on coin iid, long unless k is 1. */
  const at = (a: number, iid: number, k = 0) =>
    pos({
      id: `${addr(a)}|${iid}|${M + HOUR_MS}|OPEN`,
      addr: addr(a),
      iid,
      dir: k === 0 ? 1 : -1,
    });

  it("reads a part's lines a chunk at a time, a line longer than a chunk whole, and refuses a last line without its newline", () => {
    const long = "x".repeat(2_500_000);
    const lines = ["a", long, "", "b".repeat(1_048_575), "c"];
    const { dir, record } = closed([["p", `${lines.join("\n")}\n`]]);
    const got = [...partLines(dir, record, "p")].map((b) => b.toString());
    expect(got.map((l) => l.length)).toEqual(lines.map((l) => l.length));
    expect(got).toEqual(lines);
    const cut = closed([["p", "a\nb"]]);
    expect(() => [...partLines(cut.dir, cut.record, "p")]).toThrow(
      /a line without its newline/,
    );
  });

  it("merges the coins' parts by entry id, a tie in its part's order, and refuses a part out of id order and an id in two parts", () => {
    // Coin 2: addr(1), addr(3) twice (one id, two entries), addr(5); coin 10: addr(2), addr(4).
    const coin2 = [at(1, 2), at(3, 2, 0), at(3, 2, 1), at(5, 2)];
    const coin10 = [at(2, 10), at(4, 10)];
    const body = (ps: Position[]) =>
      ps.map((p) => `${JSON.stringify(p)}\n`).join("");
    const { dir, record } = closed([
      ["c002", body(coin2)],
      ["c010", body(coin10)],
    ]);
    const merged = [...positionsInOrder(dir, record)];
    expect(merged.map((p) => [p.addr, p.iid, p.dir])).toEqual([
      [addr(1), 2, 1],
      [addr(2), 10, 1],
      [addr(3), 2, 1],
      [addr(3), 2, -1],
      [addr(4), 10, 1],
      [addr(5), 2, 1],
    ]);
    expect(merged).toEqual([...coin2, ...coin10].sort(byId));
    const out = closed([["c002", body([at(3, 2), at(1, 2)])]]);
    expect(() => [...positionsInOrder(out.dir, out.record)]).toThrow(
      /a copy out of id order/,
    );
    const twice = closed([
      ["c002", body([at(1, 2)])],
      ["c010", body([at(1, 2)])],
    ]);
    expect(() => [...positionsInOrder(twice.dir, twice.record)]).toThrow(
      /an id in two of PRICES' parts/,
    );
  });

  it("writes each position's line with RANK's tables: its prior mean net and its RANK membership at its Monday; a pair RANK lacks refused", () => {
    const prices = closed([
      [
        "c002",
        [at(1, 2), at(2, 2)].map((p) => `${JSON.stringify(p)}\n`).join(""),
      ],
    ]);
    const rank = closed([
      [
        "rank",
        `${JSON.stringify({
          rank: [
            [0, []],
            [1, [addr(2)]],
          ],
          prior: [
            [addr(1), [[1, null]]],
            [addr(2), [[1, 2.5]]],
          ],
        })}\n`,
      ],
    ]);
    const lines = [
      ...positionLines({ prices, rank, mondays: [M - WEEK, M] }),
    ].map((l) => l.line);
    expect(lines).toEqual([
      positionLine(at(1, 2), null, false),
      positionLine(at(2, 2), 2.5, true),
    ]);
    const short = closed([
      [
        "rank",
        `${JSON.stringify({ rank: [], prior: [[addr(1), [[1, 1]]]] })}\n`,
      ],
    ]);
    expect(() => [
      ...positionLines({ prices, rank: short, mondays: [M - WEEK, M] }),
    ]).toThrow(/RANK holds no prior mean of 0x0+2 at 1/);
  });
});
