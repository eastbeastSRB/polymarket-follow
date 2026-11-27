/**
 * The prices' phase, PRICES (copyh/rules.md C7–C11, C13's two venue prints;
 * the engine's plan, sections 1, 5 and 6), on engine.ts, after TRIPWIRE: a
 * part is one coin, its market objects held one coin at a time.
 * - The coin's reading (phase-coin.ts): its bars to END, its end and
 *   Settlement, its funding rows; its two market objects (markets.ts
 *   `coinMarkets` at C9's settlement mark) and its settings (setting.ts).
 *   A coin with no market trade before its end has no object: each copy
 *   "no mark at the follow instant", each d "entry unpriced" (C11).
 * - Each copy of the coin from BUILD and BUILD-L: its money on the VWAP
 *   object with the taker setting (money.ts, lib-exits' `priceCopy`); thin
 *   when its follow instant or an exit leg is (markets.ts `isThin`; a
 *   settled copy's last leg, at the Settlement price, not; C9, M6); and in
 *   each of its lines (MAIN, TEN, BROAD, DAY) d and x′ (judge.ts) with that
 *   line's removal at its M (REMOVAL's table) and the habits' long share.
 * - A MAIN copy's own lines (C7): STOP2 and STOP5 closed also at STOP's
 *   instant (`dist/paper/copy.js` `stopInstant`, searched to money.ts
 *   `stopUntil`), DAYS7 at t + D + 7 d, JUMP's J (`jumpRatio` at t); DELAY0,
 *   DELAY+5, DELAY+15 and LAST (lines.ts `MOVED`) each at its own delay and
 *   marks, money, d and x′ with MAIN's removal; the cascade print's money
 *   and x′ and Binance's venue print's money (C13). SIDES, MONTHS, SLICES
 *   and RANK are MAIN's copies grouped, priced as MAIN.
 * - A part's bytes: one positions line a copy, by id, BUILD's and
 *   BUILD-L's together (a tie of ids is one account's, in the kit's order:
 *   the sort is stable), so that RESULT merges the coins' parts into the
 *   positions' order: the copy as BUILD planned it and its readings. The
 *   copies are priced one at a time and their lines given in chunks of
 *   about 1 MB: a coin's part can pass 2 GiB, and neither its positions nor
 *   its lines are held whole (COPYH-ENGINE-REVIEW-2 H1).
 */
import { z } from "zod";
import { DAYS7_MS, jumpRatio, stopInstant } from "../paper/copy.js";
import type { Market, Research, Setting } from "../paper/research.js";
import { STOPS } from "./design.js";
import type { FundingRow } from "./funding.js";
import type { PartFunction, PartSpec } from "./engine.js";
import { recordAt } from "./engine.js";
import { dOf, edgeOf, removedBy, type Removal } from "./judge.js";
import { LINES, MOVED, type Line } from "./lines.js";
import {
  coinMarkets,
  isThin,
  type Coin,
  type CoinMarkets,
  type MarkMinutes,
} from "./markets.js";
import { moneyOf, planOf, stopUntil } from "./money.js";
import { Copy, coinCopies } from "./phase-build.js";
import { CoinContext, CoinInputs, coinReadingOf } from "./phase-coin.js";
import { removalTablesOf } from "./phase-removal.js";
import type { Seal } from "./seal.js";
import { settingsOf } from "./setting.js";

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
export const PricesInputs = CoinInputs.extend({
  /** REMOVAL's record, by SHA-256. */
  removal: SHA256,
  /** The step's Mondays: a removal table's index. */
  mondays: z.array(z.number()),
  markMinutes: z.union([z.literal(5), z.literal(60)]),
});
export type PricesInputs = z.infer<typeof PricesInputs>;
export const PricesContext = CoinContext.extend({ removal: z.string() });
export type PricesContext = z.infer<typeof PricesContext>;

/** The kit's reason for d when the entry has no mark (C11). */
export const ENTRY_UNPRICED = "entry unpriced";
/** lib-exits' first reason, a copy of a coin without an object (COPYH-ENGINE-2's recommendation). */
const NO_MARK = { reason: "no mark at the follow instant" } as const;

