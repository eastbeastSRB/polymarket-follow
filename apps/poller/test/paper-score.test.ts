import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pino } from "pino";
import { describe, expect, it } from "vitest";
import { daily } from "../src/paper/daily.js";
import {
  accountData,
  linesAt,
  mondayFacts,
  type MondayCache,
} from "../src/paper/account.js";
import { CUT, WEEK_MS } from "../src/paper/instants.js";
import { marketThrough } from "../src/paper/market.js";
import { renderPage, type PageData } from "../src/paper/page.js";
import { loadResearch, type PanelFile } from "../src/paper/research.js";
import {
  EMPTY_RULE_BOOK,
  bookTaker,
  parseRuleBook,
  type RuleBook,
} from "../src/paper/rulebook.js";
import {
  primaryMarket,
  score,
  takerSetting,
  votedBy,
  weekList,
  type ScoreInput,
} from "../src/paper/score.js";
import type { SeedAccount } from "../src/paper/seed.js";
import type { AccountState, StoredRow } from "../src/paper/store.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { addr } from "./paper-world.js";

const kit = await loadResearch();
const A2 = addr(0xa2);
const M1 = Date.parse("2026-11-09T00:00:00Z");
const END = M1 + WEEK_MS;
const T1 = M1 + 26 * HOUR_MS;
const kitMarkets = new Map<number, string>([
  [6, "crypto"],
  [7, "crypto"],
  [14, "crypto"],
  [2, "commodity"],
]);

let n = 0;
const fill = (
  t: number,
  iid: number,
  prev: number,
  side: "long" | "short",
  q: number,
): StoredRow => {
  n += 1;
  return {
    trade_id: String(n),
    order_id: String(n),
    instrument_id: iid,
    timestamp: t,
    side,
    price: "100",
    quantity: String(q),
    previous_size: String(prev),
    fee: "0",
    pnl: "0",
    taker: true,
    liquidation: false,
  };
};

/** A slow directional history as the kit's own fixture builds it: one open and one close a day. */
function trader(
  days: number,
  before: number,
  holdHours: (d: number) => number,
): StoredRow[] {
  const rows: StoredRow[] = [];
  for (let d = days; d >= 1; d -= 1) {
    const t0 =
      before -
      d * DAY_MS +
      ((d * 37) % 12) * HOUR_MS +
      ((d * 13) % 50) * MINUTE_MS;
    const q = 1 + (d % 4);
    const side = d % 3 ? "long" : "short";
    rows.push(fill(t0, 7, 0, side, q));
    rows.push(
      fill(
        t0 + holdHours(d) * HOUR_MS,
        7,
        side === "long" ? q : -q,
        side === "long" ? "short" : "long",
        q,
      ),
    );
  }
  return rows.sort((a, b) => a.timestamp - b.timestamp);
}

const seed = (a: string, rows: StoredRow[]): SeedAccount => ({
  addr: a,
  pages: 1,
  truncated: false,
  rows,
  dropped: 0,
});
const read: AccountState = { P: END, from: CUT, holes: [] };

/** One market from 40 days before the cut to END: a moving mark, 3 trades a minute, hourly funding. */
function market(): PanelFile {
  const start = CUT - 40 * DAY_MS;
  const nMin = (END - start) / MINUTE_MS;
  const minute = Array.from({ length: nMin }, (_, i) => i);
  const funding: [number, number, number][] = [];
  for (let h = start + HOUR_MS; h < END; h += HOUR_MS)
    funding.push([h, 0.00001, h + 50]);
  return {
    iid: 6,
    symbol: "BTC-USD",
    category: "crypto",
    start,
    end: END,
    firstTrade: start,
    retired: null,
    marks: Array.from(
      { length: nMin },
      (_, i) => 100 + 2 * Math.sin(i / 50) + i * 0.0001,
    ),
    klines: {
      minute,
      trades: minute.map(() => 3),
      volume: minute.map(() => 1),
    },
    funding,
  };
}

