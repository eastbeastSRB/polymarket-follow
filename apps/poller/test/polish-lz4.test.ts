/**
 * The analyzer's LZ4 decoder (src/polish/lz4.ts), against lz4js's own
 * encoder and xxh32 (a devDependency, a separate implementation), and every
 * check broken on purpose in a frame built by hand.
 */
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { Xxh32, decodeAll, decodeFrame, xxh32 } from "../src/polish/lz4.js";

const require = createRequire(import.meta.url);
const lz4js = require("lz4js") as {
  compress: (src: Uint8Array) => Uint8Array;
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
const theirs = (b: Uint8Array) => lz4jsHash(0, b, 0, b.length);

const u32 = (n: number) => {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0);
  return b;
};
/** A text of fill-like lines: repetitive enough to compress. */
const text = (bytes: number) => {
  const lines: string[] = [];
  for (let i = 0, n = 0; n < bytes; i++) {
    const line = `["0x${(i * 7919).toString(16).padStart(40, "0")}",{"coin":"SOL","px":"${150 + (i % 97) / 100}","tid":${1e12 + i}}]\n`;
    lines.push(line);
    n += line.length;
  }
  return Buffer.from(lines.join("")).subarray(0, bytes);
};

/** A frame by hand: magic, FLG, BD, extra descriptor bytes, the header checksum (lz4js's xxh32), the blocks, the end mark, then `tail`. */
function frame(
  flg: number,
  bd: number,
  blocks: readonly Buffer[],
  opts: { extra?: Buffer; tail?: Buffer } = {},
) {
  const desc = Buffer.concat([
    Buffer.from([flg, bd]),
    opts.extra ?? Buffer.alloc(0),
  ]);
  return Buffer.concat([
    u32(0x184d2204),
    desc,
    Buffer.from([(theirs(desc) >>> 8) & 0xff]),
    ...blocks,
    u32(0),
    opts.tail ?? Buffer.alloc(0),
  ]);
}
const raw = (b: Buffer) => Buffer.concat([u32(0x80000000 + b.length), b]);
const compressed = (b: Buffer) => Buffer.concat([u32(b.length), b]);

/** Independent blocks of `size` bytes each, compressed by lz4js's block encoder with a fresh table each. */
function independent(content: Buffer, size: number): Buffer[] {
  const out: Buffer[] = [];
  for (let at = 0; at < content.length; at += size) {
    const chunk = content.subarray(at, at + size);
    const dst = new Uint8Array(chunk.length + 1024);
    const n = lz4js.compressBlock(
      chunk,
      dst,
      0,
      chunk.length,
      new Uint32Array(65536),
    );
    out.push(
      n === 0 || n >= chunk.length
        ? raw(Buffer.from(chunk))
        : compressed(Buffer.from(dst.subarray(0, n))),
    );
  }
  return out;
}

describe("xxh32", () => {
  it("gives the published values and lz4js's on every length, fed whole or in pieces", () => {
    expect(xxh32(Buffer.alloc(0))).toBe(0x02cc5d05);
    expect(xxh32(Buffer.from("abc"))).toBe(0x32d153ff);
    for (let n = 0; n <= 100; n++) {
      const b = randomBytes(n);
      expect(xxh32(b), `${n} bytes`).toBe(theirs(b));
    }
    const big = randomBytes(1_000_003);
    const x = new Xxh32();
    for (let at = 0; at < big.length;) {
      const step = 1 + Math.floor(Math.random() * 40);
      x.update(big, at, Math.min(big.length, at + step));
      at += step;
    }
    expect(x.digest()).toBe(theirs(big));
    expect(xxh32(big)).toBe(theirs(big));
  });
});