/** money.ts's Money as a positions line holds it. */
const MoneyLine = z.union([
  z.object({
    net: z.number(),
    gross: z.number(),
    fees: z.number(),
    funding: z.number(),
    holdMs: z.number(),
    fullExitMs: z.number(),
    fundingMissing: z.number(),
    spreadFallback: z.boolean(),
    reason: z.undefined().optional(),
  }),
  z.object({ reason: z.string() }),
]);
/** A copy's d in bps and x′, or d's reason (null x′ exactly then). */
const Judged = z.union([
  z.object({
    d: z.number(),
    nullGross: z.number(),
    reason: z.undefined().optional(),
    edge: z.number().nullable(),
  }),
  z.object({ d: z.null(), reason: z.string(), edge: z.number().nullable() }),
]);
export type Judged = z.infer<typeof Judged>;
/** A moved line's own money, d and x′ (C7, M7). */
const MovedReading = z.object({ money: MoneyLine, judged: Judged });
/** A MAIN copy's own lines (C7) and its venue prints (C13). */
const MainReadings = z.object({
  stop: z.object({ STOP2: MoneyLine, STOP5: MoneyLine }),
  days7: MoneyLine,
  jump: z.number().nullable(),
  moved: z.object({
    DELAY0: MovedReading,
    "DELAY+5": MovedReading,
    "DELAY+15": MovedReading,
    LAST: MovedReading,
  } satisfies Record<(typeof MOVED)[number]["line"], unknown>),
  cascade: z.object({ money: MoneyLine, edge: z.number().nullable() }),
  binance: MoneyLine,
});
export type MainReadings = z.infer<typeof MainReadings>;
/** A positions line: the copy as BUILD planned it and its readings. */
export const Position = Copy.extend({
  thin: z.boolean(),
  money: MoneyLine,
  judged: z.object({
    MAIN: Judged.optional(),
    TEN: Judged.optional(),
    BROAD: Judged.optional(),
    DAY: Judged.optional(),
  } satisfies Record<Line, unknown>),
  main: MainReadings.nullable(),
});
export type Position = z.infer<typeof Position>;

/** What a coin's pricing reads, besides its copies. */
export type CoinPricing = {
  readonly coin: (Coin & { readonly name: string }) | null;
  readonly rows: readonly FundingRow[];
  /** REMOVAL's tables of the coin, by `<the Monday's index>|<line>`. */
  readonly tables: ReadonlyMap<string, Removal>;
  readonly mondays: readonly number[];
  readonly markMinutes: MarkMinutes;
};

/** d and x′ of a copy followed after D on one object, with a removal (C10). */
function judgedOf(
  kit: Research,
  mk: Market,
  f: { dir: number; t: number; D: number },
  longShare: number | null,
  removal: Removal | undefined,
  setting: Setting,
): Judged {
  const d = dOf(kit, mk, f, longShare, removedBy(removal));
  return { ...d, edge: edgeOf(kit, mk, f, setting, d) };
}

const unjudged: Judged = { d: null, reason: ENTRY_UNPRICED, edge: null };

/** Every copy of one coin priced (C7–C11, C13), in the copies' order, one at a time. */
export function* priceCoin(
  kit: Research,
  copies: readonly Copy[],
  p: CoinPricing,
): Generator<Position> {
  const markets: CoinMarkets | null =
    p.coin === null ? null : coinMarkets(kit, p.coin, p.rows, p.markMinutes);
  const settings =
    p.coin === null || markets === null ? null : settingsOf(kit, p.coin.bars);
  const priceOne = (c: Copy): Position => {
    const tIn = c.t + c.D;
    const followed = { dir: c.dir, t: c.t, D: c.D };
    const index = p.mondays.indexOf(c.M);
    const table = (line: Line) => p.tables.get(`${index}|${line}`);
    const longShare = c.covariates.longShare;
    // A settled copy's last leg is at the Settlement price, not the tape's (C9; the engine's plan, Q11).
    const legs = c.plan.legs.map((l) => tIn + l.h);
    const tape = c.plan.settled ? legs.slice(0, -1) : legs;
    const thin =
      p.coin === null ||
      isThin(p.coin.bars, tIn) ||
      tape.some((x) => isThin(p.coin!.bars, x));
    if (markets === null || settings === null || p.coin === null)
      return {
        ...c,
        thin,
        money: NO_MARK,
        judged: Object.fromEntries(c.lines.map((l) => [l, unjudged])),
        main: c.lines.includes("MAIN")
          ? {
              stop: { STOP2: NO_MARK, STOP5: NO_MARK },
              days7: NO_MARK,
              jump: null,
              moved: Object.fromEntries(
                MOVED.map((v) => [
                  v.line,
                  { money: NO_MARK, judged: unjudged },
                ]),
              ) as MainReadings["moved"],
              cascade: { money: NO_MARK, edge: null },
              binance: NO_MARK,
            }
          : null,
      };
    const coin = p.coin;
    const vwap = markets.vwap;
    const priced = (
      plan: typeof c.plan,
      setting: Setting,
      mk = vwap,
      at = tIn,
    ) => moneyOf(kit, mk, { dir: c.dir, tIn: at, plan }, setting);
    const judged = Object.fromEntries(
      LINES.filter((l) => c.lines.includes(l)).map((l) => [
        l,
        judgedOf(kit, vwap, followed, longShare, table(l), settings.taker),
      ]),
    );
    let main: MainReadings | null = null;
    if (c.lines.includes("MAIN")) {
      const until = stopUntil(c.plan, c.D, coin.end);
      const stopped = (stop: number) => {
        const at = stopInstant(kit, vwap, { dir: c.dir, tIn }, stop, until);
        return priced(
          at === null ? c.plan : planOf(c, c.exits, coin, at),
          settings.taker,
        );
      };
      main = {
        stop: { STOP2: stopped(STOPS[0]), STOP5: stopped(STOPS[1]) },
        days7: priced(planOf(c, c.exits, coin, tIn + DAYS7_MS), settings.taker),
        jump: jumpRatio(kit, vwap, c.t),
        moved: Object.fromEntries(
          MOVED.map((v) => {
            const D = v.delay(c.D);
            const mk = markets[v.marks];
            return [
              v.line,
              {
                money: priced(
                  planOf({ t: c.t, D }, c.exits, coin),
                  settings.taker,
                  mk,
                  c.t + D,
                ),
                judged: judgedOf(
                  kit,
                  mk,
                  { dir: c.dir, t: c.t, D },
                  longShare,
                  table("MAIN"),
                  settings.taker,
                ),
              },
            ];
          }),
        ) as MainReadings["moved"],
        cascade: {
          money: priced(c.plan, settings.cascade),
          edge: edgeOf(
            kit,
            vwap,
            followed,
            settings.cascade,
            judged.MAIN ?? unjudged,
          ),
        },
        binance: priced(c.plan, settings.binance),
      };
    }
    return {
      ...c,
      thin,
      money: priced(c.plan, settings.taker),
      judged,
      main,
    };
  };
  for (const c of copies) yield priceOne(c);
}

