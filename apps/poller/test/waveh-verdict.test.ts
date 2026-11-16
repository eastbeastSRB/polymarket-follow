/**
 * A look of 24 days and 12 coins through the real rehearse and look
 * (rules.md H11, H12): the day and coin of every position fed to the verdict,
 * and HOLDS end to end. The world is WAVE-H-RULES-REVIEW's first made-up look
 * (2026-11-16): a position a day from 2025-09-01, the book's gross about
 * +250 bps, the marks drifting up with a step after each entry. Every price,
 * fill and mark is made up.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { loadResearch } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { loadCoins } from "../src/waveh/coins.js";
import { bookKey, ctxsKey } from "../src/waveh/keys.js";
import { BooksNeeded, type Ctx } from "../src/waveh/legs.js";
import { look } from "../src/waveh/look.js";
import { MARKS_START } from "../src/waveh/market.js";
import { SizingFile, rehearse } from "../src/waveh/rehearse.js";
import { manifestList } from "../src/waveh/store.js";
import {
  CTXS_HEAD,
  block,
  cleanScratch,
  fillKey,
  fundingFiles,
  liquidation,
  lz4,
  makeStore,
  scratch,
  sha,
} from "./waveh-world.js";

afterAll(cleanScratch);

const coins = loadCoins();
const N = 24;
const COINS = 12;
const hourOf = (t: number) => t - (t % HOUR_MS);
const dayStart = (t: number) => t - (t % DAY_MS);
const iso = (t: number) => new Date(t).toISOString().replace(".000Z", "Z");
const T1 = (i: number) => Date.parse("2025-09-01T10:00:00Z") + i * DAY_MS;
const T2 = (i: number) => T1(i) + 5 * MINUTE_MS;
const XIN = (i: number) => T2(i) + 2 * MINUTE_MS;
const XOUT = (i: number) => XIN(i) + DAY_MS;
const coinOf = (i: number) => coins.list[i % COINS]!.name;
/** Position i's gross at the book, bps: about +250. */
const gross = (i: number) => 250 + (((i * 37) % 11) - 5) * 6;
/** Position i's coin's mark: +0.3% a day, 3% higher from 30 minutes after x_in. */
const markOf = (i: number, t: number) =>
  100 *
  Math.exp((0.003 * (t - MARKS_START)) / DAY_MS) *
  (t >= XIN(i) + 30 * MINUTE_MS ? 1.03 : 1);
const snap = (coin: string, t: number, bid: number, ask: number) =>
  JSON.stringify({
    time: "x",
    raw: {
      channel: "l2Book",
      data: {
        coin,
        time: t,
        levels: [
          [{ px: String(bid), sz: "1000", n: 1 }],
          [{ px: String(ask), sz: "1000", n: 1 }],
        ],
      },
    },
  });

function world() {
  const files = new Map<string, string>();
  // SIZING: one SOL wave, so M = 1 and the rehearsal seals one position.
  const W1 = Date.parse("2025-06-10T10:00:00Z");
  files.set(
    fillKey(W1),
    [
      ...liquidation(1, "SOL", "A", W1, 1),
      ...liquidation(2, "SOL", "A", W1 + 5 * MINUTE_MS, 2),
    ].join("\n"),
  );
  const fills = new Map<string, string[]>();
  const rows = new Map<number, string[]>();
  const funding = [];
  for (let i = 0; i < N; i++) {
    const coin = coinOf(i);
    for (const [n, t] of [T1(i), T2(i)].entries()) {
      const key = fillKey(t, "node_fills_by_block");
      const lines = fills.get(key) ?? [];
      lines.push(
        block(
          lines.length + 1,
          liquidation(1_000 + 2 * i + n, coin, "A", t, 5_000 + 2 * i + n),
        ),
      );
      fills.set(key, lines);
    }
    for (
      let d = dayStart(XIN(i));
      d < dayStart(XIN(i)) + 3 * DAY_MS;
      d += DAY_MS
    ) {
      const list = rows.get(d) ?? [];
      rows.set(d, list);
      for (let m = 0; m < 1_440; m++) {
        const t = d + m * MINUTE_MS;
        list.push(`${iso(t)},${coin},0,1,1,1,0,1,${markOf(i, t)},1,1,1`);
      }
      for (let h = d; h < d + DAY_MS; h += HOUR_MS)
        funding.push({
          coin,
          fundingRate: "0.00001",
          premium: "0",
          time: h + 17,
        });
    }
  }
  for (const [key, lines] of fills) files.set(key, lines.join("\n"));
  for (const [d, list] of rows)
    files.set(ctxsKey(d), [CTXS_HEAD, ...list].join("\n"));
  for (const [key, text] of fundingFiles(funding)) files.set(key, text);
  return { files, W1 };
}

describe(
  "a look of 24 days and 12 coins (H11, H12)",
  { timeout: 600_000 },
  () => {
    it("feeds the verdict every position's day and coin, and HOLDS end to end", async () => {
      const { files, W1 } = world();
      const { store } = makeStore(files, "to DATA END");
      const root = mkdtempSync(path.join(tmpdir(), "waveh-root-"));
      scratch.push(root);
      const ctx: Ctx = {
        store,
        list: manifestList(
          readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
        ),
        coins,
        kit: await loadResearch(),
        pace: () => Promise.resolve(),
        log: () => {},
      };
      const books: string[] = [];
      const book = (coin: string, x: number, bid: number, ask: number) => {
        const key = bookKey(coin, hourOf(x));
        const bytes = lz4(snap(coin, x - 2_000, bid, ask));
        const file = path.join(store, ...key.split("/"));
        mkdirSync(path.dirname(file), { recursive: true });
        writeFileSync(file, bytes);
        books.push(
          JSON.stringify({ key, bytes: bytes.length, sha256: sha(bytes) }),
        );
        writeFileSync(path.join(store, "books.jsonl"), `${books.join("\n")}\n`);
      };
      // The SIZING position's books, then the rehearsal.
      const x1 = W1 + 7 * MINUTE_MS;
      book("SOL", x1, 99.9, 100.1);
      book("SOL", x1 + DAY_MS, 99.9, 100.1);
      const sizing = SizingFile.parse(await rehearse(ctx, root));
      expect(sizing.M).toBe(1);
      // Step 1, then each position's books: in at 100.1, out at the bid that gives its gross.
      await expect(
        look(ctx, { open: true }, root, sizing, "d"),
      ).rejects.toThrow(BooksNeeded);
      for (let i = 0; i < N; i++) {
        const out = 100.1 * (1 + gross(i) / 1e4);
        book(coinOf(i), XIN(i), 99.9, 100.1);
        book(coinOf(i), XOUT(i), out, out + 0.2);
      }
      await expect(
        look(ctx, { open: true }, root, sizing, "d"),
      ).resolves.toEqual({
        verdict: "HOLDS",
      });
      const result = JSON.parse(
        readFileSync(path.join(root, "look", "result.json"), "utf8"),
      ) as { stat: { days: number; markets: number } };
      expect(result).toMatchObject({
        positions: N,
        priced: N,
        unpriced: 0,
        depthShort: 0,
        verdict: "HOLDS",
      });
      expect(result.stat).toMatchObject({ days: N, markets: COINS });
    });
  },
);