describe("decodeFrame", () => {
  it("decodes lz4js's frames of 0, 1, 1,000 and 3,000,000 bytes", () => {
    for (const n of [0, 1, 1_000, 3_000_000]) {
      const content = n === 1 ? Buffer.from("x") : text(n);
      expect(decodeAll(lz4js.compress(content)).equals(content), `${n}`).toBe(
        true,
      );
    }
  });

  it("decodes many independent blocks, each handed over on its own, with the content checksum", () => {
    const content = text(1_000_000);
    const blocks = independent(content, 65_536);
    expect(blocks.length).toBe(16);
    const sizes: number[] = [];
    const got: Buffer[] = [];
    const total = decodeFrame(
      frame(0x64, 0x40, blocks, { tail: u32(theirs(content)) }),
      (b) => {
        sizes.push(b.length);
        got.push(Buffer.from(b));
      },
    );
    expect(total).toBe(content.length);
    expect(Buffer.concat(got).equals(content)).toBe(true);
    expect(sizes.length).toBe(16);
    expect(Math.max(...sizes)).toBe(65_536);
  });

  it("reads a stored block and a content size that agrees", () => {
    const body = Buffer.from("abc\n");
    const size = Buffer.alloc(8);
    size.writeUInt32LE(4);
    expect(decodeAll(frame(0x60, 0x70, [raw(body)])).toString()).toBe("abc\n");
    expect(
      decodeAll(
        frame(0x6c, 0x70, [raw(body)], {
          extra: size,
          tail: u32(theirs(body)),
        }),
      ).toString(),
    ).toBe("abc\n");
    size.writeUInt32LE(5);
    expect(() =>
      decodeAll(frame(0x68, 0x70, [raw(body)], { extra: size })),
    ).toThrow("its header says 5");
  });

  it("refuses every frame it cannot vouch for", () => {
    const body = Buffer.from("abc\n");
    const good = frame(0x64, 0x70, [raw(body)], { tail: u32(theirs(body)) });
    expect(decodeAll(good).toString()).toBe("abc\n");
    const cases: [Buffer, string][] = [
      [Buffer.from("not a frame"), "not an LZ4 frame"],
      [frame(0xa4, 0x70, [raw(body)]), "another frame version"],
      [frame(0x66, 0x70, [raw(body)]), "reserved bits"],
      [frame(0x64, 0x71, [raw(body)]), "reserved bits"],
      [frame(0x74, 0x70, [raw(body)]), "block checksums"],
      [frame(0x65, 0x70, [raw(body)]), "a dictionary"],
      [frame(0x64, 0x30, [raw(body)]), "no such block maximum"],
      [
        Buffer.concat([
          good.subarray(0, 6),
          Buffer.from([good[6]! ^ 1]),
          good.subarray(7),
        ]),
        "header checksum",
      ],
      [
        frame(0x64, 0x70, [raw(body)], { tail: u32(theirs(body) ^ 1) }),
        "content checksum differs",
      ],
      [frame(0x64, 0x70, [raw(body)]), "content checksum is missing"],
      [Buffer.concat([good, Buffer.from([0])]), "ends at byte"],
      [Buffer.concat([good, good]), "ends at byte"],
      [good.subarray(0, good.length - 6), "ends inside the frame"],
      [
        frame(0x60, 0x40, [raw(Buffer.alloc(65_537))]),
        "above the block maximum",
      ],
      [
        Buffer.concat([
          frame(0x60, 0x70, []).subarray(0, 7),
          u32(100),
          Buffer.alloc(10),
        ]),
        "runs past the file",
      ],
    ];
    for (const [bytes, why] of cases)
      expect(() => decodeAll(bytes), why).toThrow(why);
  });

  it("refuses a block whose sequences misbehave, and a block that reaches into another", () => {
    const bad: [Buffer, string][] = [
      // 1 literal "a", then a match with offset 0.
      [Buffer.from([0x10, 0x61, 0, 0]), "reaches before its block"],
      // a match before any output.
      [Buffer.from([0x00, 1, 0]), "reaches before its block"],
      // 15+ literals whose length byte is missing.
      [Buffer.from([0xf0]), "literal length runs past"],
      // 3 literals announced, 1 present.
      [Buffer.from([0x30, 0x61]), "literals run past"],
      // a literal then half an offset.
      [Buffer.from([0x10, 0x61, 1]), "offset runs past"],
      // a match length of 15+ whose next byte is missing.
      [Buffer.from([0x1f, 0x61, 1, 0]), "match length runs past"],
    ];
    for (const [block, why] of bad)
      expect(
        () => decodeAll(frame(0x60, 0x70, [compressed(block)])),
        why,
      ).toThrow(why);
    // 64 KB blocks: a match of 15 + 258 × 255 + 4 bytes, past the block maximum.
    expect(() =>
      decodeAll(
        frame(0x60, 0x40, [
          compressed(
            Buffer.from([0x1f, 0x61, 1, 0, ...Array<number>(258).fill(255), 0]),
          ),
        ]),
      ),
    ).toThrow("past the block maximum");
    // Linked blocks: the second block's match reaches into the first.
    expect(() =>
      decodeAll(
        frame(0x40, 0x70, [
          compressed(Buffer.from([0x40, 0x61, 0x62, 0x63, 0x64])),
          compressed(Buffer.from([0x10, 0x65, 3, 0, 0x00])),
        ]),
      ),
    ).toThrow("reaches before its block");
    // An overlapping match (offset 1, length 8) repeats the last byte.
    expect(
      decodeAll(
        frame(0x60, 0x70, [
          compressed(Buffer.from([0x14, 0x61, 1, 0, 0x10, 0x62])),
        ]),
      ).toString(),
    ).toBe("aaaaaaaaab");
  });
});
