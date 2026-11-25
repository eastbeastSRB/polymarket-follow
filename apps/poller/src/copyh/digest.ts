/**
 * The integrity's row digest (copyh/rules.md C15, step 1, 3: the sample days
 * re-read cell by cell). Both sides of the comparison — the store's rows
 * (integrity.ts) and the independent re-reader's (reread.ts) — give each kept
 * row's every cell in one canonical form: the account's address, `time`,
 * iid, `px`, `sz`, side, `startPosition`, `oid` and `tid` as whole numbers,
 * the flags, the `dir` and the liquidation method as text, and the input
 * file's index. A row's SHA-256 is added lane by lane (eight 32-bit lanes,
 * each modulo 2^32) into its file's digest, so that the digest is the same
 * whatever order the rows come in: the store's by bucket and account, the
 * re-reader's by line. Any cell that differs changes the row's hash.
 */
import { hash } from "node:crypto";

/** One kept row's cells, as both sides give them. */
export type RowCells = {
  /** 0x and 40 lower-case hex digits. */
  user: string;
  time: number;
  iid: number;
  px: number;
  sz: number;
  /** +1 "B", −1 "A". */
  side: number;
  startPosition: number;
  oid: bigint;
  tid: bigint;
  flags: number;
  dir: string;
  /** null when the record has no liquidation. */
  method: string | null;
  file: number;
};

const FIXED = 20 + 8 + 2 + 8 + 8 + 1 + 8 + 8 + 8 + 1 + 2;

/** A row's canonical bytes. */
export function rowBytes(r: RowCells): Buffer {
  const dir = Buffer.from(r.dir, "utf8");
  const method = Buffer.from(r.method ?? "", "utf8");
  const b = Buffer.alloc(FIXED + dir.length + 1 + method.length + 2);
  let at = b.write(r.user.slice(2), 0, "hex");
  at = b.writeDoubleLE(r.time, at);
  at = b.writeUInt16LE(r.iid, at);
  at = b.writeDoubleLE(r.px, at);
  at = b.writeDoubleLE(r.sz, at);
  at = b.writeInt8(r.side, at);
  at = b.writeDoubleLE(r.startPosition, at);
  at = b.writeBigUInt64LE(r.oid, at);
  at = b.writeBigUInt64LE(r.tid, at);
  at = b.writeUInt8(r.flags, at);
  at = b.writeUInt16LE(r.file, at);
  at += dir.copy(b, at);
  // A separator, then whether a method exists, so that "" and none differ.
  at = b.writeUInt8(0, at);
  at += method.copy(b, at);
  b.writeUInt8(0, at);
  b.writeUInt8(r.method === null ? 0 : 1, at + 1);
  return b;
}

/** A file's rows: their count and their digest's eight lanes. */
export class Digest {
  count = 0;
  readonly lanes = new Uint32Array(8);

  add(r: RowCells): void {
    const h = hash("sha256", rowBytes(r), "buffer");
    for (let k = 0; k < 8; k++)
      this.lanes[k] = (this.lanes[k]! + h.readUInt32LE(4 * k)) >>> 0;
    this.count += 1;
  }

  /** Another part of the same file's rows (a unit's), added. */
  merge(count: number, hex: string): void {
    const b = Buffer.from(hex, "hex");
    for (let k = 0; k < 8; k++)
      this.lanes[k] = (this.lanes[k]! + b.readUInt32LE(4 * k)) >>> 0;
    this.count += count;
  }

  hex(): string {
    return Buffer.from(this.lanes.buffer).toString("hex");
  }
}

/** A u64 from its two u32 halves, low first (the store's form). */
export const u64From = (lo: number, hi: number): bigint =>
  (BigInt(hi) << 32n) | BigInt(lo);
