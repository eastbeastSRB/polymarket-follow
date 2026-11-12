import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { afterAll, describe, expect, it } from "vitest";
import { CUT } from "../src/paper/instants.js";
import {
  MarketEndError,
  joinDays,
  marketThrough,
} from "../src/paper/market.js";
import {
  loadResearch,
  type Market,
  type PanelFile,
} from "../src/paper/research.js";
import { loadSeed, readManifest } from "../src/paper/seed.js";
import {
  SEED_MANIFEST,
  SeedBlindError,
  buildSeed,
  captureFile,
  readCapture,
} from "../scripts/paper-seed.js";
import type { MarketDay } from "../src/paper/store.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { addr, row } from "./paper-world.js";

const scratch = mkdtempSync(path.join(tmpdir(), "paper-seed-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));
const kit = await loadResearch();

/** A capture file as R2-STYLE wrote it: one JSON line a page; `literal` replaces quoted markers. */
function capture(
  roots: { capture: string; merged: string },
  account: string,
  pages: unknown[],
  literals: Record<string, string> = {},
): void {
  let text = pages.map((p) => JSON.stringify(p)).join("\n");
  for (const [m, l] of Object.entries(literals))
    text = text.replaceAll(`"${m}"`, l);
  const file = path.join(
    roots.capture,
    "accounts",
    `${account}.fills.jsonl.gz`,
  );
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, gzipSync(`${text}\n`));
}

const page = (
  n: number | string,
  data: unknown[],
  more = false,
  status = 200,
) => ({
  page: n,
  status,
  body: { data, more },
});

describe("the seed (R3)", () => {
  const roots = {
    capture: path.join(scratch, "R2"),
    merged: path.join(scratch, "R8"),
  };
  const T = CUT - 10 * DAY_MS;

  it("reads a capture the kit's way, keeping ids above 2^53 as their text", () => {
    capture(
      roots,
      addr(1),
      [
        page(2, [row(3, T + 30), row(2, T + 20)], true),
        page(1, [
          row(1, T + 10),
          row(2, T + 20),
          row(9, T + 5, { trade_id: "BIG", liquidation: true }),
        ]),
        page("w1", [row(7, T - DAY_MS)]),
        page(3, [row(4, T + 40)], true, 429),
        page(3, [row(5, T + 50), row(6, T + 60, { side: "?" })], true),
      ],
      { BIG: "9007199254740993" },
    );
    const seed = readCapture(addr(1), captureFile(addr(1), roots)!);
    expect(seed).toMatchObject({
      addr: addr(1),
      pages: 3,
      truncated: true,
      dropped: 1,
    });
    expect(seed.rows.map((r) => [r.trade_id, r.timestamp])).toEqual([
      ["9007199254740993", T + 5],
      ["1000001", T + 10],
      ["1000002", T + 20],
      ["1000003", T + 30],
      ["1000005", T + 50],
    ]);
    // The kit's reader on the same file: the same fills but the big id's, which it drops.
    const theKit = kit.fills.readAccount(addr(1), roots)!;
    const ours = seed.rows
      .filter((r) => r.trade_id !== "9007199254740993")
      .map((r) => kit.fills.normFill(r));
    expect(
      ours.map((f) => ({ ...f, oid: Number(f.oid), tid: Number(f.tid) })),
    ).toEqual(theKit.fills);
    expect([theKit.pages, theKit.truncated, theKit.dropped]).toEqual([
      3,
      true,
      2,
    ]);
  });

  it("refuses a row at or after the cut, as the kit does", () => {
    capture(roots, addr(2), [page(1, [row(1, CUT - 1), row(2, CUT)])]);
    expect(() => readCapture(addr(2), captureFile(addr(2), roots)!)).toThrow(
      SeedBlindError,
    );
    expect(() => kit.fills.readAccount(addr(2), roots)).toThrow(
      kit.fills.BlindStoreError,
    );
  });

  it("takes R8's completed file over R2's, and never looks in the holdout's folder", () => {
    const merged = path.join(roots.merged, `${addr(3)}.fills.jsonl.gz`);
    mkdirSync(roots.merged, { recursive: true });
    capture(roots, addr(3), [page(1, [row(1, T)])]);
    writeFileSync(
      merged,
      gzipSync(`${JSON.stringify(page(1, [row(1, T), row(2, T + 1)]))}\n`),
    );
    expect(captureFile(addr(3), roots)).toBe(merged);
    expect(readCapture(addr(3), merged).rows).toHaveLength(2);
    const holdout = path.join(
      roots.capture,
      "holdout",
      `${addr(4)}.fills.jsonl.gz`,
    );
    mkdirSync(path.dirname(holdout), { recursive: true });
    writeFileSync(holdout, gzipSync("{}\n"));
    expect(captureFile(addr(4), roots)).toBeNull();
  });

  it("is written once with a manifest, and each file is checked against it when loaded", () => {
    const dir = path.join(scratch, "seed");
    const built = buildSeed([addr(3), addr(1), addr(5)], roots, dir);
    expect(built).toEqual({
      accounts: 2,
      withoutFile: [addr(5)],
      rows: 7,
      dropped: 1,
    });
    const manifest = readManifest(
      readFileSync(path.join(dir, SEED_MANIFEST), "utf8"),
    );
    expect([...manifest.keys()]).toEqual([
      `${addr(1)}.json.gz`,
      `${addr(3)}.json.gz`,
    ]);
    expect(loadSeed(dir, manifest, addr(1))!.rows).toHaveLength(5);
    expect(loadSeed(dir, manifest, addr(5))).toBeNull();
    expect(() => buildSeed([addr(1)], roots, dir)).toThrow(/written once/);
    const file = path.join(dir, `${addr(3)}.json.gz`);
    const bytes = readFileSync(file);
    bytes[bytes.length - 5] = bytes[bytes.length - 5]! ^ 1;
    writeFileSync(file, bytes);
    expect(() => loadSeed(dir, manifest, addr(3))).toThrow(
      /differs from the manifest/,
    );
  });
});

/** A synthetic pre-cut panel file of `days` days before the cut, some minutes without a mark. */
function panelFile(iid: number, days: number): PanelFile {
  const start = CUT - days * DAY_MS;
  const n = days * 1_440;
  const marks = Array.from({ length: n }, (_, i) =>
    // A gap over the minutes before the 50th hour: a settlement without a mark.
    i % 97 === 5 || (i > 300 && i < 310) || (i >= 2_990 && i < 3_000)
      ? null
      : 100 + Math.sin(i) * 3,
  );
  const minute: number[] = [];
  const trades: number[] = [];
  const volume: number[] = [];
  for (let i = 0; i < n; i += 4) {
    minute.push(i);
    trades.push((i % 13) + 1);
    volume.push(0.5 + (i % 7) / 3);
  }
  const funding: [number, number, number][] = [];
  for (let h = start + HOUR_MS; h < CUT; h += HOUR_MS) {
    // One hour without a row; the 05:00Z hour stamped 46 s late.
    if (h === start + 7 * HOUR_MS) continue;
    funding.push([
      h,
      0.00001 * Math.cos(h / HOUR_MS),
      h + (new Date(h).getUTCHours() === 5 ? 46_000 : 50),
    ]);
  }
  return {
    iid,
    symbol: "X-USD",
    category: "crypto",
    start,
    end: CUT,
    firstTrade: start + 60_000,
    retired: null,
    marks,
    klines: { minute, trades, volume },
    funding,
  };
}

/** Every array and field of two market objects, bit for bit (NaN equal to NaN). */
function sameMarket(a: Market, b: Market): void {
  const plain = (m: Market) => ({
    ...m,
    marks: Array.from(m.marks),
    trades: Array.from(m.trades),
    volume: Array.from(m.volume),
    funding: {
      hour: Array.from(m.funding.hour),
      rate: Array.from(m.funding.rate),
      cum: Array.from(m.funding.cum),
      cumUnmarked: Array.from(m.funding.cumUnmarked),
    },
  });
  expect(plain(a)).toEqual(plain(b));
}

/** The panel's last `days` days, cut out as market-days, and the panel without them. */
function split(
  p: PanelFile,
  days: number,
): { head: PanelFile; tail: MarketDay[] } {
  const cutAt = p.end - days * DAY_MS;
  const cutIndex = (cutAt - p.start) / MINUTE_MS;
  const keep = p.klines.minute.map((m, k) => [m, k] as const);
  const head: PanelFile = {
    ...p,
    end: cutAt,
    marks: p.marks.slice(0, cutIndex),
    klines: {
      minute: keep.filter(([m]) => m < cutIndex).map(([m]) => m),
      trades: keep
        .filter(([m]) => m < cutIndex)
        .map(([, k]) => p.klines.trades[k]!),
      volume: keep
        .filter(([m]) => m < cutIndex)
        .map(([, k]) => p.klines.volume[k]!),
    },
    funding: p.funding.filter(([, , stamp]) => stamp < cutAt),
  };
  const tail: MarketDay[] = [];
  for (let d = 0; d < days; d += 1) {
    const day = cutAt + d * DAY_MS;
    const from = (day - p.start) / MINUTE_MS;
    const ks = keep.filter(([m]) => m >= from && m < from + 1_440);
    tail.push({
      iid: p.iid,
      day,
      marks: p.marks.slice(from, from + 1_440),
      klines: {
        minute: ks.map(([m]) => m - from),
        trades: ks.map(([, k]) => p.klines.trades[k]!),
        volume: ks.map(([, k]) => p.klines.volume[k]!),
      },
      funding: p.funding.filter(
        ([, , stamp]) => stamp >= day && stamp < day + DAY_MS,
      ),
    });
  }
  return { head, tail };
}

describe("the panel past the cut (R9)", () => {
  it("builds the kit's market object bit for bit from a pre-cut file", () => {
    const p = panelFile(6, 9);
    sameMarket(marketThrough(kit, p, CUT), kit.panel.marketFrom(p));
  });

  it("joins market-days to the pre-cut file so that the object is the one built from the whole", () => {
    const whole = panelFile(6, 9);
    const { head, tail } = split(whole, 2);
    const joined = joinDays(head, tail, CUT);
    expect(joined.end).toBe(CUT);
    sameMarket(marketThrough(kit, joined, CUT), kit.panel.marketFrom(whole));
  });

  it("stops at the first missing day and at the run's end, and refuses a panel or a funding row past the end", () => {
    const whole = panelFile(7, 6);
    const { head, tail } = split(whole, 3);
    expect(joinDays(head, [tail[0]!, tail[2]!], CUT).end).toBe(
      head.end + DAY_MS,
    );
    expect(joinDays(head, tail, head.end + 2 * DAY_MS).end).toBe(
      head.end + 2 * DAY_MS,
    );
    expect(() => marketThrough(kit, whole, CUT - DAY_MS)).toThrow(
      MarketEndError,
    );
    const late = {
      ...head,
      funding: [
        ...head.funding,
        [head.end - HOUR_MS, 0, head.end] as [number, number, number],
      ],
    };
    expect(() => marketThrough(kit, late, head.end)).toThrow(
      /stamped at or after the run's end/,
    );
    // The kit's own guard refuses any panel that ends after the cut.
    const past = joinDays(
      whole,
      [{ ...tail[0]!, day: CUT, funding: [] }],
      CUT + DAY_MS,
    );
    expect(past.end).toBe(CUT + DAY_MS);
    expect(() => kit.panel.marketFrom(past)).toThrow(kit.fills.BlindStoreError);
    expect(marketThrough(kit, past, CUT + DAY_MS).n).toBe(
      whole.marks.length + 1_440,
    );
  });
});