describe("the scorer (R4–R11)", () => {
  // A: slow (holds 8-12 h): MAIN and TEN. B: fast (1-2 h): BROAD only, its history
  // ending five days before the cut, so not P1 a week later. C: no history, a favourite from F0.
  const A = addr(0xa);
  const B = addr(0xb);
  const C = addr(0xc);
  // D: slow like A, a favourite outside the pool: FAV only.
  const D = addr(0xd);
  const rowsA = trader(25, CUT, (d) => 8 + (d % 5));
  const rowsB = trader(20, CUT - 5 * DAY_MS, (d) => 1 + (d % 2));
  const F0 = M1 + 12 * HOUR_MS;
  const post = new Map<string, StoredRow[]>([
    [
      A,
      [
        fill(T1, 6, 0, "long", 2),
        // An add, never a copy of its own.
        fill(T1 + 20 * MINUTE_MS, 6, 2, "long", 1),
        fill(T1 + 30 * HOUR_MS, 6, 3, "short", 3),
        fill(T1 + HOUR_MS, 14, 0, "long", 1),
        fill(T1 + 3 * HOUR_MS, 2, 0, "short", 1),
        fill(END - 2 * HOUR_MS, 6, 0, "long", 1),
        // After END: never read by the run whose END it is.
        fill(END + HOUR_MS, 2, 0, "long", 1),
      ],
    ],
    [D, [fill(T1 + 4 * HOUR_MS, 6, 0, "long", 1)]],
    [B, [fill(T1 + 10 * MINUTE_MS, 6, 0, "short", 1)]],
    [
      C,
      [
        fill(M1 + HOUR_MS, 6, 0, "long", 1),
        fill(M1 + 2 * HOUR_MS, 6, 1, "short", 1),
        fill(T1 + 2 * HOUR_MS, 6, 0, "long", 1),
        // A fill whose previous size is not what the one before left: a chain break.
        fill(T1 + 5 * HOUR_MS, 6, 3, "long", 1),
      ],
    ],
  ]);
  const seeds = new Map([
    [A, seed(A, rowsA)],
    [B, seed(B, rowsB)],
    [
      D,
      seed(
        D,
        trader(25, CUT, (d) => 8 + (d % 5)),
      ),
    ],
  ]);
  const holes = new Map<string, AccountState>([
    [
      B,
      {
        ...read,
        holes: [
          {
            from: T1 + 5 * HOUR_MS,
            to: T1 + 6 * HOUR_MS,
            cause: "page cap",
            readOn: "2026-11-16",
          },
        ],
      },
    ],
  ]);
  const mk = marketThrough(kit, market(), END);
  const input = (end = END, book: RuleBook = EMPTY_RULE_BOOK): ScoreInput => ({
    kit,
    end,
    pool: [
      { addr: A, notionalBoard: true },
      { addr: B, notionalBoard: false },
      { addr: C, notionalBoard: false },
    ],
    favourites: [
      { addr: C, from: F0 },
      { addr: D, from: F0 },
    ],
    account: (a) =>
      accountData(
        kit,
        a,
        seeds.get(a) ?? null,
        post.get(a) ?? [],
        holes.get(a) ?? read,
      ),
    market: (iid) => (iid === 6 ? mk : null),
    book,
    cache: new Map() as MondayCache,
    kitMarkets,
  });

  it("fixes each copy's lines at its Monday, from the account's label and habits there", () => {
    const s = score(input());
    expect([...s.p1.get(M1)!].sort()).toEqual([A, B]);
    const byAddr = (a: string) => s.copies.filter((c) => c.addr === a);
    expect(byAddr(A).map((c) => [c.t, c.lines])).toEqual([
      [T1, ["BROAD", "MAIN", "TEN"]],
      [T1 + 3 * HOUR_MS, ["BROAD", "MAIN", "TEN"]],
      [END - 2 * HOUR_MS, ["BROAD", "MAIN", "TEN"]],
    ]);
    // A primary market with no data: unpriced, never guessed.
    expect(byAddr(A)[1]).toMatchObject({
      iid: 2,
      money: null,
      unpriced: "no mark at the follow instant",
    });
    expect(byAddr(B).map((c) => c.lines)).toEqual([["BROAD"]]);
    // A run whose END is a Sunday counts no entry at or after it, though its Monday is before END.
    expect(
      score(input(END - DAY_MS))
        .copies.filter((c) => c.addr === A)
        .map((c) => c.t),
    ).toEqual([T1, T1 + 3 * HOUR_MS]);
    // C's entry before F0 is in no line; the one after it in FAV only, its d without a long share.
    expect(byAddr(C).map((c) => [c.t, c.lines, c.label])).toEqual([
      [T1 + 2 * HOUR_MS, ["FAV"], "no fills in window"],
    ]);
    expect(byAddr(D).map((c) => c.lines)).toEqual([["FAV"]]);
    // C's copy crosses a chain break in its span: a gap copy, though C has no hole.
    expect(byAddr(C)[0]!.gap).toBe(true);
    expect(byAddr(D)[0]!.label).toBe("directional");
    expect([byAddr(C)[0]!.d, byAddr(C)[0]!.dReason]).toEqual([
      { FAV: null },
      { FAV: "no long share" },
    ]);
    // A's entry in PRL (left out of every primary cell): counted, priced in no line.
    expect(s.otherMarkets).toBe(1);
    const f = byAddr(A)[0]!.facts!;
    expect(linesAt(f)).toEqual({ p1: true, main: true, ten: true, day: false });
  });

  it("prices the money with the trader's exits and the taker setting, and d per line with that line's accounts left out", () => {
    const s = score(input());
    const a = s.copies.find((c) => c.addr === A && c.t === T1)!;
    const setting = kit.costs.SETTINGS.taker;
    const leg = kit.returns.leg(mk, {
      dir: 1,
      tIn: T1 + a.D,
      h: 30 * HOUR_MS,
      setting,
    })!;
    expect(a.money!.net).toBeCloseTo(leg.net * 1e4, 9);
    expect(a.money!.gross).toBeCloseTo(leg.gross * 1e4, 9);
    expect(a.plan.flag).toBeNull();
    const week = (rows: StoredRow[]) =>
      rows
        .filter((r) => r.timestamp >= M1 && r.timestamp < M1 + WEEK_MS)
        .map((r) => kit.fills.normFill(r));
    const d = (accounts: StoredRow[][]) =>
      kit.nulls.dAgainstNull(mk, {
        dir: 1,
        t: T1,
        D: a.D,
        h: 24 * HOUR_MS,
        longShare: a.facts!.longShare!,
        removed: kit.nulls.removalOf(accounts.map(week))(6),
      });
    const main = d([post.get(A)!]);
    const broad = d([post.get(A)!, post.get(B)!]);
    expect(main.d).not.toBeNull();
    expect(a.d.MAIN).toBeCloseTo(main.d! * 1e4, 9);
    expect(a.d.TEN).toBeCloseTo(main.d! * 1e4, 9);
    expect(a.d.BROAD).toBeCloseTo(broad.d! * 1e4, 9);
    expect(a.d.BROAD).not.toBeCloseTo(a.d.MAIN!, 6);
    expect(a.voted).toBe(true);
    const late = s.copies.find(
      (c) => c.addr === A && c.t === END - 2 * HOUR_MS,
    )!;
    expect(late.voted).toBe(false);
    expect(late.plan.flag).toBe("open");
    // Marked at END - 1 ms, the minute that ends at END.
    expect(late.plan.legs.at(-1)!.h).toBe(END - 1 - late.tIn);
    expect(a.stop2).not.toBeNull();
    expect(a.days7).toBeCloseTo(a.money!.net, 9);
    expect(a.notional).toBe(true);
  });

  it("flags a gap copy for a hole inside its span, and an open copy", () => {
    const s = score(input());
    const b = s.copies.find((c) => c.addr === B)!;
    expect(b.plan.flag).toBe("open");
    expect(b.gap).toBe(true);
    expect(s.copies.find((c) => c.addr === A && c.t === T1)!.gap).toBe(false);
  });

  it("lists every trader with a copy still open at the next Monday, P1 there or not", () => {
    const list = weekList(input(END), END);
    expect(
      linesAt(mondayFacts(kit, input().account(B), END, new Map())).p1,
    ).toBe(false);
    expect(list.has(B)).toBe(true);
    // A's copies: one closed, one still open at END.
    expect(list.has(A)).toBe(true);
    expect(weekList(input(END), M1).has(C)).toBe(false);
  });

  it("leaves a market out from the collector's record of its close-only day, for entries after the cut only", () => {
    const book = parseRuleBook(
      [
        {
          kind: "instruments",
          key: "list",
          at: T1 - 3 * HOUR_MS,
          value: [
            { instrument_id: 6, symbol: "BTC-USD", close_only: true },
            { instrument_id: 7, symbol: "ETH-USD" },
            { instrument_id: 2, symbol: "GOLD-USD" },
          ],
        },
      ],
      [...kitMarkets.keys()],
    );
    const i = input(END, book);
    const day = Math.floor((T1 - 3 * HOUR_MS) / DAY_MS) * DAY_MS;
    expect(book.leftOutFrom.get(6)).toBe(day);
    // Gone from the list: left out too.
    expect(book.leftOutFrom.get(14)).toBe(day);
    expect(primaryMarket(i, 6, day - 1)).toBe(true);
    expect(primaryMarket(i, 6, day)).toBe(false);
    expect(primaryMarket(i, 6, CUT - DAY_MS)).toBe(true);
    // Not in the kit's rule book: not primary, and the kit's check is never asked (it throws).
    expect(primaryMarket(i, 999, T1)).toBe(false);
    // The kit's own rule: PRL is out.
    expect(primaryMarket(input(), 14, T1)).toBe(false);
    expect(
      score(i).copies.filter((c) => c.addr === A && c.iid === 6),
    ).toHaveLength(0);
  });
});

