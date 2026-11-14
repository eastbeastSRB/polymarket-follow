/**
 * Synthetic WAVE-H stores for the tests: files by key, lz4-compressed by
 * lz4js's own encoder (funding replies plain), with the download's
 * manifest; liquidation and taker records in Hyperliquid's shape; book
 * snapshots; `asset_ctxs` rows.
 */
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { HOUR_MS } from "../src/schedule.js";
import { DATA_END, SIZING_START, TEST_START } from "../src/waveh/instants.js";
import { fillKeys } from "../src/waveh/store.js";

export const lz4js = createRequire(import.meta.url)("lz4js") as {
  compress: (src: Uint8Array) => Uint8Array;
};
export const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
export const lz4 = (text: string) =>
  Buffer.from(lz4js.compress(Buffer.from(text)));

/** Folders the tests made; `cleanScratch` (after each test) removes them. */
export const scratch: string[] = [];
export const cleanScratch = () => {
  for (const d of scratch.splice(0))
    rmSync(d, { recursive: true, force: true });
};

/** A store: files by key, each lz4-compressed (or plain for funding), with the manifest; every fill file of SIZING (or to DATA END) present. */
export function makeStore(
  files: Map<string, string>,
  everyFillFile: boolean | "to DATA END" = true,
) {
  const store = mkdtempSync(path.join(tmpdir(), "waveh-store-"));
  scratch.push(store);
  const empty = Buffer.from(lz4js.compress(new Uint8Array(0)));
  const lines: string[] = [];
  const put = (key: string, bytes: Buffer) => {
    const file = path.join(store, ...key.split("/"));
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, bytes);
    lines.push(
      JSON.stringify({ key, bytes: bytes.length, sha256: sha(bytes) }),
    );
  };
  for (const [key, text] of files)
    put(key, key.endsWith(".json") ? Buffer.from(text) : lz4(text));
  if (everyFillFile !== false)
    for (const key of fillKeys(
      SIZING_START,
      everyFillFile === true ? TEST_START : DATA_END + HOUR_MS,
    ))
      if (!files.has(key)) put(key, empty);
  writeFileSync(path.join(store, "manifest.jsonl"), `${lines.join("\n")}\n`);
  return { store, put };
}

export const addr = (n: number) => `0x${n.toString(16).padStart(40, "0")}`;
export const dayOf = (t: number) =>
  new Date(t).toISOString().slice(0, 10).replaceAll("-", "");
export const fillKey = (t: number, format = "node_fills") =>
  `${format}/hourly/${dayOf(t)}/${new Date(t).getUTCHours()}.lz4`;

/** A liquidated account's own taker leg and the maker's, as `node_fills` lines. */
export function liquidation(
  user: number,
  coin: string,
  side: "A" | "B",
  t: number,
  tid: number,
) {
  const liq = { liquidatedUser: addr(user), markPx: "100", method: "market" };
  const fill = (u: string, s: string, start: string, crossed: boolean) =>
    JSON.stringify([
      u,
      {
        coin,
        px: "100",
        sz: "1",
        side: s,
        time: t,
        startPosition: start,
        crossed,
        fee: "0.045",
        tid,
        liquidation: liq,
      },
    ]);
  return [
    fill(addr(user), side, side === "A" ? "1.0" : "-1.0", true),
    fill(
      addr(999),
      side === "A" ? "B" : "A",
      side === "A" ? "-5.0" : "5.0",
      false,
    ),
  ];
}

/** A taker's fill on `side`, no liquidation. */
export const taker = (
  coin: string,
  side: "A" | "B",
  t: number,
  px: string,
  sz: string,
  tid: number,
) =>
  JSON.stringify([
    addr(500 + tid),
    {
      coin,
      px,
      sz,
      side,
      time: t,
      startPosition: "0.0",
      crossed: true,
      fee: "0.01",
      tid,
    },
  ]);

/** A `node_fills_by_block` line holding the records of `lines`. */
export const block = (n: number, lines: readonly string[]) =>
  JSON.stringify({
    block_number: n,
    events: lines.map((l) => JSON.parse(l) as unknown),
  });

/** A book snapshot line: one level a side, 99.9 bid and 100.1 ask, 1,000 each. */
export const snapshot = (coin: string, t: number) =>
  JSON.stringify({
    time: "x",
    raw: {
      channel: "l2Book",
      data: {
        coin,
        time: t,
        levels: [
          [{ px: "99.9", sz: "1000", n: 1 }],
          [{ px: "100.1", sz: "1000", n: 1 }],
        ],
      },
    },
  });

export const CTXS_HEAD =
  "time,coin,funding,open_interest,prev_day_px,day_ntl_vlm,premium,oracle_px,mark_px,mid_px,impact_bid_px,impact_ask_px";
/** An `asset_ctxs` row of a coin stamped t with its mark. */
export const ctxsRow = (coin: string, t: number, mark: number) =>
  `${new Date(t).toISOString().replace(".000Z", "Z")},${coin},0,1,1,1,0,1,${mark},1,1,1`;
