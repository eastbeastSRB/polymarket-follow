/**
 * The archive's LZ4 frames, decoded one block at a time (WAVE-H-LOOK-REVIEW's
 * decoder, `scripts/lz4.cjs`, ported; decisions 2026-11-17, the polishing
 * plan approved, 4.2). It checks the magic number, the version and reserved
 * bits, the header checksum, every block's size and back-references, and the
 * content size and checksum when the frame states them (its own xxh32); the
 * file must be one frame that ends at its last byte. A frame with block
 * checksums or a dictionary is refused, and so is a back-reference before its
 * own block's start: a frame of linked blocks decodes only when no block
 * reaches into another (the archive's frames are independent blocks).
 */

const MAGIC = 0x184d2204;
/** The block maximum by the descriptor's code (BD bits 4–6). */
const BLOCK_MAX = new Map([
  [4, 65_536],
  [5, 262_144],
  [6, 1_048_576],
  [7, 4_194_304],
]);

const P1 = 2654435761;
const P2 = 2246822519;
const P3 = 3266489917;
const P4 = 668265263;
const P5 = 374761393;

const rotl = (x: number, r: number) => ((x << r) | (x >>> (32 - r))) >>> 0;
const u32 = (b: Uint8Array, i: number) =>
  (b[i]! | (b[i + 1]! << 8) | (b[i + 2]! << 16) | (b[i + 3]! << 24)) >>> 0;

/** xxh32 with seed 0, fed in pieces. */
export class Xxh32 {
  private v1 = (P1 + P2) >>> 0;
  private v2 = P2;
  private v3 = 0;
  private v4 = (0 - P1) >>> 0;
  private total = 0;
  private readonly mem = new Uint8Array(16);
  private memSize = 0;

  private round(b: Uint8Array, p: number): void {
    const lane = (v: number, i: number) =>
      Math.imul(rotl((v + Math.imul(u32(b, i), P2)) >>> 0, 13), P1) >>> 0;
    this.v1 = lane(this.v1, p);
    this.v2 = lane(this.v2, p + 4);
    this.v3 = lane(this.v3, p + 8);
    this.v4 = lane(this.v4, p + 12);
  }

  update(b: Uint8Array, start = 0, end = b.length): void {
    this.total += end - start;
    let p = start;
    if (this.memSize + (end - start) < 16) {
      this.mem.set(b.subarray(start, end), this.memSize);
      this.memSize += end - start;
      return;
    }
    if (this.memSize > 0) {
      const need = 16 - this.memSize;
      this.mem.set(b.subarray(p, p + need), this.memSize);
      p += need;
      this.round(this.mem, 0);
      this.memSize = 0;
    }
    for (; p + 16 <= end; p += 16) this.round(b, p);
    if (p < end) {
      this.mem.set(b.subarray(p, end));
      this.memSize = end - p;
    }
  }

  digest(): number {
    let h =
      this.total >= 16
        ? (rotl(this.v1, 1) +
            rotl(this.v2, 7) +
            rotl(this.v3, 12) +
            rotl(this.v4, 18)) >>>
          0
        : P5;
    h = (h + this.total) >>> 0;
    let p = 0;
    for (; p + 4 <= this.memSize; p += 4)
      h =
        Math.imul(rotl((h + Math.imul(u32(this.mem, p), P3)) >>> 0, 17), P4) >>>
        0;
    for (; p < this.memSize; p++)
      h =
        Math.imul(rotl((h + Math.imul(this.mem[p]!, P5)) >>> 0, 11), P1) >>> 0;
    h = Math.imul(h ^ (h >>> 15), P2) >>> 0;
    h = Math.imul(h ^ (h >>> 13), P3) >>> 0;
    return (h ^ (h >>> 16)) >>> 0;
  }
}

export function xxh32(b: Uint8Array): number {
  const x = new Xxh32();
  x.update(b);
  return x.digest();
}