/** Copies by id; equal ids 0, so that a stable sort keeps the kit's order (the supervisor's ruling on the engine review's Q2). */
export const byId = (a: { id: string }, b: { id: string }): number =>
  a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

/** A coin's positions, BUILD's and BUILD-L's copies priced together by id (a tie in the kit's order), one at a time: PRICES' part, and the rehearsal's fortnight in memory (steps.ts `fortnightOf`). */
export function* coinPositions(
  kit: Research,
  i: PricesInputs,
  c: PricesContext,
  seal: Seal,
): Generator<Position> {
  const { coin, rows } = coinReadingOf(c, i, seal);
  const copies = coinCopies(c.build, recordAt(c.build, i.build[0]), i.iid);
  if (i.build[1] !== null)
    for (const x of coinCopies(c.large, recordAt(c.large, i.build[1]), i.iid))
      copies.push(x);
  copies.sort(byId);
  yield* priceCoin(kit, copies, {
    coin,
    rows,
    tables: removalTablesOf(c.removal, recordAt(c.removal, i.removal), i.iid),
    mondays: i.mondays,
    markMinutes: i.markMinutes,
  });
}

/** A chunk of a PRICES part's lines at least, in characters: a write a line is slow. */
const CHUNK_CHARS = 1 << 20;

/** PRICES's function (engine.ts `PartFunction`): the coin's positions lines, given a chunk at a time. */
export const pricesPart: PartFunction = function* (inputs, ctx) {
  let chunk: string[] = [];
  let size = 0;
  for (const pos of coinPositions(
    ctx.kit,
    PricesInputs.parse(inputs),
    PricesContext.parse(ctx.context),
    ctx.seal,
  )) {
    const line = `${JSON.stringify(pos)}\n`;
    chunk.push(line);
    size += line.length;
    if (size >= CHUNK_CHARS) {
      yield Buffer.from(chunk.join(""), "utf8");
      chunk = [];
      size = 0;
    }
  }
  if (chunk.length > 0) yield Buffer.from(chunk.join(""), "utf8");
};

/** PRICES's parts: one a coin the BUILD phases hold, each with its coins.json name. */
export const pricesParts = (
  o: Omit<PricesInputs, "iid" | "coin">,
  coins: readonly (readonly [iid: number, name: string])[],
): PartSpec[] =>
  coins.map(([iid, coin]) => ({
    id: `c${String(iid).padStart(3, "0")}`,
    inputs: { ...o, iid, coin } satisfies PricesInputs,
  }));

/** A positions line parsed (our own file, held to its record: anything else is refused). */
export const positionOf = (line: Buffer): Position =>
  Position.parse(JSON.parse(line.toString("utf8")));
