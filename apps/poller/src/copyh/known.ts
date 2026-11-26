/**
 * `copyh/known.json` as the `reproduce` command reads it (C15 (a); the
 * supervisor's ruling, 2026-11-26): the reproduction's known sets and
 * answers, frozen with `copyh/`. A file missing, not JSON or not of its form
 * (reproduce.ts's `Known`) fails the check (exit 6), never guessed.
 */
import { readFileSync } from "node:fs";
import { Known, ReproError } from "./reproduce.js";

/** The file's bytes (for repro.json's identity) and its known sets. */
export function knownOf(file: string): { bytes: Buffer; known: Known } {
  let bytes: Buffer;
  let json: unknown;
  try {
    bytes = readFileSync(file);
    json = JSON.parse(bytes.toString("utf8"));
  } catch (err) {
    throw new ReproError(`${file}: ${(err as Error).message}`);
  }
  const parsed = Known.safeParse(json);
  if (!parsed.success)
    throw new ReproError(
      `${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  return { bytes, known: parsed.data };
}