/** One block's sequences, src[sp, end), into out from 0; its output's length. */
function decodeBlock(
  src: Uint8Array,
  sp: number,
  end: number,
  out: Uint8Array,
  max: number,
): number {
  let op = 0;
  while (sp < end) {
    const token = src[sp++]!;
    let literals = token >>> 4;
    if (literals === 15) {
      let b: number;
      do {
        if (sp >= end)
          throw new Error("lz4: a literal length runs past its block");
        b = src[sp++]!;
        literals += b;
      } while (b === 255);
    }
    if (sp + literals > end)
      throw new Error("lz4: literals run past their block");
    if (op + literals > max)
      throw new Error("lz4: a block decodes past the block maximum");
    if (literals < 32)
      for (let i = 0; i < literals; i++) out[op + i] = src[sp + i]!;
    else out.set(src.subarray(sp, sp + literals), op);
    sp += literals;
    op += literals;
    if (sp === end) break;
    if (sp + 2 > end) throw new Error("lz4: an offset runs past its block");
    const offset = src[sp]! | (src[sp + 1]! << 8);
    sp += 2;
    if (offset === 0 || offset > op)
      throw new Error("lz4: a match reaches before its block");
    let length = token & 15;
    if (length === 15) {
      let b: number;
      do {
        if (sp >= end)
          throw new Error("lz4: a match length runs past its block");
        b = src[sp++]!;
        length += b;
      } while (b === 255);
    }
    length += 4;
    if (op + length > max)
      throw new Error("lz4: a block decodes past the block maximum");
    let from = op - offset;
    if (offset >= length && length >= 32) {
      out.copyWithin(op, from, from + length);
      op += length;
    } else {
      const stop = op + length;
      while (op < stop) out[op++] = out[from++]!;
    }
  }
  return op;
}

/**
 * Decodes a file of one LZ4 frame, handing each block's output to `onBlock`
 * (a view of one reused buffer: copy what you keep); returns the bytes
 * decoded. Any check that fails throws.
 */
export function decodeFrame(
  src: Uint8Array,
  onBlock: (block: Uint8Array) => void,
): number {
  if (src.length < 7 || u32(src, 0) !== MAGIC)
    throw new Error("lz4: not an LZ4 frame");
  const flg = src[4]!;
  const bd = src[5]!;
  if (flg >> 6 !== 1) throw new Error("lz4: another frame version");
  if ((flg & 0x02) !== 0 || (bd & 0x8f) !== 0)
    throw new Error("lz4: reserved bits set");
  if (flg & 0x10) throw new Error("lz4: block checksums are not read");
  if (flg & 0x01) throw new Error("lz4: a dictionary is not read");
  const max = BLOCK_MAX.get((bd >> 4) & 7);
  if (max === undefined) throw new Error("lz4: no such block maximum");
  let p = 6;
  let contentSize: number | null = null;
  if (flg & 0x08) {
    if (p + 8 > src.length)
      throw new Error("lz4: the header runs past the file");
    contentSize = u32(src, p) + u32(src, p + 4) * 2 ** 32;
    p += 8;
  }
  if (p >= src.length) throw new Error("lz4: the header runs past the file");
  if (src[p] !== ((xxh32(src.subarray(4, p)) >>> 8) & 0xff))
    throw new Error("lz4: the header checksum differs");
  p += 1;
  const out = new Uint8Array(max);
  const content = flg & 0x04 ? new Xxh32() : null;
  let total = 0;
  for (;;) {
    if (p + 4 > src.length)
      throw new Error("lz4: the file ends inside the frame");
    const word = u32(src, p);
    p += 4;
    if (word === 0) break;
    const size = word & 0x7fffffff;
    if (size > max) throw new Error("lz4: a block above the block maximum");
    if (p + size > src.length)
      throw new Error("lz4: a block runs past the file");
    let length = size;
    if (word >= 0x80000000) out.set(src.subarray(p, p + size));
    else length = decodeBlock(src, p, p + size, out, max);
    p += size;
    const block = out.subarray(0, length);
    content?.update(block);
    total += length;
    onBlock(block);
  }
  if (contentSize !== null && contentSize !== total)
    throw new Error(
      `lz4: the frame decodes to ${total} bytes, its header says ${contentSize}`,
    );
  if (content !== null) {
    if (p + 4 > src.length)
      throw new Error("lz4: the content checksum is missing");
    if (content.digest() !== u32(src, p))
      throw new Error("lz4: the content checksum differs");
    p += 4;
  }
  if (p !== src.length)
    throw new Error(`lz4: the frame ends at byte ${p} of ${src.length}`);
  return total;
}

/** A small file's whole output (a day of `asset_ctxs`, a test's frame). */
export function decodeAll(src: Uint8Array): Buffer {
  const parts: Buffer[] = [];
  decodeFrame(src, (block) => parts.push(Buffer.from(block)));
  return Buffer.concat(parts);
}
