/**
 * The two builds of a store held equal (copyh/rules.md C15, step 1, 2; the
 * exam's `matchExtraction` as the pattern): the two manifests equal but for
 * the run's own fields — when it was written, its seconds, its peaks and the
 * code's fingerprint — and every file the second names read back and held to
 * its line (integrity.ts's units), so that each is the first's byte for byte.
 * A difference stops the step (exit 7); nothing is repaired in code.
 */
import type { Manifest } from "./store.js";

/** The run's own fields, which two equal builds may differ in. */
const RUN_FIELDS = ["written", "seconds", "peaks", "code"] as const;

const canonical = (m: Manifest): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(m).filter(
      ([k]) => !RUN_FIELDS.includes(k as (typeof RUN_FIELDS)[number]),
    ),
  );

/** How two builds' manifests differ, but for the run's fields: the fields that differ, and each partition or file named differently (the first 100). */
export function manifestDifferences(a: Manifest, b: Manifest): string[] {
  const x = canonical(a);
  const y = canonical(b);
  const out: string[] = [];
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)]))
    if (k !== "partitions" && JSON.stringify(x[k]) !== JSON.stringify(y[k]))
      out.push(`the manifests' ${k} differ`);
  const key = (p: Manifest["partitions"][number]) =>
    `${p.table}/${p.key}/${p.month}`;
  const bs = new Map(b.partitions.map((p) => [key(p), p]));
  const as = new Map(a.partitions.map((p) => [key(p), p]));
  for (const [k, p] of as) {
    const q = bs.get(k);
    if (q === undefined) out.push(`${k}: only in the first build`);
    else if (JSON.stringify(p) !== JSON.stringify(q))
      out.push(`${k}: its rows or files differ`);
  }
  for (const k of bs.keys())
    if (!as.has(k)) out.push(`${k}: only in the second build`);
  if (a.partitions.map(key).join() !== b.partitions.map(key).join())
    out.push("the partitions are listed in another order");
  return out.slice(0, 100);
}
