/**
 * A FRESH world for the exam's look (test/polish-exam-look.test.ts): raw
 * archive files of three days of July 2026 — 07-17, a day without books
 * (NO_BOOK_DAYS), then 07-18 and 07-19 — with a BTC and a SOL trade every
 * 30 s, but none for two minutes of 07-18 (a hole); five liquidation waves
 * that the lines place apart; an `asset_ctxs` day whose header lacks a
 * column, a day without an `asset_ctxs` file; one HYPE funding row at an
 * hour without a price. With its range, its list, the trusted store of the
 * ten months' shape and the exploration's files the look holds to, and a
 * design whose recipe the waves straddle.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  EXAM_DESIGN,
  RECIPE,
  type ExamDesign,
} from "../src/polish/exam/design.js";
import { GATE_NAMES } from "../src/polish/library.js";
import { blockFillKeys, type Range } from "../src/polish/range.js";
import { B0 } from "../src/polish/tries/rules.js";
import { CUTS_FILE } from "../src/polish/tries/steps.js";
import { bookKey, ctxsKey, fundingKey } from "../src/waveh/keys.js";
import { DATA_END } from "../src/waveh/instants.js";
import { loadCoins } from "../src/waveh/coins.js";
import { manifestList } from "../src/waveh/store.js";
import { addr, byBlock, trade } from "./polish-world.js";
import { sha, writeStore } from "./polish-tries-store.js";
import { CTXS_HEAD, lz4, makeStore, scratch } from "./waveh-world.js";

/** An instant of July 2026: `at("18T01:00:00")`. */
export const at = (s: string) => Date.parse(`2026-07-${s}Z`);
export const D17 = at("17T00:00:00");
export const D18 = at("18T00:00:00");
export const D19 = at("19T00:00:00");
/** The trades run from here to there, every 30 s. */
const FROM = at("17T09:00:00");
const TO = at("19T13:00:00");
/** No record in (11:30:00, 11:32:00) of 07-18. */
export const HOLE: [number, number] = [at("18T11:30:00"), at("18T11:32:00")];

/**
 * The waves: a coin and its forced sellers' fills (account number, instant);
 * an entry is the second fill of one slice (slice = the number mod 147).
 * W4 at an entry counts every account of the hour up to it.
 * - A, slice 1, W4 2 (N, B0): its legs on 07-17, cut by option B.
 * - B, slice 3, W4 3 (715, N, B0): on the deciding days, priced.
 * - C, slice 40, W4 4 (every line): beside only, its slice ≥ K.
 * - E, slice 7, W4 2 (N, B0): its funding row at 10:00 has no price.
 * - D, slice 4, W4 2 (N, B0): the hole in its hour, left out.
 */
export const WAVES: Record<
  string,
  { coin: string; fills: [number, string][] }
> = {
  A: {
    coin: "SOL",
    fills: [
      [1, "17T09:58:00"],
      [148, "17T10:00:00"],
    ],
  },
  B: {
    coin: "SOL",
    fills: [
      [10, "18T00:50:00"],
      [150, "18T00:56:00"],
      [3, "18T01:00:00"],
    ],
  },
  C: {
    coin: "HYPE",
    fills: [
      [40, "18T04:50:00"],
      [50, "18T04:52:00"],
      [60, "18T04:54:00"],
      [187, "18T05:00:00"],
    ],
  },
  E: {
    coin: "HYPE",
    fills: [
      [7, "18T07:58:00"],
      [154, "18T08:00:00"],
    ],
  },
  D: {
    coin: "SOL",
    fills: [
      [4, "18T11:58:00"],
      [151, "18T12:00:00"],
    ],
  },
};
/** The recipe the waves straddle: W4's cuts 3 (deciding), 2 (N) and 4 (beside). */
export const LOOK_RECIPE = { ...RECIPE, deciding: 3, n: 2, beside: 4 };

/** The world's range: FRESH's name, its fill files the hours of the trades. */
export const LOOK_RANGE: Range = {
  name: "FRESH",
  partial: null,
  fill: blockFillKeys(FROM, TO),
  days: [D17, D19],
  fundingStarts: [DATA_END + 40 * 86_400_000],
  end: at("20T00:00:00"),
  grid: { start: D17, minutes: 3 * 1440 },
  months: ["2026-07"],
  failingCtxsDayAbsent: true,
};

const tmp = (name: string) => {
  const d = mkdtempSync(path.join(tmpdir(), `polish-${name}-`));
  scratch.push(d);
  return d;
};

