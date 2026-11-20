/**
 * FRESH's store's integrity before any position (src/polish/exam/fresh.ts
 * `integrityOf`, gates.ts `wholeOf` and `pairingOf`; polish/rules.md P2; THE
 * PLAN D9; decisions 2026-11-19, the plan's questions ruled, Q7 (a)): G0's
 * checks on FRESH's store, made from its own list (no look), and G5's
 * pairing of FRESH's files — a straddle only between files next in order, a
 * record alone only in the first or the last file, listed, any other record
 * alone a problem unless `polish/fresh-unpaired.json` lists it — every
 * problem kept. G0's and G5's own outputs on the 10 months stay pinned by
 * polish-gates.test.ts.
 */
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { EXAM_FILES } from "../src/polish/exam/gate.js";
import { FRESH_UNPAIRED_FILE, integrityOf } from "../src/polish/exam/fresh.js";
import { extract } from "../src/polish/extract.js";
import {
  KnownUnpaired,
  pairingOf,
  type WholeInput,
} from "../src/polish/gates.js";
import { blockFillKeys, type Range } from "../src/polish/range.js";
import type { Seal } from "../src/polish/seal.js";
import {
  Store,
  openStore,
  type FileCounts,
  type Manifest,
} from "../src/polish/store.js";
import { fortyOf } from "../src/polish/writers.js";
import { HOUR_MS } from "../src/schedule.js";
import { loadCoins } from "../src/waveh/coins.js";
import { PACKAGE_ROOT, sha256 } from "../src/waveh/gate.js";
import { DATA_END } from "../src/waveh/instants.js";
import { ctxsKey, fundingKey } from "../src/waveh/keys.js";
import { manifestList } from "../src/waveh/store.js";
import { addr, byBlock, record, trade } from "./polish-world.js";
import { CTXS_HEAD, cleanScratch, makeStore, scratch } from "./waveh-world.js";

afterAll(cleanScratch, 120_000);

const OPEN: Seal = { examFrozen: true };
const coins = loadCoins();
const FORTY = [...fortyOf(coins)];
const SMALL = coins.list.map((c) => c.name);
const D0 = Date.parse("2026-06-01T00:00:00Z");
const H0 = D0 + 10 * HOUR_MS;
const [F10, F11, F12] = blockFillKeys(H0, H0 + 3 * HOUR_MS) as [
  string,
  string,
  string,
];
const lone = (
  user: number,
  coin: string,
  time: number,
  tid: number,
  crossed: boolean,
) => record(addr(user), { coin, side: "B", time, crossed, tid });

/**
 * Three FRESH hours: a SOL trade (tid 7) paired in 10h; a HYPE taker alone
 * in 10h, the first file (tid 50); a SOL taker alone in 11h (tid 60); a SOL
 * trade split across 11h and 12h (tid 70); an ETH maker alone in 12h, the
 * last file (tid 80).
 */
const files = new Map<string, string>([
  [
    F10,
    byBlock(1, [
      ...trade(addr(1), addr(2), {
        coin: "SOL",
        side: "A",
        time: H0 + 1_000,
        tid: 7,
      }),
      lone(5, "HYPE", H0 + 2_000, 50, true),
    ]),
  ],
  [
    F11,
    byBlock(2, [
      lone(6, "SOL", H0 + HOUR_MS + 1_000, 60, true),
      lone(7, "SOL", H0 + 2 * HOUR_MS - 100, 70, true),
    ]),
  ],
  [
    F12,
    byBlock(3, [
      lone(8, "SOL", H0 + 2 * HOUR_MS - 100, 70, false),
      lone(9, "ETH", H0 + 2 * HOUR_MS + 1_000, 80, false),
    ]),
  ],
  [ctxsKey(D0), `${CTXS_HEAD}\n`],
  ...SMALL.map((c) => [fundingKey(c, DATA_END), "[]"] as [string, string]),
]);
const range: Range = {
  name: "FRESH",
  partial: null,
  fill: [F10, F11, F12],
  days: [D0],
  fundingStarts: [DATA_END],
  end: D0 + 86_400_000,
  grid: { start: D0, minutes: 1440 },
  months: ["2026-06"],
  failingCtxsDayAbsent: true,
};

