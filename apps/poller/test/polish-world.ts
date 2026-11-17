/**
 * Synthetic archive text for the analyzer's tests: fill records in
 * Hyperliquid's key order, `node_fills_by_block` lines, and LZ4 frames of
 * independent blocks (lz4js's block encoder, a fresh table a block, its own
 * xxh32), so a file can span many blocks.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const lz4js = require("lz4js") as {
  compressBlock: (
    src: Uint8Array,
    dst: Uint8Array,
    sIndex: number,
    sLength: number,
    hashTable: Uint32Array,
  ) => number;
};
const lz4jsHash = (
  require("lz4js/xxh32.js") as {
    hash: (seed: number, src: Uint8Array, index: number, len: number) => number;
  }
).hash;

const u32 = (n: number) => {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0);
  return b;
};

/** `content` as one LZ4 frame of independent blocks of `blockSize` bytes (65,536 or more), with its content checksum. */
export function frameOf(content: Buffer, blockSize = 65_536): Buffer {
  const bd = { 65536: 0x40, 262144: 0x50, 1048576: 0x60, 4194304: 0x70 }[
    blockSize
  ];
  if (bd === undefined) throw new Error(`no block size ${blockSize}`);
  const desc = Buffer.from([0x64, bd]);
  const blocks: Buffer[] = [];
  for (let at = 0; at < content.length; at += blockSize) {
    const chunk = content.subarray(at, at + blockSize);
    const dst = new Uint8Array(chunk.length + 1024);
    const n = lz4js.compressBlock(
      chunk,
      dst,
      0,
      chunk.length,
      new Uint32Array(65536),
    );
    blocks.push(
      n === 0 || n >= chunk.length
        ? Buffer.concat([u32(0x80000000 + chunk.length), chunk])
        : Buffer.concat([u32(n), Buffer.from(dst.subarray(0, n))]),
    );
  }
  return Buffer.concat([
    u32(0x184d2204),
    desc,
    Buffer.from([(lz4jsHash(0, desc, 0, 2) >>> 8) & 0xff]),
    ...blocks,
    u32(0),
    u32(lz4jsHash(0, content, 0, content.length)),
  ]);
}

export const addr = (n: number) => `0x${n.toString(16).padStart(40, "0")}`;

export type FillSpec = {
  coin: string;
  px?: string;
  sz?: string;
  side: "A" | "B";
  time: number;
  startPosition?: string;
  dir?: string;
  closedPnl?: string;
  oid?: number | string;
  crossed: boolean;
  fee?: string;
  /** A number, or digits written as they are (above 2^53). */
  tid: number | string;
  feeToken?: string;
  cloid?: string;
  builderFee?: string;
  liquidation?: { liquidatedUser?: string; markPx: string; method: string };
};

/** A record `[user, fill]` as the archive writes it: compact, the fill's keys in Hyperliquid's order, ids as digits. */
export function record(user: string, f: FillSpec): string {
  const fill: Record<string, unknown> = {
    coin: f.coin,
    px: f.px ?? "100.5",
    sz: f.sz ?? "2.0",
    side: f.side,
    time: f.time,
    startPosition: f.startPosition ?? "0.0",
    dir: f.dir ?? "Open Long",
    closedPnl: f.closedPnl ?? "0.0",
    hash: "0x00",
    oid: "@OID@",
    crossed: f.crossed,
    fee: f.fee ?? "0.009",
    tid: "@TID@",
    feeToken: f.feeToken ?? "USDC",
  };
  if (f.cloid !== undefined) fill.cloid = f.cloid;
  if (f.builderFee !== undefined) fill.builderFee = f.builderFee;
  if (f.liquidation !== undefined) fill.liquidation = f.liquidation;
  return JSON.stringify([user, fill])
    .replace('"@OID@"', String(f.oid ?? 7))
    .replace('"@TID@"', String(f.tid));
}

/** A taker's record and its maker's: one trade, one `tid`. */
export function trade(
  taker: string,
  maker: string,
  f: Omit<FillSpec, "crossed">,
): [string, string] {
  return [
    record(taker, { ...f, crossed: true }),
    record(maker, { ...f, side: f.side === "B" ? "A" : "B", crossed: false }),
  ];
}

/** A `node_fills_by_block` line. */
export const byBlock = (n: number, records: readonly string[]) =>
  `{"local_time":"2025-09-15T14:00:00.093897290","block_time":"2025-09-15T13:59:59.915723222","block_number":${n},"events":[${records.join(",")}]}`;
