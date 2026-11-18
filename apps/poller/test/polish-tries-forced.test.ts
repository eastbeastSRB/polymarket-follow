/**
 * The forced fills (src/polish/tries/forced.ts) on a synthetic store: H4's
 * rule and each input file's bound as `countedFrom` reads them, in every
 * coin; the 38 coins' px, sz and markPx in `countedFrom`'s order, its
 * counted fills fill for fill (M4's order on the same instant: the coin, the
 * address, the tid past 2^32); a `counted` that is not the store's fails
 * the check.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { countedFrom } from "../src/polish/counted.js";
import { GateFailed } from "../src/polish/run.js";
import { openStore } from "../src/polish/store.js";
import { forcedFrom } from "../src/polish/tries/forced.js";
import { loadCoins } from "../src/waveh/coins.js";
import { DATA_END, TEST_START } from "../src/waveh/instants.js";
import { addr } from "./polish-world.js";
import { writeStore, type LiqRow } from "./polish-tries-store.js";

const coins = loadCoins();
const T1 = Date.parse("2025-06-10T10:00:00Z");
const T2 = Date.parse("2025-09-10T10:00:00Z");
const FILES = [
  "node_fills_by_block/hourly/20250610/10.lz4",
  "node_fills_by_block/hourly/20250801/0.lz4",
  "node_fills_by_block/hourly/20250910/10.lz4",
];

/** A liquidated account's own leg: side −1 a forced sell of a long, +1 a forced buy of a short. */
const own = (
  time: number,
  coin: string,
  user: number,
  side: 1 | -1,
  tid: bigint,
  file: number,
  more: Partial<LiqRow> = {},
): LiqRow => ({
  time,
  coin,
  user: addr(user),
  liqUser: addr(user),
  side,
  crossed: true,
  method: "market",
  px: 100 + user,
  sz: 1 + user / 10,
  markPx: 99 + user,
  startPosition: -side,
  tid,
  file,
  ...more,
});

// Forced: the counted fills of the 38 coins (SOL 5, kPEPE 15) and of BTC and a builder dex's coin.
const forced: LiqRow[] = [
  own(T1, "SOL", 3, -1, 7n, 0),
  // The same instant: kPEPE's asset id after SOL's; account 2 before 3; tid 5 before 2^32 + 1; each its own px.
  own(T1 + 1_000, "kPEPE", 2, 1, 9n, 0, {
    crossed: false,
    method: "backstop",
    px: 110,
  }),
  own(T1 + 1_000, "SOL", 3, -1, 2n ** 32n + 1n, 0, { px: 111 }),
  own(T1 + 1_000, "SOL", 3, -1, 5n, 0, { px: 112 }),
  own(T1 + 1_000, "SOL", 2, -1, 8n, 0, { px: 113 }),
  own(TEST_START, "SOL", 4, 1, 11n, 1),
  own(T2, "SOL", 5, -1, 12n, 2),
  own(T2, "BTC", 6, -1, 13n, 2),
  own(T2 + 1, "BTC", 7, 1, 14n, 2, { crossed: false, method: "backstop" }),
  own(T2 + 2, "xyz:TSLA", 8, -1, 15n, 2, { method: "backstop" }),
];
// Not forced: the other legs H4 refuses, and the records past each file's bound.
const others: LiqRow[] = [
  { ...own(T1, "SOL", 9, 1, 7n, 0), crossed: false, liqUser: addr(3) },
  { ...own(T1 + 2_000, "SOL", 10, -1, 20n, 0), liqUser: null },
  own(T1 + 3_000, "SOL", 11, -1, 21n, 0, { startPosition: -1 }),
  own(T1 + 4_000, "SOL", 12, -1, 22n, 0, { crossed: false }),
  own(TEST_START + 50, "SOL", 13, -1, 23n, 0),
  own(TEST_START - 100, "SOL", 14, -1, 24n, 1),
  own(T2 + 3, "BTC", 15, -1, 25n, 2, { startPosition: 0 }),
  // A SIZING file's record at TEST's start itself; another account's taker and backstop legs.
  own(TEST_START, "SOL", 16, -1, 28n, 0),
  { ...own(T1 + 5_000, "BTC", 17, 1, 29n, 0), liqUser: addr(18) },
  {
    ...own(T1 + 6_000, "BTC", 19, -1, 30n, 0, {
      crossed: false,
      method: "backstop",
    }),
    liqUser: addr(20),
  },
];

describe("the forced fills", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "polish-forced-"));
  writeStore(dir, {
    minuteStart: Date.parse("2025-06-01T00:00:00Z"),
    end: DATA_END,
    files: FILES,
    liq: [...others, ...forced],
  });
  const store = openStore(dir);
  const { counted } = countedFrom(store, coins);

  it("are every coin's own reducing legs, a taker's or a backstop's, inside their file's bound", () => {
    const f = forcedFrom(store, coins, counted);
    const users = store.users();
    const rows = Array.from(f.t, (t, i) => [
      t,
      f.coins[f.coin[i]!],
      users[f.user[i]!],
      f.side[i],
      f.backstop[i],
    ]);
    const want = forced.map((r) => [
      r.time,
      r.coin,
      r.user,
      r.side,
      r.method === "backstop" ? 1 : 0,
    ]);
    expect(rows.sort()).toEqual(want.sort());
  });

  it("give the 38 coins' px, sz and markPx in countedFrom's order, its counted fills one for one", () => {
    const f = forcedFrom(store, coins, counted);
    expect(counted.map((c) => c.tid)).toEqual([
      "7",
      "8",
      "5",
      "4294967297",
      "9",
      "11",
      "12",
    ]);
    const users = [2, 3, 3, 2, 4, 5];
    // M4's order, not the store's: at T1 + 1 s SOL's account 2, then account 3's tids 5 and 2^32 + 1, then kPEPE.
    expect(Array.from(f.px)).toEqual([103, 113, 112, 111, 110, 104, 105]);
    expect(Array.from(f.sz)).toEqual([3, ...users].map((u) => 1 + u / 10));
    expect(Array.from(f.markPx)).toEqual([3, ...users].map((u) => 99 + u));
  });

  it("fail the check when the counted fills are not the store's", () => {
    for (const bad of [
      counted.slice(1),
      counted.slice(0, -1),
      [counted[1]!, counted[0]!, ...counted.slice(2)],
      counted.map((c, i) => (i === 3 ? { ...c, method: "backstop" } : c)),
      counted.map((c, i) =>
        i === 3
          ? { ...c, side: c.side === 1 ? (-1 as const) : (1 as const) }
          : c,
      ),
    ])
      expect(() => forcedFrom(store, coins, bad)).toThrow(GateFailed);
  });
});
