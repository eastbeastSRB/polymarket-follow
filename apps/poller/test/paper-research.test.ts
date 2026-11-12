import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  KIT_FINGERPRINT,
  RESEARCH_ROOT,
  loadResearch,
} from "../src/paper/research.js";

const scratch = mkdtempSync(path.join(tmpdir(), "paper-research-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

/** A copy of the vendored files with `change` applied: a fresh folder, so a fresh module URL. */
function changedCopy(name: string, change: (root: string) => void): string {
  const root = path.join(scratch, name);
  cpSync(RESEARCH_ROOT, root, { recursive: true });
  change(root);
  return root;
}

function flipOneByte(file: string): void {
  const bytes = readFileSync(file);
  bytes[100] = bytes[100]! ^ 1;
  writeFileSync(file, bytes);
}

describe("the vendored research files", () => {
  it("load from the repository's copy with the pinned kit fingerprint and lib-exits hash", async () => {
    const r = await loadResearch();
    expect(r.fingerprint).toBe(KIT_FINGERPRINT);
    expect(r.constants.CUT).toBe(Date.parse("2026-11-07T00:00:00Z"));
    expect(typeof r.exits.priceCopy).toBe("function");
    expect(r.exits.OPEN_EPS).toBe(1e-12);
  });

  it("refuse one changed byte in a kit file", async () => {
    const root = changedCopy("kit-byte", (r) =>
      flipOneByte(path.join(r, "kit", "entries.mjs")),
    );
    await expect(loadResearch(root)).rejects.toThrow(
      /differs from its fingerprint:\n {2}changed: entries\.mjs/,
    );
  });

  it("refuse a file the kit's fingerprint does not list", async () => {
    const root = changedCopy("kit-extra", (r) =>
      writeFileSync(path.join(r, "kit", "desktop.ini"), "x"),
    );
    await expect(loadResearch(root)).rejects.toThrow(
      /not in the fingerprint: desktop\.ini/,
    );
  });

  it("refuse one changed byte in lib-exits", async () => {
    const root = changedCopy("exits-byte", (r) =>
      flipOneByte(path.join(r, "find-6-exits", "lib-exits.mjs")),
    );
    await expect(loadResearch(root)).rejects.toThrow(
      /lib-exits\.mjs: SHA-256 [0-9a-f]{64} is not the pinned/,
    );
  });
});
