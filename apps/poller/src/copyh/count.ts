/**
 * A counting pass's totals (copyh/rules.md C15 (c) 1; the burn-in's counts,
 * the supervisor's answer 2): from each file's count file, the records by
 * class; every `dir` value of the main-dex-shaped records in the window,
 * exactly as written, with its count, from which `dirs.json` is ruled; the
 * taker records by `dir` and liquidation method; the values outside the
 * lists; the coins kept (their count, first and last time, first Settlement);
 * the vault accounts; the slow path and the misreadings; the records by UTC
 * day; and the holes of the union of every file's records (holes.ts).
 */
import { holesOf } from "./holes.js";
import type { CountFile } from "./pass.js";

/** Pairs summed by key, sorted by key. */
function summed(
  lists: Iterable<readonly (readonly [string, number])[]>,
): [string, number][] {
  const m = new Map<string, number>();
  for (const l of lists) for (const [k, v] of l) m.set(k, (m.get(k) ?? 0) + v);
  return [...m].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}

export function countsOf(
  files: readonly CountFile[],
  window: { start: number; end: number },
) {
  const classes: Record<string, number> = {};
  const sum = (f: (c: CountFile) => number) =>
    files.reduce((s, c) => s + f(c), 0);
  for (const c of files)
    for (const [k, v] of Object.entries(c.scan.classes))
      classes[k] = (classes[k] ?? 0) + v;
  const coins = new Map<number, [number, number, number, number]>();
  for (const c of files)
    for (const [iid, n, first, last, settled] of c.scan.coins) {
      const x = coins.get(iid);
      if (x === undefined) coins.set(iid, [n, first, last, settled]);
      else {
        x[0] += n;
        x[1] = Math.min(x[1], first);
        x[2] = Math.max(x[2], last);
        if (settled >= 0 && (x[3] < 0 || settled < x[3])) x[3] = settled;
      }
    }
  const days = new Map<string, number>();
  for (const c of files)
    for (const [hour, n] of c.scan.byHour) {
      const day = new Date(hour).toISOString().slice(0, 10);
      days.set(day, (days.get(day) ?? 0) + n);
    }
  return {
    files: files.length,
    compressed: sum((c) => c.compressed),
    decoded: sum((c) => c.scan.decoded),
    lines: sum((c) => c.scan.lines),
    seen: sum((c) => c.scan.seen),
    classes,
    slowLines: sum((c) => c.scan.slowLines),
    slowRecords: sum((c) => c.scan.slowRecords),
    misread: sum((c) => c.scan.misread),
    dirs: summed(files.map((c) => c.scan.dirs)),
    takers: summed(files.map((c) => c.scan.takers)),
    unknownDirs: summed(files.map((c) => c.scan.unknownDirs)),
    unknownCoins: summed(files.map((c) => c.scan.unknownCoins)),
    /** [iid, kept, first time, last time, first Settlement time or -1]. */
    coins: [...coins]
      .sort((a, b) => a[0] - b[0])
      .map(([iid, c]) => [iid, ...c]),
    vaults: [...new Set(files.flatMap((c) => c.scan.vaults))].sort(),
    days: [...days].sort((a, b) => (a[0] < b[0] ? -1 : 1)),
    holes: holesOf(
      files.map((c) => c.scan.minutes),
      window.start,
      window.end,
    ),
  };
}
export type Counts = ReturnType<typeof countsOf>;