describe("the collector's rule book (R6 (3), R9, R13)", () => {
  const docs = [
    {
      kind: "fees",
      key: "schedule",
      at: 1_000,
      value: [
        {
          instrument_type: "perpetual",
          category: "crypto",
          taker_fee_rate: "0.0004",
          maker_fee_rate: "0.000125",
          tiers: [],
        },
      ],
    },
    {
      kind: "fees",
      key: "schedule",
      at: 5_000,
      value: [
        {
          instrument_type: "perpetual",
          category: "crypto",
          taker_fee_rate: "0.00035",
          maker_fee_rate: "0.0001",
          tiers: [],
        },
      ],
    },
    {
      kind: "instruments",
      key: "list",
      at: 2_000,
      value: [
        {
          instrument_id: 6,
          symbol: "BTC-USD",
          fee_override: {
            start_time: 3_000,
            end_time: 4_000,
            tiers: [{ taker_fee_rate: "0.0002" }],
          },
        },
        { instrument_id: 7, symbol: "ETH-USD" },
        { instrument_id: 14, symbol: "PRL-USD" },
        { instrument_id: 2, symbol: "GOLD-USD" },
      ],
    },
    {
      kind: "instrument",
      key: "7",
      at: 9_000,
      value: {
        instrument_id: 7,
        symbol: "ETH-USD",
        settlement: { timestamp: 2 * DAY_MS + 5 },
      },
    },
    { kind: "splits", key: "events", at: 1_500, value: [{ anything: 1 }] },
    {
      kind: "competitions",
      key: "list",
      at: 1_200,
      value: [
        {
          competition_id: 1,
          number: 1,
          name: "x",
          status: "live",
          start_time: 100,
          end_time: 900,
        },
      ],
    },
    {
      kind: "competition_markets",
      key: "1",
      at: 1_300,
      value: {
        all_markets: true,
        markets: [
          { instrument_id: 6, boost: "3" },
          { instrument_id: 2, boost: "1" },
        ],
      },
    },
    { kind: "fees", key: "schedule", at: 6_000, value: "not a schedule" },
    { nonsense: true },
  ];
  const book = parseRuleBook(docs, [...kitMarkets.keys()]);

  it("takes the base-tier taker rate from each record's instant: an override in force, else the category's; before the first record, the kit's", () => {
    expect(bookTaker(book, 6, "crypto", 999)).toBeNull();
    expect(bookTaker(book, 6, "crypto", 1_000)).toBe(0.0004);
    expect(bookTaker(book, 6, "crypto", 3_000)).toBe(0.0002);
    expect(bookTaker(book, 6, "crypto", 4_000)).toBe(0.0004);
    expect(bookTaker(book, 7, "crypto", 3_500)).toBe(0.0004);
    expect(bookTaker(book, 6, "crypto", 5_000)).toBe(0.00035);
    const setting = takerSetting({
      kit,
      book,
      kitMarkets,
    } as unknown as ScoreInput);
    expect(setting.fee(6, 999)).toBe(kit.costs.feeAt("taker", 6, 999));
    expect(setting.fee(6, 3_500)).toBe(0.0002);
  });

  it("leaves a settled market out from its settlement's day, counts split events and refused documents, and keeps competitions with their boosted markets", () => {
    expect(book.leftOutFrom.get(7)).toBe(2 * DAY_MS);
    expect(book.splitEvents).toBe(1);
    expect(book.rejected).toBe(2);
    expect(book.competitions).toEqual([
      { id: 1, start: 100, end: 900, boosted: new Set([6]) },
    ]);
  });
});

