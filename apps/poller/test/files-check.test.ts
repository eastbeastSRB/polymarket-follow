/**
 * The round-trip check, broken on purpose: a compressor that adds one byte
 * must leave the plain file in place and no compressed file behind.
 */
import { existsSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Transform } from "node:stream";
import { describe, expect, it, vi } from "vitest";

vi.mock("node:zlib", async (importOriginal) => {
  const real = await importOriginal<typeof import("node:zlib")>();
  const createBrotliCompress = () => {
    const chunks: Buffer[] = [];
    return new Transform({
      transform(chunk: Buffer, _encoding, done) {
        chunks.push(chunk);
        done();
      },
      flush(done) {
        done(
          null,
          real.brotliCompressSync(Buffer.concat([...chunks, Buffer.from("x")])),
        );
      },
    });
  };
  return { ...real, default: { ...real, createBrotliCompress } };
});

const { compressHourFile } = await import("../src/store/files.js");

describe("compressHourFile", () => {
  it("keeps the plain file when the compressed one does not decompress to it", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "poller-check-"));
    const plain = path.join(dir, "book-13.jsonl");
    writeFileSync(plain, "1\ta\n2\tb\n");
    await expect(compressHourFile(plain)).rejects.toThrow(
      /does not decompress/,
    );
    expect(existsSync(plain)).toBe(true);
    expect(readdirSync(dir)).toEqual(["book-13.jsonl"]);
  });
});
