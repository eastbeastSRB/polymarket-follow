/**
 * WAVE-H's coupling to the frozen programs (R4): the compiled imports of
 * `dist/waveh.js` reach exactly the gate's closure and the shared files; each
 * closure file is in MARKET-1's or the paper experiment's freeze and equals
 * it; and once a WAVE-H list exists, its lines for their files carry their
 * hashes, so a MARKET-1 or paper fix fails here, in the session that makes
 * it. Run in `pnpm verify`'s order: the build first.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CLOSURE, PACKAGE_ROOT } from "../src/waveh/gate.js";

const SHARED = ["dist/log.js", "dist/schedule.js"];
const read = (rel: string) => readFileSync(path.join(PACKAGE_ROOT, rel));
const listOf = (rel: string) => {
  const want = new Map<string, string>();
  for (const line of read(rel).toString("utf8").split("\n")) {
    const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
    if (m) want.set(m[2]!, m[1]!);
  }
  return want;
};
const frozen = ["market1/FROZEN.sha256", "experiment/FROZEN.sha256"].map(
  (f) => [f, listOf(f)] as const,
);

/** The repository files a compiled module's relative imports reach, itself included. */
function closureOf(start: string): Set<string> {
  const seen = new Set<string>();
  const todo = [start];
  while (todo.length > 0) {
    const rel = todo.pop()!;
    if (seen.has(rel)) continue;
    seen.add(rel);
    const text = read(rel).toString("utf8");
    for (const m of text.matchAll(
      /(?:import|export)\s[^;]*?from\s*"(\.{1,2}\/[^"]+)"|import\s*\(\s*"(\.{1,2}\/[^"]+)"\s*\)/g,
    )) {
      const spec = m[1] ?? m[2]!;
      todo.push(path.posix.join(path.posix.dirname(rel), spec));
    }
  }
  return seen;
}

describe("WAVE-H's closure (R4)", () => {
  it("reaches exactly the gate's closure, the shared files and its own", () => {
    const reached = [...closureOf("dist/waveh.js")].sort();
    const own = reached.filter(
      (f) => f === "dist/waveh.js" || f.startsWith("dist/waveh/"),
    );
    expect(own.length).toBeGreaterThan(10);
    expect(reached.filter((f) => !own.includes(f))).toEqual(
      [...CLOSURE, ...SHARED].sort(),
    );
  });

  it("holds each closure file in MARKET-1's or the paper experiment's freeze, equal to it", () => {
    for (const f of CLOSURE) {
      const got = createHash("sha256").update(read(f)).digest("hex");
      const naming = frozen.filter(([, list]) => list.has(f));
      expect(naming.length, f).toBeGreaterThan(0);
      for (const [name, list] of naming)
        expect(list.get(f), `${f} in ${name}`).toBe(got);
    }
  });

  for (const name of ["waveh/FROZEN.sha256", "waveh/FROZEN.draft.sha256"])
    it.runIf(existsSync(path.join(PACKAGE_ROOT, name)))(
      `${name}: its lines of MARKET-1's and the paper experiment's files carry their freezes' hashes`,
      () => {
        const mine = listOf(name);
        for (const f of CLOSURE) expect(mine.has(f), f).toBe(true);
        for (const [f, hash] of mine)
          for (const [other, list] of frozen)
            if (list.has(f)) expect(hash, `${f} in ${other}`).toBe(list.get(f));
      },
    );
});