describe("the page (R15, F17)", () => {
  const data: PageData = {
    writtenAt: Date.parse("2026-11-30T04:30:00Z"),
    dataThrough: Date.parse("2026-11-29T00:00:00Z"),
    frozen: { sha256: "ab".repeat(32), at: "2026-11-28" },
    nextLook: { date: "2026-12-19", z: 2.81 },
    verdict: null,
    lines: [
      {
        name: "MAIN",
        title: "Main line (decides)",
        positions: 3,
        traders: 2,
        days: 2,
        open: 1,
        money: { mean: -4.2, se: 3 },
        d: { mean: 1, se: 2, n: 2 },
        e: { e: 0.5, votes: 2 },
      },
    ],
    rows: [
      {
        addr: "<script>x</script>",
        symbol: "BTC-USD",
        side: "long",
        t: 1,
        tIn: 2,
        entryPrice: 100,
        legs: "close",
        state: "closed",
        net: 3,
        flags: [],
      },
    ],
    traders: [{ addr: "0xab", positions: 2, open: 0, mean: 1, band: null }],
    lacks: ["holes: 0"],
    cost: "this run: 3 calls",
  };

  it("names no verdict between looks, escapes text, and never uses the words the plan bans", () => {
    const html = renderPage(data);
    expect(html).toContain("Too early to judge — next look 2026-12-19.");
    expect(html).toContain("&#60;script&#62;x&#60;/script&#62;");
    expect(html).not.toContain("<script>x");
    const text = html.replace(/<[^>]*>/g, " ").toLowerCase();
    for (const word of text.split(/[^a-z]+/)) {
      expect([
        word,
        /^(follow|copy|copies|copying|copied|signal|edge|skill)/.test(word),
      ]).toEqual([word, false]);
    }
    expect(html).toContain("too few days");
  });
});

