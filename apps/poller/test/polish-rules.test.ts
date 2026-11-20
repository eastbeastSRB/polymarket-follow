/**
 * The exam's rules hold the design's numbers (polish/rules.md P17;
 * src/polish/exam/design.ts): the table at rules.md's end, row by row,
 * equal to the code's constants, no row missing or extra; the bars in P10's
 * prose; the headings P0 to P17 in order; each open option marked.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BARS,
  DELTA,
  DISCOVERY,
  K,
  LOOK2_END,
  M,
  NO_BOOK_DAYS,
  OPTIONS,
  PLACEBO,
  PLACEBO_JSON,
  RECIPE,
  SAFETY_NET,
  SEGMENTS,
  TEXTBOOK,
  THIN_CTXS_DAYS,
  TOO_FEW,
  WITHHELD_SHARE,
} from "../src/polish/exam/design.js";
import { PACKAGE_ROOT } from "../src/waveh/gate.js";

const RULES = readFileSync(
  path.join(PACKAGE_ROOT, "polish", "rules.md"),
  "utf8",
);
const iso = (t: number) => new Date(t).toISOString();
const bar = (b: { window: number; z: number; zL: number }) =>
  `${b.window} ${b.z} ${b.zL}`;

/** P17's table: each row's name and value. */
function tableOf(text: string): Record<string, string> {
  const at = text.indexOf("\n## P17.");
  if (at < 0) throw new Error("rules.md has no P17");
  const rows: Record<string, string> = {};
  for (const line of text.slice(at).split("\n")) {
    const m = /^\| (.+?) \| (.+?) \|$/.exec(line);
    if (m !== null && m[1] !== "Name") rows[m[1]!] = m[2]!;
  }
  return rows;
}

describe("the exam's rules (polish/rules.md)", () => {
  it("holds P17's table to design.ts, row by row, no row missing or extra", () => {
    expect(tableOf(RULES)).toEqual({
      M: String(M),
      K: String(K),
      "W4 deciding": String(RECIPE.deciding),
      "W4 N": String(RECIPE.n),
      "W4 beside": String(RECIPE.beside),
      "W4 quantiles": `${RECIPE.quantiles.n} ${RECIPE.quantiles.deciding} ${RECIPE.quantiles.beside}`,
      "B0's E entries": String(RECIPE.entriesOnE),
      "safety net days": String(SAFETY_NET.days),
      "safety net coins": String(SAFETY_NET.coins),
      "segment 1": `${iso(SEGMENTS[0].from)} ${iso(SEGMENTS[0].to)}`,
      "segment 2": `${iso(SEGMENTS[1].from)} ${iso(SEGMENTS[1].to)}`,
      discovery: `${iso(DISCOVERY.from)} ${iso(DISCOVERY.to)}`,
      "look 2 end": iso(LOOK2_END),
      delta: String(DELTA),
      "WITHHELD share": String(WITHHELD_SHARE),
      "TOO FEW days": String(TOO_FEW.days),
      "TOO FEW coins": String(TOO_FEW.coins),
      "placebo seed": String(PLACEBO.seed),
      "placebo draws": String(PLACEBO.draws),
      "placebo windows": PLACEBO.windows.join(" "),
      "floors, two looks": `${TEXTBOOK.twoLooks.holds} ${TEXTBOOK.twoLooks.likely}`,
      "look 1": bar(BARS[0]),
      "look 2": bar(BARS[1]),
      "placebo.json": PLACEBO_JSON,
      options: `${OPTIONS.noBookDays} ${OPTIONS.excess}`,
      "no-book days": NO_BOOK_DAYS.join(" "),
      "thin days": String(THIN_CTXS_DAYS.length),
    });
  });

  it("prints each bar in P10 (three decimals, a floor as it is), the headings P0 to P17 in order, and every open option marked", () => {
    for (const b of BARS)
      for (const [name, v] of [
        ["z", b.z],
        ["z_L", b.zL],
      ] as const)
        expect(
          RULES.includes(`**${name} = ${v.toFixed(3)}**`) ||
            RULES.includes(`**${name} = ${v}**`),
          `${name} ${v}`,
        ).toBe(true);
    expect([...RULES.matchAll(/^## (P\d+)\. /gm)].map((m) => m[1])).toEqual(
      Array.from({ length: 18 }, (_, i) => `P${i}`),
    );
    for (const option of ["[OPTION A", "[OPTION D, Q4]", "[OPTION E]"])
      expect(RULES).toContain(option);
    // The looks are two: no option of the looks (decisions 2026-11-20 `5f01f05`).
    expect(RULES).not.toContain("[OPTION C]");
    expect(RULES).not.toMatch(/one later look\*\*|\| one later look \|/);
  });
});