/** The raw store: every event an instant's block, each file its hour's blocks. */
export function rawWorld() {
  const events = new Map<number, string[]>();
  const put = (t: number, records: readonly string[]) =>
    events.set(t, [...(events.get(t) ?? []), ...records]);
  let tid = 1_000;
  for (let t = FROM, k = 0; t < TO; t += 30_000, k++) {
    if (t > HOLE[0] && t < HOLE[1]) continue;
    const side = k % 2 === 0 ? "B" : "A";
    put(t, [
      ...trade(addr(900), addr(901), {
        coin: "BTC",
        side,
        time: t,
        tid: tid++,
      }),
      ...trade(addr(902), addr(903), {
        coin: "SOL",
        side,
        time: t,
        tid: tid++,
        px: "150",
      }),
    ]);
  }
  for (const { coin, fills } of Object.values(WAVES))
    for (const [n, s] of fills)
      put(
        at(s),
        trade(addr(n), addr(999), {
          coin,
          side: "A",
          time: at(s),
          tid: tid++,
          px: coin === "SOL" ? "150" : "40",
          startPosition: "1.0",
          liquidation: {
            liquidatedUser: addr(n),
            markPx: coin === "SOL" ? "150" : "40",
            method: "market",
          },
        }),
      );
  const files = new Map<string, string>();
  let block = 1;
  for (const t of [...events.keys()].sort((a, b) => a - b)) {
    const key = blockFillKeys(t, t + 1)[0]!;
    files.set(
      key,
      `${files.get(key) ?? ""}${byBlock(block++, events.get(t)!)}\n`,
    );
  }
  files.set(ctxsKey(D17), `${CTXS_HEAD}\n`);
  files.set(ctxsKey(D19), `${CTXS_HEAD.replace(",premium", "")}\n`);
  const coins = loadCoins();
  for (const c of coins.list)
    files.set(
      fundingKey(c.name, LOOK_RANGE.fundingStarts[0]!),
      c.name === "HYPE"
        ? JSON.stringify([
            {
              coin: "HYPE",
              fundingRate: "0.0001",
              premium: "0",
              time: at("18T10:00:00") + 17,
            },
          ])
        : "[]",
    );
  const { store } = makeStore(files, false);
  const listText = readFileSync(path.join(store, "manifest.jsonl"));
  return {
    store,
    list: manifestList(listText.toString("utf8")),
    listSha256: sha(listText),
  };
}

/**
 * The ten months' folder as the look reads it: a trusted store of their
 * shape (no row), its gates, the exploration's choice.json naming N's rule,
 * cuts.json with W4 at the recipe's N; the design holding them by SHA-256.
 */
export function analyzerWorld() {
  const analyzer = tmp("look-analyzer");
  writeStore(path.join(analyzer, "store"), {
    minuteStart: at("01T00:00:00") - 400 * 86_400_000,
    end: DATA_END,
    files: [],
  });
  const manifest = readFileSync(path.join(analyzer, "store", "manifest.json"));
  const gates = JSON.stringify({
    store: { manifestSha256: sha(manifest) },
    passed: true,
    gates: Object.fromEntries(GATE_NAMES.map((g) => [g, { pass: true }])),
    written: "2026-11-19T00:00:00.000Z",
  });
  mkdirSync(path.join(analyzer, "gates"));
  writeFileSync(path.join(analyzer, "gates", "gates.json"), gates);
  mkdirSync(path.join(analyzer, "explore"));
  const choice = JSON.stringify({
    adopted: [{ name: "W4" }],
    rule: { ...B0, name: "N", filters: ["W4"] },
    N: null,
  });
  writeFileSync(path.join(analyzer, "explore", "choice.json"), choice);
  const real = JSON.parse(readFileSync(CUTS_FILE, "utf8")) as {
    cuts: { W4: { value: number } };
  };
  real.cuts.W4.value = LOOK_RECIPE.n;
  const cutsFile = path.join(analyzer, "cuts.json");
  writeFileSync(cutsFile, JSON.stringify(real));
  const design: ExamDesign = {
    ...EXAM_DESIGN,
    explored: {
      ...EXAM_DESIGN.explored,
      store: sha(manifest),
      gates: sha(gates),
      cuts: sha(readFileSync(cutsFile)),
      choice: sha(choice),
    },
    recipe: LOOK_RECIPE,
    placebo: sha(PLACEBO_TEXT),
  };
  return { analyzer, cutsFile, design };
}

/** The placebo.json step 2 copies into its report, from EXAM_ROOT. */
export const PLACEBO_TEXT = `${JSON.stringify({
  placebo: { l715: "percentiles" },
  z: { twoLooks: [] },
})}\n`;

/** A book snapshot line in the archive's shape: bids, then asks, each [px, sz]. */
const snapshot = (
  coin: string,
  time: number,
  bids: [number, number][],
  asks: [number, number][],
) =>
  JSON.stringify({
    time: "x",
    raw: {
      channel: "l2Book",
      data: {
        coin,
        time,
        levels: [bids, asks].map((side) =>
          side.map(([px, sz]) => ({ px: String(px), sz: String(sz), n: 1 })),
        ),
      },
    },
  });

/**
 * FRESH's books for step 2, into the raw store with its books.jsonl: SOL's
 * hour at B's entry, a snapshot 5 s before it (live) whose asks hold $1,000
 * across two levels; HYPE's at E's entry, 20 s before it (stale); the
 * hours of B's and E's exits missing from the archive.
 */
export function booksWorld(store: string) {
  const lines: string[] = [];
  const put = (coin: string, hour: number, text: string) => {
    const key = bookKey(coin, hour);
    const bytes = lz4(text);
    const file = path.join(store, ...key.split("/"));
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, bytes);
    lines.push(
      JSON.stringify({ key, bytes: bytes.length, sha256: sha(bytes) }),
    );
  };
  put(
    "SOL",
    at("18T01:00:00"),
    snapshot(
      "SOL",
      at("18T01:01:55"),
      [[149.9, 10]],
      [
        [150.1, 3],
        [150.3, 10],
      ],
    ),
  );
  put(
    "HYPE",
    at("18T08:00:00"),
    snapshot("HYPE", at("18T08:01:40"), [[39.9, 100]], [[40.1, 100]]),
  );
  for (const [coin, hour] of [
    ["SOL", at("19T01:00:00")],
    ["HYPE", at("19T08:00:00")],
  ] as const)
    lines.push(JSON.stringify({ key: bookKey(coin, hour), missing: true }));
  writeFileSync(path.join(store, "books.jsonl"), `${lines.join("\n")}\n`);
}