describe("a run without a valid freeze (R0)", () => {
  it("writes one line, 'frozen files differ', and reads and writes nothing else", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "paper-daily-"));
    const pkg = mkdtempSync(path.join(tmpdir(), "paper-pkg-"));
    try {
      const now = Date.parse("2026-11-30T04:00:00Z");
      const exit = await daily(
        {
          PAPER_ROOT: root,
          MONGO_URI: "mongodb://127.0.0.1:1",
          MONGO_DB: "polymarket_follow_test",
        },
        pino({ level: "silent" }),
        () => undefined,
        now,
        pkg,
      );
      expect(exit).toBe(4);
      expect(readdirSync(root)).toEqual(["log"]);
      const line = JSON.parse(
        readFileSync(path.join(root, "log", "2026-11-30.jsonl"), "utf8"),
      ) as { line: string; problems: string[] };
      expect(line).toMatchObject({
        line: "frozen files differ",
        problems: ["no experiment/FROZEN.sha256"],
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(pkg, { recursive: true, force: true });
    }
  });
});

describe("the lines' account-level conditions at a Monday, at their edges (R7)", () => {
  const base = {
    label: "directional",
    closed: 3,
    medianHoldMs: 6 * HOUR_MS,
    longShare: 0.5,
    labelCovered: true,
    habitCovered: true,
  };
  it("P1 needs the label and its read window; MAIN its habit window, a 6 h median hold and 3 closed cycles", () => {
    expect(linesAt(base)).toEqual({
      p1: true,
      main: true,
      ten: false,
      day: false,
    });
    expect(linesAt({ ...base, labelCovered: false })).toEqual({
      p1: false,
      main: false,
      ten: false,
      day: false,
    });
    expect(linesAt({ ...base, label: "unclassified — mixed" }).p1).toBe(false);
    expect(linesAt({ ...base, habitCovered: false })).toMatchObject({
      p1: true,
      main: false,
    });
    expect(linesAt({ ...base, medianHoldMs: 6 * HOUR_MS - 1 }).main).toBe(
      false,
    );
    expect(linesAt({ ...base, medianHoldMs: null }).main).toBe(false);
    expect(linesAt({ ...base, closed: 2 }).main).toBe(false);
    expect(linesAt({ ...base, closed: 10 }).ten).toBe(true);
    expect(linesAt({ ...base, closed: 9 }).ten).toBe(false);
    expect(linesAt({ ...base, medianHoldMs: 24 * HOUR_MS }).day).toBe(true);
    expect(linesAt({ ...base, medianHoldMs: 24 * HOUR_MS - 1 }).day).toBe(
      false,
    );
  });

  it("votes an entry when every leg from its hour ends by END (R10)", () => {
    const t = M1 + 5 * HOUR_MS + 1_234;
    const edge = M1 + 6 * HOUR_MS + kit.entries.maxDelay() + 24 * HOUR_MS;
    expect(votedBy(kit, t, edge)).toBe(true);
    expect(votedBy(kit, t, edge - 1)).toBe(false);
  });
});

