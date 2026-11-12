/**
 * The seed as the run loads it (the plan's R3, with its review's F10): each
 * pool account's fills before the cut, `<addr>.json.gz` in the experiment's
 * `seed` folder, checked against the frozen copy of its manifest
 * (`experiment/seed.sha256`) when it is loaded. It was written once, outside
 * the program, by `scripts/paper-seed.ts` (the kit's `readAccount` with ids
 * kept as their text).
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { z } from "zod";
import { FillRow } from "./routes.js";

const sha256 = (bytes: Buffer): string =>
  createHash("sha256").update(bytes).digest("hex");

export const SeedAccount = z.object({
  addr: z.string().regex(/^0x[0-9a-f]{40}$/),
  pages: z.number().int(),
  truncated: z.boolean(),
  rows: z.array(FillRow),
  /** Rows that failed the check, as the kit's `dropped`. */
  dropped: z.number().int(),
});
export type SeedAccount = z.infer<typeof SeedAccount>;

/** `name -> sha256` of a manifest in sha256sum's format. */
export function readManifest(text: string): Map<string, string> {
  const want = new Map<string, string>();
  for (const line of text.split("\n")) {
    const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
    if (m) want.set(m[2]!, m[1]!);
  }
  return want;
}

/** An account's seed, checked against the frozen manifest; null when the manifest lists none for it. */
export function loadSeed(
  seedDir: string,
  manifest: ReadonlyMap<string, string>,
  addr: string,
): SeedAccount | null {
  const name = `${addr}.json.gz`;
  const want = manifest.get(name);
  if (want === undefined) return null;
  const bytes = readFileSync(path.join(seedDir, name));
  const got = sha256(bytes);
  if (got !== want) {
    throw new Error(
      `seed ${name}: SHA-256 ${got} differs from the manifest's ${want}`,
    );
  }
  const seed = SeedAccount.parse(
    JSON.parse(gunzipSync(bytes).toString("utf8")),
  );
  if (seed.addr !== addr) throw new Error(`seed ${name} holds ${seed.addr}`);
  return seed;
}
