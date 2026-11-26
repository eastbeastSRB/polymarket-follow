/**
 * COPY-H's `dir` values (copyh/rules.md C3, `dirs.json`): every `dir` of the
 * main-dex-shaped records, each with its kind, ruled from the value's text
 * alone — `trade` (a trader's own order), `forced` (ADL, Settlement, every
 * "Liquidated …": exits only), `vault` ("Net Child Vaults": its account is
 * left out, C2), `outcome` (an outcome-market operation, left out). The
 * kinds C3 fixes by the text are held: `vault` for "Net Child Vaults" alone,
 * `forced` for ADL, Settlement and every "Liquidated …" alone. The store
 * keeps each `dir` as written and reads its kind here; a main-dex-shaped
 * record whose `dir` is not in the list stops the step.
 */
import { z } from "zod";
import { ADL_DIR, SETTLEMENT_DIR, VAULT_DIR } from "./design.js";
import { StoreError } from "./run.js";

export const DIR_KINDS = ["trade", "forced", "vault", "outcome"] as const;
export type DirKind = (typeof DIR_KINDS)[number];

/** `dirs.json` (our own file: one that does not parse throws). */
export const DirsFile = z
  .object({
    rule: z.string(),
    dirs: z
      .array(z.object({ dir: z.string().min(1), kind: z.enum(DIR_KINDS) }))
      .min(1),
  })
  .refine((f) => new Set(f.dirs.map((d) => d.dir)).size === f.dirs.length, {
    message: "a dir is listed twice",
    path: ["dirs"],
  })
  .refine(
    (f) =>
      f.dirs.every(
        ({ dir, kind }) =>
          (dir === VAULT_DIR) === (kind === "vault") &&
          (dir === ADL_DIR ||
            dir === SETTLEMENT_DIR ||
            dir.startsWith("Liquidated ")) ===
            (kind === "forced"),
      ),
    {
      message: "a dir's kind is not the one C3 fixes for its text",
      path: ["dirs"],
    },
  );
export type DirsFile = z.infer<typeof DirsFile>;

/** Each listed `dir`'s kind. */
export const kindsOf = (f: DirsFile): ReadonlyMap<string, DirKind> =>
  new Map(f.dirs.map((d) => [d.dir, d.kind]));

/** A `dir`'s kind; a value outside the list stops the step. */
export function kindOf(
  kinds: ReadonlyMap<string, DirKind>,
  dir: string,
): DirKind {
  const k = kinds.get(dir);
  if (k === undefined)
    throw new StoreError(
      `the dir ${JSON.stringify(dir)} is not in dirs.json: a ruling gives it its kind`,
    );
  return k;
}
