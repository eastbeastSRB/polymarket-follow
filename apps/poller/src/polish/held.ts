/**
 * A raw store file, read as WAVE-H reads one (rules.md H2): the seal first,
 * before anything is opened, then the file, then its SHA-256 against its
 * list's line. A file missing, unlisted or differing is a StoreError.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { StoreError } from "../waveh/store.js";
import { checkKey, checkPath } from "./seal.js";

export function readHeld(
  store: string,
  key: string,
  sha256: string | undefined,
): Buffer {
  const file = path.join(store, ...key.split("/"));
  checkPath(file);
  checkKey(key);
  if (sha256 === undefined) throw new StoreError(`${key}: not in the list`);
  let bytes: Buffer;
  try {
    bytes = readFileSync(file);
  } catch (err) {
    throw new StoreError(
      `${key}: ${(err as NodeJS.ErrnoException).code ?? String(err)}`,
    );
  }
  const got = createHash("sha256").update(bytes).digest("hex");
  if (got !== sha256)
    throw new StoreError(`${key}: SHA-256 ${got}, the list's ${sha256}`);
  return bytes;
}