const at = (key: string, coin: string, tid: number, what: string) =>
  `${key} ${coin} ${tid}: 1 ${what} unpaired`;

// Each check holds every file of the store to its hash: seconds a check under the full suite's load.
describe(
  "FRESH's store's integrity (rules.md P2, D9)",
  { timeout: 60_000 },
  () => {
    let o: WholeInput;

    beforeAll(async () => {
      const { store } = makeStore(files, false);
      const listText = readFileSync(path.join(store, "manifest.jsonl"));
      const list = manifestList(listText.toString("utf8"));
      const analyzer = mkdtempSync(path.join(tmpdir(), "polish-integrity-"));
      scratch.push(analyzer);
      const root = path.join(analyzer, "ANALYZER", "FRESH");
      await extract({
        store,
        root,
        list,
        listName: "polish/fresh.sha256",
        listSha256: sha256(listText),
        range,
        workers: 0,
        code: "4".repeat(64),
        wavehFrozen: "5".repeat(64),
        forty: FORTY,
        small: SMALL,
        pace: () => Promise.resolve(),
        log: () => {},
        seal: OPEN,
      });
      o = {
        store: openStore(path.join(root, "store"), OPEN),
        list,
        listSha256: sha256(listText),
        wavehFrozen: "5".repeat(64),
        code: "4".repeat(64),
        fill: range.fill,
        coins,
        forty: FORTY,
      };
    }, 60_000);

    it("holds the whole store and pairs its tape: a trade split across files next in order, a record alone in the first or the last file listed, any other one alone a problem", () => {
      const r = integrityOf(o, []);
      expect(r.whole).toMatchObject({
        problems: [],
        counters: { refused: 0, misread: 0, slowLines: 0, slowRecords: 0 },
        storeCode: "4".repeat(64),
        thisCode: "4".repeat(64),
      });
      expect(r.pairing).toEqual({
        problems: [at(F11, "SOL", 60, "taker")],
        totals: { SOL: [3, 2], HYPE: [1, 0], ETH: [0, 1] },
        straddled: 1,
        edges: [at(F10, "HYPE", 50, "taker"), at(F12, "ETH", 80, "maker")],
        found: [],
      });
      expect(r.pass).toBe(false);
    });

    it("accepts a record alone only when fresh-unpaired.json lists it on its side; a listed record not found fails, named", () => {
      const ruled = (file: string, tid: string, side: "taker" | "maker") =>
        KnownUnpaired.parse([
          { file, coin: "SOL", tid, side, ruled: "2026-11-25" },
        ]);
      expect(integrityOf(o, ruled(F11, "60", "taker"))).toMatchObject({
        pass: true,
        pairing: { problems: [], found: [at(F11, "SOL", 60, "taker")] },
      });
      for (const [file, tid, side] of [
        [F11, "60", "maker"],
        [F10, "60", "taker"],
        [F11, "61", "taker"],
      ] as const)
        expect(
          integrityOf(o, ruled(file, tid, side)).pairing!.problems,
        ).toEqual([
          at(F11, "SOL", 60, "taker"),
          `${file} SOL ${tid}: listed as 1 ${side} unpaired, not found`,
        ]);
    });

    it("lists every problem, past the 20 a gate lists", () => {
      const lines = o.store.files();
      lines[1]!.unpaired = Array.from({ length: 25 }, (_, i) => [
        "SOL",
        String(100 + i),
        1,
      ]);
      const store = new Store(o.store.dir, o.store.manifest, o.store.id, OPEN);
      store.files = (): FileCounts[] => lines;
      const r = integrityOf({ ...o, store }, []);
      expect(r.pairing!.problems).toEqual(
        Array.from({ length: 25 }, (_, i) => at(F11, "SOL", 100 + i, "taker")),
      );
      expect(pairingOf(lines, []).problems).toHaveLength(25);
    });

    it("pairs a trade split across files only between files next in order, one taker against one maker", () => {
      const withUnpaired = (u: Record<number, [string, string, number][]>) =>
        o.store.files().map((f, i) => ({ ...f, unpaired: u[i] ?? [] }));
      const pairing = (u: Record<number, [string, string, number][]>) =>
        pairingOf(withUnpaired(u), []);
      expect(
        pairing({ 0: [["SOL", "900", 1]], 1: [["SOL", "900", -1]] }),
      ).toMatchObject({ problems: [], straddled: 1, edges: [] });
      // The first and the last file, not next in order.
      expect(
        pairing({ 0: [["SOL", "900", 1]], 2: [["SOL", "900", -1]] }).problems,
      ).toEqual([at(F10, "SOL", 900, "taker"), at(F12, "SOL", 900, "maker")]);
      // Two takers against two makers.
      expect(
        pairing({ 0: [["SOL", "900", 2]], 1: [["SOL", "900", -2]] }).problems,
      ).toEqual([
        `${F10} SOL 900: 2 takers unpaired`,
        `${F11} SOL 900: 2 makers unpaired`,
      ]);
      // A taker in each file.
      expect(
        pairing({ 0: [["SOL", "900", 1]], 1: [["SOL", "900", 1]] }).problems,
      ).toEqual([at(F10, "SOL", 900, "taker"), at(F11, "SOL", 900, "taker")]);
      // Alone in the first file, one record is an edge; two are a problem.
      expect(pairing({ 0: [["SOL", "901", 1]] })).toMatchObject({
        problems: [],
        edges: [at(F10, "SOL", 901, "taker")],
      });
      expect(pairing({ 0: [["SOL", "901", 2]] })).toMatchObject({
        problems: [`${F10} SOL 901: 2 takers unpaired`],
        edges: [],
      });
    });

    it("refuses a store not FRESH's whole, made from another list, by other code or under another WAVE-H freeze, or not of FRESH's files as listed, and pairs nothing then", () => {
      const withManifest = (edit: (m: Manifest) => void) => {
        const m = structuredClone(o.store.manifest);
        edit(m);
        return integrityOf(
          { ...o, store: new Store(o.store.dir, m, o.store.id, OPEN) },
          [],
        );
      };
      for (const [r, problem] of [
        [
          withManifest((m) => (m.range = "WAVE-H")),
          "the store is WAVE-H, whole",
        ],
        [
          withManifest((m) => (m.partial = "2026-06-01")),
          "the store is FRESH, 2026-06-01",
        ],
        [
          integrityOf({ ...o, listSha256: "0".repeat(64) }, []),
          "the store was made from another list",
        ],
        [
          integrityOf({ ...o, code: "7".repeat(64) }, []),
          "the store was made by other code",
        ],
        [
          integrityOf({ ...o, wavehFrozen: "6".repeat(64) }, []),
          "the store was made under another WAVE-H freeze",
        ],
        [
          integrityOf(
            { ...o, list: new Map(o.list).set(F10, "f".repeat(64)) },
            [],
          ),
          `files.jsonl line 1 is not ${F10} as listed`,
        ],
        [
          integrityOf({ ...o, fill: [F10, F12, F11] }, []),
          `files.jsonl line 2 is not ${F12} as listed`,
        ],
        [
          integrityOf(
            {
              ...o,
              fill: [
                ...o.fill,
                blockFillKeys(H0 + 3 * HOUR_MS, H0 + 4 * HOUR_MS)[0]!,
              ],
            },
            [],
          ),
          "files.jsonl: 3 lines, 4 files",
        ],
      ] as const) {
        expect(r.whole.problems, problem).toContain(problem);
        expect(r.pairing, problem).toBeNull();
        expect(r.pass, problem).toBe(false);
      }
    });

    it("reads fresh-unpaired.json, committed empty, which the exam's freeze requires by name", () => {
      expect(FRESH_UNPAIRED_FILE).toBe(
        path.join(PACKAGE_ROOT, "polish", "fresh-unpaired.json"),
      );
      expect(
        KnownUnpaired.parse(
          JSON.parse(readFileSync(FRESH_UNPAIRED_FILE, "utf8")),
        ),
      ).toEqual([]);
      expect(EXAM_FILES).toContain("polish/fresh-unpaired.json");
    });
  },
);
