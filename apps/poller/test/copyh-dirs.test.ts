/**
 * COPY-H's dir values (src/copyh/dirs.ts; rules.md C3): `dirs.json`'s four
 * kinds, a value outside the list stopping the step, and the list's own
 * refusals, a kind other than the one C3 fixes for the text among them.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DirsFile, kindOf, kindsOf } from "../src/copyh/dirs.js";

describe("dirs.json", { timeout: 60_000 }, () => {
  const file = DirsFile.parse({
    rule: "test",
    dirs: [
      { dir: "Open Long", kind: "trade" },
      { dir: "Settlement", kind: "forced" },
      { dir: "Liquidated Cross Long", kind: "forced" },
      { dir: "Net Child Vaults", kind: "vault" },
      { dir: "Split Outcome", kind: "outcome" },
    ],
  });

  it("gives each listed dir its kind", () => {
    const kinds = kindsOf(file);
    expect(
      [
        "Open Long",
        "Settlement",
        "Liquidated Cross Long",
        "Net Child Vaults",
        "Split Outcome",
      ].map((d) => kindOf(kinds, d)),
    ).toEqual(["trade", "forced", "forced", "vault", "outcome"]);
  });

  it("stops on a value outside the list, case and spaces counting", () => {
    const kinds = kindsOf(file);
    for (const d of ["Auto-Deleveraging", "open long", "Open Long "])
      expect(() => kindOf(kinds, d), d).toThrow(
        `the dir ${JSON.stringify(d)} is not in dirs.json: a ruling gives it its kind`,
      );
  });

  it("refuses a value listed twice, a kind of its own, and an empty list", () => {
    for (const dirs of [
      [
        { dir: "Open Long", kind: "trade" },
        { dir: "Open Long", kind: "forced" },
      ],
      [{ dir: "Open Long", kind: "spot" }],
      [],
    ])
      expect(
        DirsFile.safeParse({ rule: "test", dirs }).success,
        JSON.stringify(dirs),
      ).toBe(false);
  });

  it("refuses a kind other than the one C3 fixes for the dir's text, and reads the committed list", () => {
    for (const [dir, kind] of [
      ["Net Child Vaults", "trade"],
      ["Open Long", "vault"],
      ["Auto-Deleveraging", "trade"],
      ["Settlement", "outcome"],
      ["Liquidated Isolated Short", "trade"],
      ["Close Short", "forced"],
    ] as const) {
      const r = DirsFile.safeParse({
        rule: "test",
        dirs: [
          { dir: "Open Short", kind: "trade" },
          { dir, kind },
        ],
      });
      expect(
        r.error?.issues.map((i) => [i.path, i.message]),
        `${dir} ${kind}`,
      ).toEqual([
        [["dirs"], "a dir's kind is not the one C3 fixes for its text"],
      ]);
    }
    const committed = DirsFile.parse(
      JSON.parse(
        readFileSync(new URL("../copyh/dirs.json", import.meta.url), "utf8"),
      ),
    );
    expect(committed.dirs.length).toBeGreaterThan(0);
  });
});
