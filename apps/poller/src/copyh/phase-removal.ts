/**
 * The removal phase, REMOVAL (copyh/rules.md C10; the engine's plan,
 * section 6), on engine.ts: a part is one coin. Its keys from every BUILD and
 * BUILD-L part (each part's file held once a process to its record, then
 * its coin's lines read by the index), a Monday at a time and by line
 * (MAIN, TEN, BROAD and DAY by the mask), each group through judge.ts's
 * `removalsOf`: the kit's `removalOf`, a trade between two members counted
 * once whichever bucket holds each record, read back at every minute that
 * holds one. The coin's removal tables are what PRICES reads for d's null.
 */
import { z } from "zod";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { partBytes, recordAt } from "./engine.js";
import { removalsOf, type Removal, type TradeKey } from "./judge.js";
import { LINES, type Line } from "./lines.js";
import { MASK, coinKeys, type Key } from "./phase-build.js";

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
export const RemovalInputs = z.object({
  code: z.string(),
  /** BUILD's and BUILD-L's records, by SHA-256 (none: BUILD-L had no part). */
  build: z.tuple([SHA256, SHA256.nullable()]),
  iid: z.number().int().min(0),
  mondays: z.array(z.number()),
});
export type RemovalInputs = z.infer<typeof RemovalInputs>;
/** Where REMOVAL reads: BUILD's and BUILD-L's phase folders. */
export const RemovalContext = z.object({
  build: z.string(),
  large: z.string(),
});

/** A coin's tables: [the Monday's index, the line, [[minute, trades left out]...] rising], by Monday, then in C7's order of lines. */
export const RemovalPart = z.object({
  iid: z.number(),
  tables: z.array(
    z.tuple([
      z.number(),
      z.enum(LINES),
      z.array(z.tuple([z.number(), z.number()])),
    ]),
  ),
});
export type RemovalPart = z.infer<typeof RemovalPart>;

/** REMOVAL's function (engine.ts `PartFunction`). */
export const removalPart: PartFunction = (inputs, ctx) => {
  const i = RemovalInputs.parse(inputs);
  const c = RemovalContext.parse(ctx.context);
  const byMonday = new Map<number, Key[]>();
  const add = (keys: readonly Key[]) => {
    for (const k of keys) {
      const list = byMonday.get(k[0]);
      if (list === undefined) byMonday.set(k[0], [k]);
      else list.push(k);
    }
  };
  add(coinKeys(c.build, recordAt(c.build, i.build[0]), i.iid));
  if (i.build[1] !== null)
    add(coinKeys(c.large, recordAt(c.large, i.build[1]), i.iid));
  const tables: RemovalPart["tables"] = [];
  for (const index of [...byMonday.keys()].sort((a, b) => a - b))
    for (const line of LINES) {
      const members: TradeKey[] = [];
      for (const [, mask, t, tid] of byMonday.get(index)!)
        if ((mask & MASK[line]) !== 0) members.push({ t, iid: i.iid, tid });
      if (members.length === 0) continue;
      const removal = removalsOf(ctx.kit, [members]).get(i.iid)!;
      tables.push([index, line, [...removal].sort((a, b) => a[0] - b[0])]);
    }
  return new TextEncoder().encode(
    JSON.stringify({ iid: i.iid, tables } satisfies RemovalPart),
  );
};

/** REMOVAL's parts: one a coin the BUILD phases hold. */
export const removalParts = (
  o: Omit<RemovalInputs, "iid">,
  coins: readonly number[],
): PartSpec[] =>
  coins.map((iid) => ({
    id: `c${String(iid).padStart(3, "0")}`,
    inputs: { ...o, iid } satisfies RemovalInputs,
  }));

/** A closed REMOVAL part's tables: by `<the Monday's index>|<line>`, each as the kit's null reads it (judge.ts `removedBy`). */
export function removalTablesOf(
  dir: string,
  record: PhaseRecord,
  iid: number,
): Map<string, Removal> {
  const part = RemovalPart.parse(
    JSON.parse(
      partBytes(dir, record, `c${String(iid).padStart(3, "0")}`).toString(
        "utf8",
      ),
    ),
  );
  return new Map(
    part.tables.map(([index, line, rows]) => [
      `${index}|${line satisfies Line}`,
      new Map(rows),
    ]),
  );
}
