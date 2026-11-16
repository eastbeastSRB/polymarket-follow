/**
 * The archive's decoder (R4): lz4js 0.2.0, a devDependency, its three files'
 * SHA-256 checked before it loads (a difference is a crash) and listed in
 * WAVE-H's freeze. lz4js decodes one frame and checks no LZ4 checksum, so a
 * file is decoded only when its one frame ends at the file's end; the
 * store's SHA-256 is the integrity, and every decoded line must parse.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const LZ4JS_SHA256: Readonly<Record<string, string>> = {
  "lz4.js": "16a1df1eb50e74c1cbb0c4f4e947385b4918910a8081cd4bac90318b1052f2bb",
  "util.js": "7932a139124a291b71a073228e2651720c5cf0c83cfb4a52fc5eff0b8b5c0e18",
  "xxh32.js":
    "a9cf1e92ce4c3d837c118faae2a0c689c000477422d582c8bcb4fc800bddb130",
};

type Lz4js = {
  decompressFrame: (src: Uint8Array, dst: Uint8Array) => number;
};

const require = createRequire(import.meta.url);
/** lz4js's folder, as Node resolves the package from here. */
export const LZ4JS_DIR = path.dirname(require.resolve("lz4js"));

/** Checks lz4js's three files against their pinned hashes, then loads it; throws on any difference. */
export function loadLz4js(dir = LZ4JS_DIR): Lz4js {
  for (const [file, want] of Object.entries(LZ4JS_SHA256)) {
    const got = createHash("sha256")
      .update(readFileSync(path.join(dir, file)))
      .digest("hex");
    if (got !== want)
      throw new Error(
        `lz4js ${file}: SHA-256 ${got} is not the pinned ${want}`,
      );
  }
  return require(path.join(dir, "lz4.js")) as Lz4js;
}

let pinned: Lz4js | null = null;

const BLOCK_MAX = new Map([
  [4, 65_536],
  [5, 262_144],
  [6, 1_048_576],
  [7, 4_194_304],
]);

/**
 * The frame that starts `src`, walked by its block headers with nothing
 * decoded: where it ends, the most its blocks can hold, and its content size
 * when the frame states one. A frame lz4js cannot read throws: another
 * version, a dictionary, or block checksums (lz4js 0.2.0 skips 4 bytes before
 * a block's data, where the format puts the checksum after it); so does a
 * frame cut short.
 */
export function frameOf(src: Uint8Array): {
  end: number;
  maxSize: number;
  contentSize: number | null;
} {
  const u32 = (i: number) =>
    (src[i]! | (src[i + 1]! << 8) | (src[i + 2]! << 16)) +
    src[i + 3]! * 2 ** 24;
  if (src.length < 7 || u32(0) !== 0x184d2204)
    throw new Error("not an LZ4 frame");
  const flg = src[4]!;
  const blockMax = BLOCK_MAX.get((src[5]! >> 4) & 7);
  if (flg >> 6 !== 1 || (flg & 0x11) !== 0 || blockMax === undefined)
    throw new Error("an LZ4 frame lz4js cannot read");
  let i = 6;
  let contentSize: number | null = null;
  if (flg & 8) {
    contentSize = u32(i) + u32(i + 4) * 2 ** 32;
    i += 8;
  }
  i += 1;
  let maxSize = 0;
  for (;;) {
    if (i + 4 > src.length) throw new Error("the LZ4 frame is cut short");
    const word = u32(i);
    i += 4;
    if (word === 0) break;
    const size = word % 2 ** 31;
    maxSize += word >= 2 ** 31 ? size : blockMax;
    i += size;
    if (i > src.length) throw new Error("the LZ4 frame is cut short");
  }
  return { end: i + (flg & 4 ? 4 : 0), maxSize, contentSize };
}

/** The bytes of a file holding exactly one LZ4 frame, decoded. */
export function decodeLz4(src: Uint8Array): Uint8Array {
  const frame = frameOf(src);
  if (frame.end !== src.length)
    throw new Error(`the LZ4 frame ends at byte ${frame.end} of ${src.length}`);
  pinned ??= loadLz4js();
  const dst = new Uint8Array(frame.maxSize);
  const size = pinned.decompressFrame(src, dst);
  if (size > frame.maxSize)
    throw new Error(
      `the LZ4 frame decodes past its blocks' ${frame.maxSize} bytes`,
    );
  if (frame.contentSize !== null && size !== frame.contentSize)
    throw new Error(
      `the LZ4 frame decodes to ${size} bytes, its header says ${frame.contentSize}`,
    );
  return dst.subarray(0, size);
}