describe("a Monday's facts come from the fills before it (R5, code-rules: an instant is read at that instant)", () => {
  it("leaves out the part of an order event after M, and reads the windows' coverage from the holes", () => {
    const M = M1;
    const rows = [
      ...trader(20, M - DAY_MS, (d) => 8 + (d % 5)),
      fill(M - 5 * HOUR_MS, 6, 0, "long", 2),
      // One order closing 2 in one matching event: 1 just before M, 1 just after it.
      { ...fill(M - 1, 6, 2, "short", 1), order_id: "777" },
      { ...fill(M + 1, 6, 2, "short", 1), order_id: "777" },
    ];
    const acc = (holes: AccountState["holes"]) =>
      accountData(
        kit,
        A2,
        seed(
          A2,
          rows.filter((r) => r.timestamp < CUT),
        ),
        rows.filter((r) => r.timestamp >= CUT),
        { P: END, from: CUT, holes },
      );
    const facts = mondayFacts(kit, acc([]), M, new Map());
    // Before M the event reduces 2 to 1: that cycle is not closed yet.
    const before = rows
      .filter((r) => r.timestamp < M)
      .map((r) => kit.fills.normFill(r));
    const ev = kit.entries.toEvents(before);
    const h = kit.labels.habitsAt(
      {
        cycles: kit.entries.toCycles(ev),
        groups: kit.entries.buildEntries(ev, -Infinity, Infinity, 60_000),
      },
      M,
    );
    expect(facts.closed).toBe(h.closed);
    const all = rows.map((r) => kit.fills.normFill(r));
    const evAll = kit.entries.toEvents(all);
    const hAll = kit.labels.habitsAt(
      {
        cycles: kit.entries.toCycles(evAll),
        groups: kit.entries.buildEntries(evAll, -Infinity, Infinity, 60_000),
      },
      M,
    );
    expect(hAll.closed).toBe(h.closed + 1);
    expect([facts.labelCovered, facts.habitCovered]).toEqual([true, true]);
    const hole = (from: number) => [
      {
        from,
        to: from + DAY_MS,
        cause: "page cap" as const,
        readOn: "2026-11-20",
      },
    ];
    expect(
      mondayFacts(kit, acc(hole(M - 14 * DAY_MS)), M, new Map()),
    ).toMatchObject({ labelCovered: false, habitCovered: false });
    expect(
      mondayFacts(kit, acc(hole(M - 20 * DAY_MS)), M, new Map()),
    ).toMatchObject({ labelCovered: true, habitCovered: false });
    expect(
      mondayFacts(kit, acc(hole(M - 31 * DAY_MS)), M, new Map()),
    ).toMatchObject({ labelCovered: true, habitCovered: true });
  });

  it("serves a cached Monday only while the fills before it are the same", () => {
    const cache: MondayCache = new Map();
    const rows = trader(20, CUT, (d) => 8 + (d % 5));
    const a = accountData(kit, A2, seed(A2, rows), [], read);
    const fresh = mondayFacts(kit, a, M1, cache);
    expect(cache.size).toBe(1);
    expect(mondayFacts(kit, a, M1, cache)).toEqual(fresh);
    expect(mondayFacts(kit, a, M1, new Map())).toEqual(fresh);
    // A read before M1 changes the hash: computed afresh, never served stale.
    const more = accountData(
      kit,
      A2,
      seed(A2, rows),
      [fill(M1 - HOUR_MS, 6, 0, "long", 1)],
      read,
    );
    const after = mondayFacts(kit, more, M1, cache);
    expect(after).toEqual(mondayFacts(kit, more, M1, new Map()));
    expect(cache.get(`${A2}|${M1}`)!.value).toEqual({
      label: after.label,
      closed: after.closed,
      medianHoldMs: after.medianHoldMs,
      longShare: after.longShare,
    });
  });

  it("applies the collector's rule book from the cut only", () => {
    const pre = parseRuleBook(
      [
        {
          kind: "instruments",
          key: "list",
          at: CUT - 3 * DAY_MS,
          value: [{ instrument_id: 6, symbol: "BTC-USD", close_only: true }],
        },
      ],
      [6],
    );
    const i = { kit, book: pre, kitMarkets } as unknown as ScoreInput;
    expect(primaryMarket(i, 6, CUT - DAY_MS)).toBe(true);
    expect(primaryMarket(i, 6, CUT)).toBe(false);
  });
});

describe("the rehearsal on the old weeks (part 4, F6)", () => {
  it("scores weeks before the cut only", () => {
    const i = {
      kit,
      end: CUT + 1,
      start: CUT - 28 * DAY_MS,
      pool: [],
      favourites: [],
      account: () => {
        throw new Error("no account");
      },
      market: () => null,
      book: EMPTY_RULE_BOOK,
      cache: new Map(),
      kitMarkets,
    } as unknown as ScoreInput;
    expect(() => score(i)).toThrow(/only weeks before the cut/);
    expect(score({ ...i, end: CUT }).copies).toEqual([]);
  });
});
