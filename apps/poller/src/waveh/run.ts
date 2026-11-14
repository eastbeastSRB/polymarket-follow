/**
 * How WAVE-H runs (rules.md H0, H15): its settings, with no defaults; the
 * windows in which no heavy work runs (02:30–06:00Z and 10:25–11:15Z, the
 * other programs' runs); the hashes of the shared files it imports, logged
 * at each start (information, not a stop, as MARKET-1's M0).
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { DAY_MS, MINUTE_MS } from "../schedule.js";

const absolute = z
  .string()
  .refine((p) => path.isAbsolute(p), "not an absolute path");

/** WAVEH_STORE (the download's store, read only) and WAVEH_ROOT (the program's own files), neither inside the other. */
export const Settings = z
  .object({ WAVEH_STORE: absolute, WAVEH_ROOT: absolute })
  .refine(
    (s) => {
      const inside = (a: string, b: string) => {
        const rel = path.relative(b, a);
        return !rel.startsWith("..") && !path.isAbsolute(rel);
      };
      return (
        !inside(s.WAVEH_ROOT, s.WAVEH_STORE) &&
        !inside(s.WAVEH_STORE, s.WAVEH_ROOT)
      );
    },
    { message: "WAVEH_ROOT and WAVEH_STORE: one is inside the other" },
  );
export type Settings = z.infer<typeof Settings>;

/** The UTC minutes of the day in which WAVE-H starts no file: 02:30–06:00 and 10:25–11:15. */
export const WINDOWS: readonly (readonly [number, number])[] = [
  [150, 360],
  [625, 675],
];

/** The end of the window `now` falls in, or null. */
export function windowEnd(now: number): number | null {
  const day = Math.floor(now / DAY_MS) * DAY_MS;
  const minute = Math.floor((now - day) / MINUTE_MS);
  for (const [from, to] of WINDOWS)
    if (minute >= from && minute < to) return day + to * MINUTE_MS;
  return null;
}

/** The shared files the program imports, unfrozen (R4): their hashes for the run's log. */
export function sharedHashes(packageRoot: string): Record<string, string> {
  return Object.fromEntries(
    ["dist/schedule.js", "dist/log.js"].map((f) => [
      f,
      createHash("sha256")
        .update(readFileSync(path.join(packageRoot, f)))
        .digest("hex"),
    ]),
  );
}
